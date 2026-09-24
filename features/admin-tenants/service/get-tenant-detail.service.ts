import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/features/company/schemas/company.schema";
import { userActiveDays } from "@/features/users/schemas/user-active-day.schema";
import { users } from "@/features/users/schemas/user.schema";
import { NotFoundError } from "@/lib/errors/not-found-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { appToday, appZone } from "@/lib/time-zone-sql";

import { ACTIVITY_TYPE, ActivityType } from "../constants/activity-type";
import { TenantDetail } from "../types/tenant-detail.type";
import { toIsoString } from "../utils/activity-dates";
import { toUsageStatus } from "../utils/usage-status";
import { activityEvents, userLastSeenAt } from "./activity-events";

const WEEKS_SHOWN = 12;

type UserRow = TenantDetail["users"][number];

type ActivityTypeRow = {
  type: ActivityType;
  last30Days: number;
  lastAt: string | null;
};

/**
 * One tenant's usage in depth. Cross-tenant: callers must have passed
 * requirePlatformAdmin(). Throws NotFoundError for an unknown company.
 */
export async function getTenantDetail(companyId: string): Promise<TenantDetail> {
  let company;
  let userRows: UserRow[];
  let typeRows: ActivityTypeRow[];
  let weeklyTransactions: TenantDetail["weeklyTransactions"];
  let activeDaysLast30: number;

  try {
    [[company], userRows, typeRows, weeklyTransactions, [{ activeDaysLast30 }]] =
      await Promise.all([
        db
          .select({
            name: companies.name,
            isActive: companies.isActive,
            createdAt: companies.createdAt,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
            contactPersonPhone: companies.contactPersonPhone,
          })
          .from(companies)
          .where(eq(companies.id, companyId))
          .limit(1),

        db.execute<UserRow>(sql`
          SELECT
            ${users.id} AS id,
            ${users.name} AS name,
            ${users.email} AS email,
            ${users.role} AS role,
            ${userLastSeenAt} AS "lastSeenAt",
            (
              SELECT COUNT(*)::int
              FROM ${userActiveDays}
              WHERE ${userActiveDays.userId} = ${users.id}
                AND ${userActiveDays.day} > ${appToday} - 30
            ) AS "activeDaysLast30"
          FROM ${users}
          LEFT JOIN auth.users auth_user ON auth_user.id = ${users.id}
          WHERE ${users.companyId} = ${companyId} AND ${users.isActive}
          ORDER BY "lastSeenAt" DESC NULLS LAST, ${users.name}
        `),

        db.execute<ActivityTypeRow>(sql`
          SELECT
            type,
            COUNT(*) FILTER (WHERE at >= now() - interval '30 days')::int AS "last30Days",
            MAX(at) AS "lastAt"
          FROM (${activityEvents}) a
          WHERE company_id = ${companyId}
          GROUP BY type
        `),

        db.execute<TenantDetail["weeklyTransactions"][number]>(sql`
          WITH events AS (
            SELECT at
            FROM (${activityEvents}) a
            WHERE company_id = ${companyId}
              AND at >= now() - make_interval(weeks => ${WEEKS_SHOWN})
          ),
          weeks AS (
            SELECT generate_series(
              date_trunc('week', now() AT TIME ZONE ${appZone}) - make_interval(weeks => ${WEEKS_SHOWN - 1}),
              date_trunc('week', now() AT TIME ZONE ${appZone}),
              interval '1 week'
            ) AS week_start
          )
          SELECT
            to_char(weeks.week_start, 'YYYY-MM-DD') AS "weekStart",
            COUNT(events.at)::int AS count
          FROM weeks
          LEFT JOIN events
            ON date_trunc('week', events.at AT TIME ZONE ${appZone}) = weeks.week_start
          GROUP BY weeks.week_start
          ORDER BY weeks.week_start
        `),

        db.execute<{ activeDaysLast30: number }>(sql`
          SELECT COUNT(DISTINCT ${userActiveDays.day})::int AS "activeDaysLast30"
          FROM ${userActiveDays}
          WHERE ${userActiveDays.companyId} = ${companyId}
            AND ${userActiveDays.day} > ${appToday} - 30
        `),
      ]);
  } catch (error) {
    mapDatabaseError(error);
  }

  if (!company) {
    throw new NotFoundError("Company not found");
  }

  const transactionsByType = Object.values(ACTIVITY_TYPE).map((type) => {
    const row = typeRows.find((typeRow) => typeRow.type === type);

    return {
      type,
      last30Days: row?.last30Days ?? 0,
      lastAt: toIsoString(row?.lastAt ?? null),
    };
  });

  const tenantUsers = userRows.map((user) => ({
    ...user,
    lastSeenAt: toIsoString(user.lastSeenAt),
  }));

  // Users come back most recently seen first.
  const lastSeenAt = tenantUsers[0]?.lastSeenAt ?? null;
  const lastUsedAt = latest([
    lastSeenAt,
    ...transactionsByType.map((transaction) => transaction.lastAt),
  ]);

  return {
    companyId,
    companyName: company.name,
    isActive: company.isActive,
    onboardedAt: company.createdAt.toISOString(),
    contact: {
      name: company.contactPersonName,
      email: company.contactPersonEmail,
      phone: company.contactPersonPhone,
    },
    status: toUsageStatus(lastUsedAt, Date.now()),
    lastSeenAt,
    lastUsedAt,
    activeDaysLast30,
    transactionsByType,
    weeklyTransactions: [...weeklyTransactions],
    users: tenantUsers,
  };
}

function latest(timestamps: (string | null)[]) {
  // ISO strings in one format sort chronologically.
  return (
    timestamps.filter((timestamp) => timestamp !== null).sort().at(-1) ?? null
  );
}

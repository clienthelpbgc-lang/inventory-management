import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/features/company/schemas/company.schema";
import { users } from "@/features/users/schemas/user.schema";
import { NotFoundError } from "@/lib/errors/not-found-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { ACTIVITY_TYPE, ActivityType } from "../constants/activity-type";
import { TenantDetail } from "../types/tenant-detail.type";
import { TIME_ZONE, toIsoString } from "../utils/activity-dates";
import { toUsageStatus } from "../utils/usage-status";
import { activityEvents } from "./activity-events";

const WEEKS_SHOWN = 12;

// Inlined rather than bound: the same zone appears in several expressions
// that Postgres must see as identical.
const zone = sql.raw(`'${TIME_ZONE}'`);

type UserRow = Omit<TenantDetail["users"][number], "lastLoginAt"> & {
  lastLoginAt: string | null;
};

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
  let weeklyActivity: TenantDetail["weeklyActivity"];

  try {
    [[company], userRows, typeRows, weeklyActivity] = await Promise.all([
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
          auth_user.last_sign_in_at AS "lastLoginAt"
        FROM ${users}
        LEFT JOIN auth.users auth_user ON auth_user.id = ${users.id}
        WHERE ${users.companyId} = ${companyId} AND ${users.isActive}
        ORDER BY auth_user.last_sign_in_at DESC NULLS LAST, ${users.name}
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

      db.execute<TenantDetail["weeklyActivity"][number]>(sql`
        WITH events AS (
          SELECT at
          FROM (${activityEvents}) a
          WHERE company_id = ${companyId}
            AND at >= now() - make_interval(weeks => ${WEEKS_SHOWN})
        ),
        weeks AS (
          SELECT generate_series(
            date_trunc('week', now() AT TIME ZONE ${zone}) - make_interval(weeks => ${WEEKS_SHOWN - 1}),
            date_trunc('week', now() AT TIME ZONE ${zone}),
            interval '1 week'
          ) AS week_start
        )
        SELECT
          to_char(weeks.week_start, 'YYYY-MM-DD') AS "weekStart",
          COUNT(events.at)::int AS count
        FROM weeks
        LEFT JOIN events
          ON date_trunc('week', events.at AT TIME ZONE ${zone}) = weeks.week_start
        GROUP BY weeks.week_start
        ORDER BY weeks.week_start
      `),
    ]);
  } catch (error) {
    mapDatabaseError(error);
  }

  if (!company) {
    throw new NotFoundError("Company not found");
  }

  const activityByType = Object.values(ACTIVITY_TYPE).map((type) => {
    const row = typeRows.find((typeRow) => typeRow.type === type);

    return {
      type,
      last30Days: row?.last30Days ?? 0,
      lastAt: toIsoString(row?.lastAt ?? null),
    };
  });

  const lastActivityAt =
    activityByType
      .map((activity) => activity.lastAt)
      .filter((lastAt) => lastAt !== null)
      .sort()
      .at(-1) ?? null;

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
    status: toUsageStatus(lastActivityAt, Date.now()),
    lastActivityAt,
    activityByType,
    weeklyActivity: [...weeklyActivity],
    users: userRows.map((user) => ({
      ...user,
      lastLoginAt: toIsoString(user.lastLoginAt),
    })),
  };
}

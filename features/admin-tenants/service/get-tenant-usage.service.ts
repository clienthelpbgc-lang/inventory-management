import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/features/company/schemas/company.schema";
import { userActiveDays } from "@/features/users/schemas/user-active-day.schema";
import { users } from "@/features/users/schemas/user.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { appToday } from "@/lib/time-zone-sql";

import { TenantUsage } from "../types/tenant-usage.type";
import { toIsoString } from "../utils/activity-dates";
import { toUsageStatus } from "../utils/usage-status";
import { activityEvents, userLastSeenAt } from "./activity-events";

type TenantUsageRow = Omit<TenantUsage, "status">;

/**
 * Usage summary for every tenant, least recently used first.
 * Cross-tenant: callers must have passed requirePlatformAdmin().
 *
 * "Used" means any signed-in request (users.last_seen_at, backed by the
 * Supabase sign-in time) or creating a transaction, whichever is later.
 * auth.users is readable over the direct DB connection.
 */
export async function getTenantUsage(): Promise<TenantUsage[]> {
  let rows: TenantUsageRow[];

  try {
    rows = await db.execute<TenantUsageRow>(sql`
      WITH transaction_agg AS (
        SELECT
          company_id,
          MAX(at) AS last_transaction_at,
          COUNT(*) FILTER (WHERE at >= now() - interval '7 days')::int AS last_7,
          COUNT(*) FILTER (WHERE at >= now() - interval '30 days')::int AS last_30
        FROM (${activityEvents}) a
        GROUP BY company_id
      ),
      user_agg AS (
        SELECT
          ${users.companyId} AS company_id,
          COUNT(*)::int AS active_users,
          COUNT(auth_user.last_sign_in_at)::int AS users_signed_in,
          MAX(${userLastSeenAt}) AS last_seen_at
        FROM ${users}
        LEFT JOIN auth.users auth_user ON auth_user.id = ${users.id}
        WHERE ${users.isActive}
        GROUP BY ${users.companyId}
      ),
      active_day_agg AS (
        SELECT
          ${userActiveDays.companyId} AS company_id,
          COUNT(DISTINCT ${userActiveDays.day})::int AS active_days
        FROM ${userActiveDays}
        WHERE ${userActiveDays.day} > ${appToday} - 30
        GROUP BY ${userActiveDays.companyId}
      )
      SELECT
        ${companies.id} AS "companyId",
        ${companies.name} AS "companyName",
        ${companies.isActive} AS "isActive",
        ${companies.createdAt} AS "onboardedAt",
        COALESCE(user_agg.active_users, 0) AS "activeUsers",
        COALESCE(user_agg.users_signed_in, 0) AS "usersSignedIn",
        user_agg.last_seen_at AS "lastSeenAt",
        transaction_agg.last_transaction_at AS "lastTransactionAt",
        GREATEST(user_agg.last_seen_at, transaction_agg.last_transaction_at) AS "lastUsedAt",
        COALESCE(active_day_agg.active_days, 0) AS "activeDaysLast30",
        COALESCE(transaction_agg.last_7, 0) AS "transactionsLast7Days",
        COALESCE(transaction_agg.last_30, 0) AS "transactionsLast30Days"
      FROM ${companies}
      LEFT JOIN user_agg ON user_agg.company_id = ${companies.id}
      LEFT JOIN transaction_agg ON transaction_agg.company_id = ${companies.id}
      LEFT JOIN active_day_agg ON active_day_agg.company_id = ${companies.id}
      ORDER BY "lastUsedAt" ASC NULLS FIRST, ${companies.name}
    `);
  } catch (error) {
    mapDatabaseError(error);
  }

  const now = Date.now();

  return rows.map((row) => {
    const lastUsedAt = toIsoString(row.lastUsedAt);

    return {
      ...row,
      onboardedAt: new Date(row.onboardedAt).toISOString(),
      lastSeenAt: toIsoString(row.lastSeenAt),
      lastTransactionAt: toIsoString(row.lastTransactionAt),
      lastUsedAt,
      status: toUsageStatus(lastUsedAt, now),
    };
  });
}

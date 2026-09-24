import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/features/company/schemas/company.schema";
import { users } from "@/features/users/schemas/user.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { TenantUsage } from "../types/tenant-usage.type";
import { toIsoString } from "../utils/activity-dates";
import { toUsageStatus } from "../utils/usage-status";
import { activityEvents } from "./activity-events";

type TenantUsageRow = Omit<TenantUsage, "status">;

/**
 * Usage summary for every tenant, least recently active first.
 * Cross-tenant: callers must have passed requirePlatformAdmin().
 *
 * Activity is the creation of a sale, purchase, return or process order.
 * Last login comes from Supabase's auth.users, which the direct DB
 * connection can read.
 */
export async function getTenantUsage(): Promise<TenantUsage[]> {
  let rows: TenantUsageRow[];

  try {
    rows = await db.execute<TenantUsageRow>(sql`
      WITH activity AS (${activityEvents}),
      activity_agg AS (
        SELECT
          company_id,
          MAX(at) AS last_activity_at,
          COUNT(*) FILTER (WHERE at >= now() - interval '7 days')::int AS last_7,
          COUNT(*) FILTER (WHERE at >= now() - interval '30 days')::int AS last_30
        FROM activity
        GROUP BY company_id
      ),
      user_agg AS (
        SELECT
          ${users.companyId} AS company_id,
          COUNT(*)::int AS active_users,
          COUNT(auth_user.last_sign_in_at)::int AS users_signed_in,
          MAX(auth_user.last_sign_in_at) AS last_login_at
        FROM ${users}
        LEFT JOIN auth.users auth_user ON auth_user.id = ${users.id}
        WHERE ${users.isActive}
        GROUP BY ${users.companyId}
      )
      SELECT
        ${companies.id} AS "companyId",
        ${companies.name} AS "companyName",
        ${companies.isActive} AS "isActive",
        ${companies.createdAt} AS "onboardedAt",
        COALESCE(user_agg.active_users, 0) AS "activeUsers",
        COALESCE(user_agg.users_signed_in, 0) AS "usersSignedIn",
        user_agg.last_login_at AS "lastLoginAt",
        activity_agg.last_activity_at AS "lastActivityAt",
        COALESCE(activity_agg.last_7, 0) AS "activityLast7Days",
        COALESCE(activity_agg.last_30, 0) AS "activityLast30Days"
      FROM ${companies}
      LEFT JOIN user_agg ON user_agg.company_id = ${companies.id}
      LEFT JOIN activity_agg ON activity_agg.company_id = ${companies.id}
      ORDER BY activity_agg.last_activity_at ASC NULLS FIRST, ${companies.name}
    `);
  } catch (error) {
    mapDatabaseError(error);
  }

  const now = Date.now();

  return rows.map((row) => {
    const lastActivityAt = toIsoString(row.lastActivityAt);

    return {
      ...row,
      onboardedAt: new Date(row.onboardedAt).toISOString(),
      lastLoginAt: toIsoString(row.lastLoginAt),
      lastActivityAt,
      status: toUsageStatus(lastActivityAt, now),
    };
  });
}

import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/features/company/schemas/company.schema";
import { processOrders } from "@/features/process-order/schemas/process-orders.schema";
import { purchases } from "@/features/purchase/schemas/purchase.schema";
import { saleReturns } from "@/features/returns/schemas/sale-return.schema";
import { sales } from "@/features/sales/schemas/sales.schema";
import { users } from "@/features/users/schemas/user.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import {
  ACTIVE_WITHIN_DAYS,
  LOW_USAGE_WITHIN_DAYS,
  TENANT_USAGE_STATUS,
  TenantUsageStatus,
} from "../constants/tenant-usage-status";
import { TenantUsage } from "../types/tenant-usage.type";

// The postgres-js driver leaves timestamps as Postgres-formatted strings in raw
// queries, e.g. "2026-09-23 06:51:30.078+00".
type TenantUsageRow = Omit<TenantUsage, "status">;

const DAY_MS = 24 * 60 * 60 * 1000;

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
      WITH activity AS (
        SELECT ${sales.companyId} AS company_id, ${sales.createdAt}::timestamptz AS at FROM ${sales}
        UNION ALL
        SELECT ${purchases.companyId}, ${purchases.createdAt}::timestamptz FROM ${purchases}
        UNION ALL
        SELECT ${saleReturns.companyId}, ${saleReturns.createdAt} FROM ${saleReturns}
        UNION ALL
        SELECT ${processOrders.companyId}, ${processOrders.createdAt} FROM ${processOrders}
      ),
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

function toIsoString(timestamp: string | null) {
  return timestamp ? new Date(timestamp).toISOString() : null;
}

function toUsageStatus(
  lastActivityAt: string | null,
  now: number,
): TenantUsageStatus {
  if (!lastActivityAt) return TENANT_USAGE_STATUS.NEVER_USED;

  const idleDays = (now - Date.parse(lastActivityAt)) / DAY_MS;

  if (idleDays <= ACTIVE_WITHIN_DAYS) return TENANT_USAGE_STATUS.ACTIVE;
  if (idleDays <= LOW_USAGE_WITHIN_DAYS) return TENANT_USAGE_STATUS.LOW_USAGE;

  return TENANT_USAGE_STATUS.INACTIVE;
}

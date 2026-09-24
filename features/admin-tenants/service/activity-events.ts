import "server-only";

import { sql } from "drizzle-orm";

import { processOrders } from "@/features/process-order/schemas/process-orders.schema";
import { purchases } from "@/features/purchase/schemas/purchase.schema";
import { saleReturns } from "@/features/returns/schemas/sale-return.schema";
import { sales } from "@/features/sales/schemas/sales.schema";
import { users } from "@/features/users/schemas/user.schema";

import { ACTIVITY_TYPE } from "../constants/activity-type";

/**
 * Every transaction a tenant creates, as rows of (company_id, type, at).
 * Use as a subquery: `FROM (${activityEvents}) a`.
 *
 * sales and purchases store created_at without a time zone; the cast reads
 * them as UTC, which is the database session's zone.
 */
export const activityEvents = sql`
  SELECT ${sales.companyId} AS company_id, ${ACTIVITY_TYPE.SALE}::text AS type, ${sales.createdAt}::timestamptz AS at FROM ${sales}
  UNION ALL
  SELECT ${purchases.companyId}, ${ACTIVITY_TYPE.PURCHASE}::text, ${purchases.createdAt}::timestamptz FROM ${purchases}
  UNION ALL
  SELECT ${saleReturns.companyId}, ${ACTIVITY_TYPE.RETURN}::text, ${saleReturns.createdAt} FROM ${saleReturns}
  UNION ALL
  SELECT ${processOrders.companyId}, ${ACTIVITY_TYPE.PROCESS_ORDER}::text, ${processOrders.createdAt} FROM ${processOrders}
`;

/**
 * A user's last signed-in use. last_seen_at only exists from when tracking
 * began, so the Supabase sign-in time fills in for older use.
 * Expects `auth.users` joined as `auth_user`.
 */
export const userLastSeenAt = sql`GREATEST(${users.lastSeenAt}, auth_user.last_sign_in_at)`;

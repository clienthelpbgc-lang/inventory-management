import { quantityColumn } from "@/lib/quantity";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  PURCHASE_REQUEST_STATUS,
  PurchaseRequestStatus,
} from "../constants/purchase-request-status";

export const purchaseRequestStatusEnum = pgEnum(
  "purchase_request_status",
  Object.values(PURCHASE_REQUEST_STATUS) as [string, ...string[]],
);

export const purchaseRequests = pgTable(
  "purchase_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").notNull(),
    purchaseRequestNumber: text("purchase_request_number").notNull(),
    status: purchaseRequestStatusEnum("status")
      .$type<PurchaseRequestStatus>()
      .notNull()
      .default(PURCHASE_REQUEST_STATUS.PENDING_APPROVAL),
    remarks: text("remarks"),
    totalItems: integer("total_items").notNull(),
    totalRequestedQty: quantityColumn("total_requested_qty").notNull(),
    createdByUserId: uuid("created_by_user_id").notNull(),
    processedByUserId: uuid("processed_by_user_id"),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("purchase_requests_company_id_idx").on(table.companyId),
    index("purchase_requests_created_by_user_id_idx").on(table.createdByUserId),
    unique("purchase_requests_company_pr_no_unique").on(
      table.companyId,
      table.purchaseRequestNumber,
    ),
  ],
);

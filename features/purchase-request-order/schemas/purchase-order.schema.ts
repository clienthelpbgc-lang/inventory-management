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

import { PURCHASE_ORDER_STATUS } from "../constants/purchase-order-status";

export const purchaseOrderStatusEnum = pgEnum(
  "purchase_order_status",
  Object.values(PURCHASE_ORDER_STATUS) as [string, ...string[]],
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").notNull(),
    purchaseOrderNumber: text("purchase_order_number").notNull(),
    purchaseRequestId: uuid("purchase_request_id").notNull(),
    supplierId: uuid("supplier_id").notNull(),
    status: purchaseOrderStatusEnum("status")
      .notNull()
      .default(PURCHASE_ORDER_STATUS.EMAIL_PENDING),
    remarks: text("remarks"),
    totalItems: integer("total_items").notNull(),
    totalOrderedQty: quantityColumn("total_ordered_qty").notNull(),
    createdByUserId: uuid("created_by_user_id").notNull(),
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
    index("purchase_orders_company_id_idx").on(table.companyId),
    index("purchase_orders_purchase_request_id_idx").on(
      table.purchaseRequestId,
    ),
    index("purchase_orders_supplier_id_idx").on(table.supplierId),
     unique("purchase_order_company_pr_no_unique").on(
      table.companyId,
      table.purchaseOrderNumber,
    ),
  ],
);

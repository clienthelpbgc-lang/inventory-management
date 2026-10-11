import { quantityColumn } from "@/lib/quantity";
import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  PURCHASE_REQUEST_ITEM_STATUS,
  PurchaseRequestItemStatus,
} from "../constants/purchase-request-item-status";

export const purchaseRequestItemStatusEnum = pgEnum(
  "purchase_request_item_status",
  Object.values(PURCHASE_REQUEST_ITEM_STATUS) as [string, ...string[]],
);

export const purchaseRequestItems = pgTable(
  "purchase_request_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseRequestId: uuid("purchase_request_id").notNull(),
    productId: uuid("product_id").notNull(),
    requestedQty: quantityColumn("requested_qty").notNull(),
    approvedQty: quantityColumn("approved_qty"),
    status: purchaseRequestItemStatusEnum("status")
      .$type<PurchaseRequestItemStatus>()
      .notNull()
      .default(PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL),
    supplierId: uuid("supplier_id"),
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
    index("purchase_request_items_purchase_request_id_idx").on(
      table.purchaseRequestId,
    ),
    index("purchase_request_items_supplier_id_idx").on(table.supplierId),
  ],
);

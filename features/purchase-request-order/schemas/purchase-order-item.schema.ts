import { quantityColumn } from "@/lib/quantity";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseOrderId: uuid("purchase_order_id").notNull(),
    purchaseRequestItemId: uuid("purchase_request_item_id").notNull(),
    productId: uuid("product_id").notNull(),
    orderedQty: quantityColumn("ordered_qty").notNull(),
    receivedQty: quantityColumn("received_qty").notNull().default(0),
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
    index("purchase_order_items_purchase_order_id_idx").on(
      table.purchaseOrderId,
    ),
  ],
);



import { quantityColumn } from "@/lib/quantity";
import {
  index,
  numeric,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "@/features/product/schemas/product.schema";
import { purchases } from "./purchase.schema";

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseId: uuid("purchase_id")
      .references(() => purchases.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    quantity: quantityColumn("quantity").notNull(),
    purchasePrice: numeric("purchase_price", {
      precision: 12,
      scale: 2,
    }).notNull(),
    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("purchase_items_purchase_idx").on(table.purchaseId),
    index("purchase_items_product_idx").on(table.productId),
    uniqueIndex("purchase_items_purchase_product_idx").on(
      table.purchaseId,
      table.productId,
    ),
  ],
);

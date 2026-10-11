import { quantityColumn } from "@/lib/quantity";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { products } from "@/features/product/schemas/product.schema";
import { saleItems } from "@/features/sales/schemas/sales-item.schema";

import { saleReturns } from "./sale-return.schema";

export const saleReturnItems = pgTable(
  "sale_return_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    saleReturnId: uuid("sale_return_id")
      .references(() => saleReturns.id)
      .notNull(),

    saleItemId: uuid("sale_item_id")
      .references(() => saleItems.id)
      .notNull(),

    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),

    quantity: quantityColumn("quantity").notNull(),

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
    index("sale_return_items_sale_return_id_idx").on(table.saleReturnId),
    index("sale_return_items_sale_item_id_idx").on(table.saleItemId),
    index("sale_return_items_product_id_idx").on(table.productId),
  ],
);

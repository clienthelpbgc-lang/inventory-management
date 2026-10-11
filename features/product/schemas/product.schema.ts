import { quantityColumn } from "@/lib/quantity";
import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/db/schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    unit: text("unit").notNull(),
    minOrderQty: quantityColumn("min_order_qty").default(0).notNull(),
    maxOrderQty: quantityColumn("max_order_qty").default(1).notNull(),
    reorderQty: quantityColumn("reorder_qty").default(0).notNull(),
    openingStock: quantityColumn("opening_stock").default(0).notNull(),
    currentStock: quantityColumn("current_stock").default(0).notNull(),
    unitCost: numeric("unit_cost"),
    location: text("location"),
    images: text("images")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    stockMovement: text("stock_movement"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("products_company_idx").on(table.companyId),
    companyNameIdx: index("products_company_name_idx").on(
      table.companyId,
      table.name,
    ),
    companyNameCategoryUnique: uniqueIndex(
      "products_company_name_category_unique_idx",
    ).on(
      table.companyId,
      sql`lower(trim(${table.name}))`,
      sql`lower(trim(${table.category}))`,
    ),
    imagesMaxCountCheck: check(
      "products_images_max_count_check",
      sql`array_length(${table.images}, 1) IS NULL OR array_length(${table.images}, 1) <= 5`,
    ),
  }),
);

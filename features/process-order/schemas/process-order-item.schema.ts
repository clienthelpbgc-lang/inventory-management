import { quantityColumn } from "@/lib/quantity";
import {
  pgTable,
  uuid,
  numeric,
  varchar,
  timestamp,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { processOrders } from "./process-orders.schema";
import { products } from "@/db/schema";
import {
  PROCESS_ORDER_ITEM_STATUS,
  ProcessOrderItemStatus,
} from "../constants/process-order-item-status";

export const processOrderItems = pgTable("process_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  processOrderId: uuid("process_order_id")
    .notNull()
    .references(() => processOrders.id, {
      onDelete: "cascade",
    }),

  sentProductId: uuid("sent_product_id")
    .notNull()
    .references(() => products.id, {
      onDelete: "restrict",
    }),

  receivedProductId: uuid("received_product_id")
    .notNull()
    .references(() => products.id, {
      onDelete: "restrict",
    }),

  sentQty: quantityColumn("sent_qty").notNull(),

  receivedQty: quantityColumn("received_qty"),

  sentDate: timestamp("sent_date", {
    withTimezone: true,
  }).notNull(),

  receivedDate: timestamp("received_date", {
    withTimezone: true,
  }),

  processingCost: numeric("processing_cost", {
    precision: 12,
    scale: 2,
    mode: "number",
  }),

  location: varchar("location", {
    length: 255,
  }),

  status: text("status")
    .$type<ProcessOrderItemStatus>()
    .notNull()
    .default(PROCESS_ORDER_ITEM_STATUS.SENT),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

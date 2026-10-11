import { quantityColumn } from "@/lib/quantity";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies, sales, users } from "@/db/schema";

import { SALE_RETURN_STATUS, SaleReturnStatus } from "../constants/sale-return-status";

export const saleReturnStatusEnum = pgEnum(
  "sale_return_status",
  Object.values(SALE_RETURN_STATUS) as [string, ...string[]],
);

export const saleReturns = pgTable(
  "sale_returns",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),

    saleId: uuid("sale_id")
      .references(() => sales.id)
      .notNull(),

    returnNumber: text("return_number").notNull(),

    returnDate: date("return_date").notNull(),

    reason: text("reason"),

    status: saleReturnStatusEnum("status")
      .$type<SaleReturnStatus>()
      .notNull()
      .default(SALE_RETURN_STATUS.PENDING_APPROVAL),

    totalItems: integer("total_items").notNull(),

    totalReturnedQty: quantityColumn("total_returned_qty").notNull(),

    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),

    approvedByUserId: uuid("approved_by_user_id").references(() => users.id),

    approvedAt: timestamp("approved_at", {
      withTimezone: true,
    }),

    rejectionReason: text("rejection_reason"),

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
    index("sale_returns_company_id_idx").on(table.companyId),
    index("sale_returns_sale_id_idx").on(table.saleId),
    index("sale_returns_status_idx").on(table.status),
    index("sale_returns_company_created_at_idx").on(
      table.companyId,
      table.createdAt,
    ),
    uniqueIndex("sale_returns_company_return_number_uidx").on(
      table.companyId,
      table.returnNumber,
    ),
  ],
);

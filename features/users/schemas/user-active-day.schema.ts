import { date, index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schemas/company.schema";

import { users } from "./user.schema";

/**
 * One row per user per day (in APP_TIME_ZONE) on which they used the app.
 * Usage history that survives records being deleted. Server-only (RLS on).
 */
export const userActiveDays = pgTable(
  "user_active_days",
  {
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    day: date("day").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.day] }),
    index("user_active_days_company_day_idx").on(table.companyId, table.day),
  ],
).enableRLS();

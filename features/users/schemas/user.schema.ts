import { companies } from "@/features/company/schemas/company.schema";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { ROLES, UserRole } from "../../auth/constants/user-role";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").$type<UserRole>().notNull().default(ROLES.STORE_ADMIN),
  isActive: boolean("is_active").notNull().default(true),
  /** Last authenticated request, refreshed at most every 15 minutes. */
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
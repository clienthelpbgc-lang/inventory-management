import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Platform admins (us, not tenants). `id` is the Supabase auth user id.
 * Mirrors the table as it was first created by hand in Supabase. Any row
 * grants admin access; `role` isn't checked.
 */
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  role: varchar("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

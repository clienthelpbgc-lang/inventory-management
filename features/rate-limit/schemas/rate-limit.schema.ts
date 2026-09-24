import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Fixed-window counters, one row per limiter key. Lives in Postgres because
 * the app runs on serverless functions, where in-memory counters aren't shared
 * between instances. RLS is on with no policies, so it is server-only.
 */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();

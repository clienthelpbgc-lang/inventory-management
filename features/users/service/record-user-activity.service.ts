import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { toAppDate } from "@/lib/time-zone";
import { appToday } from "@/lib/time-zone-sql";

import { userActiveDays } from "../schemas/user-active-day.schema";
import { users } from "../schemas/user.schema";

const REFRESH_AFTER_MS = 15 * 60 * 1000;

/**
 * Whether this request should be recorded: last_seen_at is refreshed at most
 * every 15 minutes, and always on a user's first request of the day so that
 * day is never missed. Deciding here keeps most requests write-free.
 */
export function shouldRecordUserActivity(lastSeenAt: Date | null, now: Date) {
  if (!lastSeenAt) return true;

  return (
    now.getTime() - lastSeenAt.getTime() >= REFRESH_AFTER_MS ||
    toAppDate(lastSeenAt) !== toAppDate(now)
  );
}

/** Idempotent, so concurrent requests recording the same visit are harmless. */
export async function recordUserActivity(userId: string, companyId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ lastSeenAt: sql`now()` })
      .where(eq(users.id, userId));

    await tx
      .insert(userActiveDays)
      .values({ userId, companyId, day: appToday })
      .onConflictDoNothing();
  });
}

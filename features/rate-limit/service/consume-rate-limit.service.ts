import "server-only";

import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { RateLimitError } from "@/lib/errors/rate-limit-error";

import { rateLimits } from "../schemas/rate-limit.schema";

type RateLimitOptions = {
  /** Namespaced identity, e.g. `forgot-password:ip:1.2.3.4`. */
  key: string;
  limit: number;
  windowSeconds: number;
};

const CLEANUP_PROBABILITY = 0.02;
const STALE_AFTER_SECONDS = 60 * 60 * 24;

/** Hash identifiers that are personal data (emails) before they become keys. */
export function hashRateLimitIdentifier(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Counts one hit against `key` and throws RateLimitError (429) once it exceeds
 * `limit` within the window. The upsert is a single atomic statement, so
 * concurrent requests can't slip past the limit.
 *
 * Fails open: if the database is unreachable, the request is allowed and the
 * error is logged, so a limiter outage can't lock users out of password reset.
 */
export async function consumeRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions) {
  let count: number;

  try {
    const expired = sql`${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds})`;

    const [row] = await db
      .insert(rateLimits)
      .values({ key, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE WHEN ${expired} THEN 1 ELSE ${rateLimits.count} + 1 END`,
          windowStart: sql`CASE WHEN ${expired} THEN now() ELSE ${rateLimits.windowStart} END`,
        },
      })
      .returning({ count: rateLimits.count });

    count = row.count;

    if (Math.random() < CLEANUP_PROBABILITY) {
      void db
        .delete(rateLimits)
        .where(
          lt(
            rateLimits.windowStart,
            sql`now() - make_interval(secs => ${STALE_AFTER_SECONDS})`,
          ),
        )
        .catch(() => {});
    }
  } catch (error) {
    console.error("[rate-limit] check failed, allowing request", error);
    return;
  }

  if (count > limit) {
    throw new RateLimitError("Too many requests. Please try again later.");
  }
}

/** Best-effort client IP behind Netlify / a reverse proxy. */
export function getClientIp(request: Request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

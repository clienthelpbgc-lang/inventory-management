import "server-only";

import { timingSafeEqual } from "node:crypto";

import { AuthorizationError } from "@/lib/errors";

/**
 * Guards scheduler-only endpoints. Fails closed: with CRON_SECRET unset,
 * comparing against `Bearer ${undefined}` would let "Bearer undefined" in.
 */
export function assertCronSecret(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    throw new AuthorizationError("Cron secret is not configured");
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");

  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    throw new AuthorizationError("Invalid cron secret");
  }
}

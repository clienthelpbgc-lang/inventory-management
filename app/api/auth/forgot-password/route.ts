import { NextRequest } from "next/server";
import z from "zod";

import {
  consumeRateLimit,
  getClientIp,
  hashRateLimitIdentifier,
} from "@/features/rate-limit/service/consume-rate-limit.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { generatePasswordResetToken } from "@/features/auth/service/generate-password-reset-token.service";
import { sendPasswordResetEmail } from "@/features/auth/service/send-password-reset-email.service";

const IP_LIMIT = 10;
const EMAIL_LIMIT = 3;
const WINDOW_SECONDS = 60 * 60;

const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const POST = routeHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email } = forgotPasswordSchema.parse(body);

  const normalizedEmail = email.trim().toLowerCase();

  // Limits apply whether or not the account exists, so the 429 can't be used
  // to probe for registered emails.
  await consumeRateLimit({
    key: `forgot-password:ip:${getClientIp(request)}`,
    limit: IP_LIMIT,
    windowSeconds: WINDOW_SECONDS,
  });
  await consumeRateLimit({
    key: `forgot-password:email:${hashRateLimitIdentifier(normalizedEmail)}`,
    limit: EMAIL_LIMIT,
    windowSeconds: WINDOW_SECONDS,
  });

  const hashedToken = await generatePasswordResetToken(normalizedEmail);

  if (hashedToken) {
    const confirmLink = `${request.nextUrl.origin}/auth/confirm?token_hash=${hashedToken}&type=recovery&next=${encodeURIComponent("/reset-password")}`;

    await sendPasswordResetEmail(normalizedEmail, confirmLink);
  }

  return {
    message: "If an account exists for this email, a reset link has been sent",
  };
});

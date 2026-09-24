import { sendSupportEmail } from "@/features/email/service/send-support-email.service";
import { supportSchema } from "@/features/email/validations/support-email.validation";
import { consumeRateLimit } from "@/features/rate-limit/service/consume-rate-limit.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

const SUPPORT_LIMIT = 5;
const SUPPORT_WINDOW_SECONDS = 60 * 60;

export const POST = routeHandler(async (request) => {
  // Sends mail from our account, so it's for signed-in tenants only and
  // limited per user.
  const { id } = await getCurrentUser();

  await consumeRateLimit({
    key: `support:user:${id}`,
    limit: SUPPORT_LIMIT,
    windowSeconds: SUPPORT_WINDOW_SECONDS,
  });

  const data = await validateRequest(request, supportSchema);
  await sendSupportEmail(data);
});

import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  return requirePlatformAdmin();
});

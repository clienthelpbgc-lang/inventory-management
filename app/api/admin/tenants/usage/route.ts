import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { getTenantUsage } from "@/features/admin-tenants/service/get-tenant-usage.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  await requirePlatformAdmin();
  return getTenantUsage();
});

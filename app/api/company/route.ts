import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { getCompanies } from "@/features/company/service/get-companies.service";
import { onboardCompany } from "@/features/company/service/onboard-company.service";
import { onBoardCompanySchema } from "@/features/company/validations/company.validation";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { validateRequest } from "@/lib/route-helpers/validate-request";

// Cross-tenant: platform admins only.
export const GET = routeHandler(async () => {
  await requirePlatformAdmin();
  return getCompanies();
});

export const POST = routeHandler(async (request) => {
  await requirePlatformAdmin();
  const data = await validateRequest(request, onBoardCompanySchema);
  return onboardCompany(data);
});

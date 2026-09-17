import { parseSaleQueryParams } from "@/features/sales/query/sale.query";
import { getSalesForExport } from "@/features/sales/service/get-sales-for-export.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parseSaleQueryParams(searchParams);

  return getSalesForExport(companyId, filters);
});

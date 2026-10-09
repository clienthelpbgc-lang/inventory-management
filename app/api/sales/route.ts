import { parseSaleQueryParams } from "@/features/sales/query/sale.query";
import { createSale } from "@/features/sales/service/create-sale.service";
import { getSales } from "@/features/sales/service/get-sales/get-sales.service";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { readMultipartPayload } from "@/lib/route-helpers/read-multipart-payload";
import { CreateSaleFormSchema } from "@/features/sales/validations/sales.validation";

export const POST = routeHandler(async (request) => {
  const { companyId, id } = await getCurrentUser();
  const { formData, payload } = await readMultipartPayload(request);
  const image = formData.get("image");

  const data = CreateSaleFormSchema.parse({
    ...payload,
    image: image instanceof File ? image : null,
  });

  return createSale(data, companyId, id);
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parseSaleQueryParams(searchParams);

  return getSales(companyId, {
    ...filters,
  });
});

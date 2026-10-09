import { parsePurchaseQueryParams } from "@/features/purchase/query/purchase.query";
import { createPurchase } from "@/features/purchase/service/create-purchase.service";
import { getPurchases } from "@/features/purchase/service/get-purchases.service";
import { CreatePurchaseFormSchema } from "@/features/purchase/validations/purchase.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import { readMultipartPayload } from "@/lib/route-helpers/read-multipart-payload";

export const POST = routeHandler(async (request) => {
  const { companyId, id } = await getCurrentUser();
  const { formData, payload } = await readMultipartPayload(request);
  const image = formData.get("image");

  const data = CreatePurchaseFormSchema.parse({
    ...payload,
    image: image instanceof File ? image : null,
  });

  return createPurchase(data, companyId, id);
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();

  const { searchParams } = new URL(request.url);

  const filters = parsePurchaseQueryParams(searchParams);

  return getPurchases(companyId, {
    ...filters,
  });
});

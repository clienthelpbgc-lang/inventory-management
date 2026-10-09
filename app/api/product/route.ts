import { parseProductQueryParams } from "@/features/product/query/parse-product-query";
import { createProduct } from "@/features/product/service/create-product.service";
import { getProducts } from "@/features/product/service/get-products.service";
import { CreateProductFormType } from "@/features/product/types/product.types";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { readMultipartPayload } from "@/lib/route-helpers/read-multipart-payload";
import {
  routeHandler,
} from "@/lib/route-helpers/route-handlers";

export const POST = routeHandler(async (request) => {
  const { formData, payload } = await readMultipartPayload(request);

  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File);
  const { companyId } = await getCurrentUser();
  return createProduct(
    {
      ...(payload as Omit<CreateProductFormType, "images">),
      images,
    },
    companyId,
  );
});

export const GET = routeHandler(async (request) => {
  const { companyId } = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const filters = parseProductQueryParams(searchParams);
  return getProducts(companyId, filters);
});

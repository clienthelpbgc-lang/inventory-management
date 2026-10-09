import { readMultipartPayload } from "@/lib/route-helpers/read-multipart-payload";
import { ZodError } from "zod";

import { getCompanyById } from "@/features/company/service/get-company.service";
import { updateCompany } from "@/features/company/service/update-company.service";
import { updateCompanyFormSchema } from "@/features/company/validations/company.validation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { assertPermission } from "@/features/auth/constants/permissions";
import { ValidationError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handlers";

export const GET = routeHandler(async () => {
  const { companyId } = await getCurrentUser();
  return getCompanyById(companyId);
});

export const PATCH = routeHandler(async (request) => {
  const { companyId, role } = await getCurrentUser();

  assertPermission(role, "company:update");

  const { formData, payload } = await readMultipartPayload(request);

  const logo = formData.get("logo");

  let data;
  try {
    data = updateCompanyFormSchema.parse({
      ...payload,
      logoUrl: logo instanceof File ? logo : payload.logoUrl,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error.issues[0]?.message ?? "Invalid company details");
    }
    throw error;
  }

  return updateCompany(companyId, data);
});

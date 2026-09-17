import { GetSalesParams } from "../types/sales.type";
import { buildSalesQuery } from "./get-sales/build-sales.query.service";

export async function getSalesForExport(
  companyId: string,
  filters: GetSalesParams = {},
) {
  return buildSalesQuery(companyId, filters);
}

import { db } from "@/db";
import { sales, saleItems } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { GetSalesParams } from "../../types/sales.type";
import { buildSaleFiltersAndSorting } from "./build-sales-filter-sorting.service";

export function buildSalesQuery(
  companyId: string,
  params: GetSalesParams = {},
) {
  const { whereClause, orderBy } =
    buildSaleFiltersAndSorting(companyId, params);

  return db
    .select({
      id: sales.id,
      saleNumber: sales.saleNumber,
      saleDate: sales.saleDate,
      soldTo: sales.soldTo,
      grandTotal: sales.grandTotal,
      createdAt: sales.createdAt,
      itemsCount: sql<number>`COUNT(${saleItems.id})`,
    })
    .from(sales)
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(whereClause)
    .groupBy(sales.id)
    .orderBy(orderBy);
}
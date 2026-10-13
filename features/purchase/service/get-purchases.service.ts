import "server-only";

import { and, asc, count, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "../schemas/purchase.schema";
import { purchaseItems } from "../schemas/purchase-item.schema";
import { suppliers } from "@/features/suppliers/schemas/supplier.schema";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { GetPurchasesParams } from "../types/purchase.type";
import { buildPurchasesQuery } from "./build-purchase-query.service";
import { buildPurchaseFiltersAndSorting } from "./build-purchase-filter.service";

export async function getPurchases(
  companyId: string,
  {
    page = DEFAULT_PAGE,
    ...filters
  }: GetPurchasesParams = {},
) {
  const data = await buildPurchasesQuery(
    companyId,
    filters,
  )
    .limit(DEFAULT_PAGE_SIZE)
    .offset((page - 1) * DEFAULT_PAGE_SIZE);

  const { whereClause } = buildPurchaseFiltersAndSorting(
    companyId,
    filters,
  );

  const [{ total }] = await db
    .select({
      total: count(),
    })
    .from(purchases)
    .innerJoin(suppliers, eq(suppliers.id, purchases.supplierId))
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}

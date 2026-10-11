import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { roundQty } from "@/lib/quantity";
import { saleReturnItems } from "@/features/returns/schemas/sale-return-item.schema";
import { saleReturns } from "@/features/returns/schemas/sale-return.schema";
import { SALE_RETURN_STATUS } from "@/features/returns/constants/sale-return-status";

import { sales } from "../schemas/sales.schema";

export async function getSaleById(saleId: string, companyId: string) {
  const sale = await db.query.sales.findFirst({
    where: and(eq(sales.id, saleId), eq(sales.companyId, companyId)),

    columns: {
      id: true,
      saleNumber: true,
      saleDate: true,
      remarks: true,
      image: true,
      workOrderNumber: true,
      challanNumber: true,
      invoiceNumber: true,
      isWarranty: true,
      grandTotal: true,
      createdAt: true,
    },

    with: {
      items: {
        columns: {
          id: true,
          quantity: true,
          sellingPrice: true,
          lineTotal: true,
          returnedQty: true,
        },

        with: {
          product: {
            columns: {
              id: true,
              name: true,
              unit: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  const pendingQtyRows = await db
    .select({
      saleItemId: saleReturnItems.saleItemId,
      pendingQty: sql<number>`SUM(${saleReturnItems.quantity})`,
    })
    .from(saleReturnItems)
    .innerJoin(saleReturns, eq(saleReturnItems.saleReturnId, saleReturns.id))
    .where(
      and(
        eq(saleReturns.saleId, saleId),
        eq(saleReturns.status, SALE_RETURN_STATUS.PENDING_APPROVAL),
      ),
    )
    .groupBy(saleReturnItems.saleItemId);

  const pendingQtyBySaleItemId = new Map(
    pendingQtyRows.map((row) => [row.saleItemId, Number(row.pendingQty)]),
  );

  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    saleDate: sale.saleDate,
    remarks: sale.remarks,
    grandTotal: sale.grandTotal,
    image: sale.image,
    workOrderNumber: sale.workOrderNumber,
    challanNumber: sale.challanNumber,
    invoiceNumber: sale.invoiceNumber,
    isWarranty: sale.isWarranty,
    createdAt: sale.createdAt,
    items: sale.items.map((item) => {
      const pendingReturnQty = pendingQtyBySaleItemId.get(item.id) ?? 0;

      return {
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        category: item.product.category,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        lineTotal: item.lineTotal,
        returnedQty: item.returnedQty,
        pendingReturnQty,
        returnableQty: Math.max(
          0,
          roundQty(item.quantity - item.returnedQty - pendingReturnQty),
        ),
      };
    }),
  };
}

import "server-only";
import { roundQty } from "@/lib/quantity";

import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";

import { sales } from "@/features/sales/schemas/sales.schema";
import { saleItems } from "@/features/sales/schemas/sales-item.schema";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { ValidationError } from "@/lib/errors/validation-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { generateReturnNumber } from "./generate-return-number.service";

import { saleReturns } from "../schemas/sale-return.schema";
import { saleReturnItems } from "../schemas/sale-return-item.schema";
import { SALE_RETURN_STATUS } from "../constants/sale-return-status";

import {
  CreateSaleReturnFormType,
  CreateSaleReturnType,
  SaleReturnItemType,
} from "../types/return.type";

export async function createSaleReturn(
  data: CreateSaleReturnFormType,
  companyId: string,
  userId: string,
) {
  try {
    return await db.transaction(async (tx) => {
      const sale = await tx.query.sales.findFirst({
        where: and(eq(sales.id, data.saleId), eq(sales.companyId, companyId)),

        columns: {
          id: true,
        },
      });

      if (!sale) {
        throw new NotFoundError("Sale not found");
      }

      const saleItemIds = data.items.map((item) => item.saleItemId);

      const existingSaleItems = await tx.query.saleItems.findMany({
        where: and(
          eq(saleItems.saleId, data.saleId),
          inArray(saleItems.id, saleItemIds),
        ),

        columns: {
          id: true,
          productId: true,
          quantity: true,
          returnedQty: true,
        },
      });

      const saleItemById = new Map(
        existingSaleItems.map((item) => [item.id, item]),
      );

      const pendingQtyRows = await tx
        .select({
          saleItemId: saleReturnItems.saleItemId,
          pendingQty: sql<number>`SUM(${saleReturnItems.quantity})`,
        })
        .from(saleReturnItems)
        .innerJoin(
          saleReturns,
          eq(saleReturnItems.saleReturnId, saleReturns.id),
        )
        .where(
          and(
            eq(saleReturns.status, SALE_RETURN_STATUS.PENDING_APPROVAL),
            inArray(saleReturnItems.saleItemId, saleItemIds),
          ),
        )
        .groupBy(saleReturnItems.saleItemId);

      const pendingQtyBySaleItemId = new Map(
        pendingQtyRows.map((row) => [row.saleItemId, Number(row.pendingQty)]),
      );

      for (const item of data.items) {
        const saleItem = saleItemById.get(item.saleItemId);

        if (!saleItem) {
          throw new ValidationError(
            "One or more items do not belong to this sale.",
          );
        }

        if (saleItem.productId !== item.productId) {
          throw new ValidationError("Product does not match the sale item.");
        }

        const alreadyPending = pendingQtyBySaleItemId.get(item.saleItemId) ?? 0;

        const returnableQty = roundQty(
          saleItem.quantity - saleItem.returnedQty - alreadyPending,
        );

        if (item.quantity > returnableQty) {
          throw new BusinessRuleError(
            `Cannot return ${item.quantity} unit(s) — only ${Math.max(returnableQty, 0)} unit(s) are eligible for return.`,
          );
        }
      }

      const returnNumber = await generateReturnNumber(tx, companyId);

      const totalReturnedQty = data.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      const saleReturnData: CreateSaleReturnType = {
        companyId,
        saleId: data.saleId,
        returnNumber,
        returnDate: data.returnDate,
        reason: data.reason?.trim() || null,
        totalItems: data.items.length,
        totalReturnedQty,
        createdByUserId: userId,
      };

      const [saleReturn] = await tx
        .insert(saleReturns)
        .values(saleReturnData)
        .returning();

      const saleReturnItemValues: SaleReturnItemType[] = data.items.map(
        (item) => ({
          saleReturnId: saleReturn.id,
          saleItemId: item.saleItemId,
          productId: item.productId,
          quantity: item.quantity,
        }),
      );

      await tx.insert(saleReturnItems).values(saleReturnItemValues);

      return saleReturn;
    });
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ValidationError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }

    throw mapDatabaseError(error);
  }
}

import "server-only";
import { roundQty } from "@/lib/quantity";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";

import { products } from "@/features/product/schemas/product.schema";
import { saleItems } from "@/features/sales/schemas/sales-item.schema";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { saleReturns } from "../schemas/sale-return.schema";
import { SALE_RETURN_STATUS } from "../constants/sale-return-status";

export async function approveSaleReturn(
  returnId: string,
  companyId: string,
  approvedByUserId: string,
) {
  try {
    return await db.transaction(async (tx) => {
      const saleReturn = await tx.query.saleReturns.findFirst({
        where: and(
          eq(saleReturns.id, returnId),
          eq(saleReturns.companyId, companyId),
        ),

        with: {
          items: {
            columns: {
              saleItemId: true,
              productId: true,
              quantity: true,
            },
          },
        },
      });

      if (!saleReturn) {
        throw new NotFoundError("Return request not found");
      }

      if (saleReturn.status !== SALE_RETURN_STATUS.PENDING_APPROVAL) {
        throw new BusinessRuleError(
          "Only pending return requests can be approved.",
        );
      }

      for (const item of saleReturn.items) {
        const saleItem = await tx.query.saleItems.findFirst({
          where: eq(saleItems.id, item.saleItemId),

          columns: {
            quantity: true,
            returnedQty: true,
          },
        });

        if (!saleItem) {
          throw new NotFoundError("Sale item no longer exists.");
        }

        const returnableQty = roundQty(
          saleItem.quantity - saleItem.returnedQty,
        );

        if (item.quantity > returnableQty) {
          throw new BusinessRuleError(
            "This return can no longer be approved as-is — the sold quantity has already been returned elsewhere. Reject it instead.",
          );
        }

        await tx
          .update(saleItems)
          .set({
            returnedQty: sql`${saleItems.returnedQty} + ${item.quantity}`,
          })
          .where(eq(saleItems.id, item.saleItemId));

        await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      const [updated] = await tx
        .update(saleReturns)
        .set({
          status: SALE_RETURN_STATUS.APPROVED,
          approvedByUserId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(saleReturns.id, returnId))
        .returning();

      return updated;
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BusinessRuleError) {
      throw error;
    }

    throw mapDatabaseError(error);
  }
}

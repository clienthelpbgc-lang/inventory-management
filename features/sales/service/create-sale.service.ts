import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";

import { products } from "@/features/product/schemas/product.schema";

import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

import { ValidationError } from "@/lib/errors";

import { generateSaleNumber } from "./generate-sale-number.service";

import { sales } from "../schemas/sales.schema";
import { saleItems } from "../schemas/sales-item.schema";

import {
  CreateSaleFormType,
  CreateSaleType,
  SaleItemType,
} from "../types/sales.type";

export async function createSale(
  data: CreateSaleFormType,
  companyId: string,
  userId: string,
) {
  const IMAGE_FOLDER_NAME = `${companyId}/OUTGOINGS`;

  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    return await db.transaction(async (tx) => {
      const saleNumber = await generateSaleNumber(tx, companyId);

      const grandTotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.sellingPrice,
        0,
      );

      let imageUrl: string | undefined;

      if (data.image instanceof File) {
        const uploadedImage = await uploadImage({
          file: data.image,
          folder: IMAGE_FOLDER_NAME,
          transactionContext,
        });

        imageUrl = uploadedImage.publicUrl;
      }

      const saleData: CreateSaleType = {
        companyId,
        saleNumber,
        grandTotal: grandTotal.toFixed(2),
        saleDate: data.saleDate,
        remarks: data.remarks?.trim() || null,
        workOrderNumber: data.workOrderNumber?.trim() || null,
        challanNumber: data.challanNumber?.trim() || null,
        invoiceNumber: data.invoiceNumber?.trim() || null,
        isWarranty: data.isWarranty ?? false,
        image: imageUrl,
        soldTo: data.soldTo?.trim() || null,
        createdBy: userId,
      };

      const [sale] = await tx.insert(sales).values(saleData).returning();

      const saleItemValues: SaleItemType[] = data.items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice.toFixed(2),
        lineTotal: (item.quantity * item.sellingPrice).toFixed(2),
      }));

      await tx.insert(saleItems).values(saleItemValues);

      // Deduct only when enough stock is on hand; the guard in the WHERE
      // clause keeps concurrent sales from pushing stock negative.
      for (const item of data.items) {
        const updated = await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} - ${item.quantity}`,
          })
          .where(
            and(
              eq(products.id, item.productId),
              eq(products.companyId, companyId),
              gte(products.currentStock, item.quantity),
            ),
          )
          .returning({ id: products.id });

        if (updated.length === 0) {
          const [product] = await tx
            .select({
              name: products.name,
              unit: products.unit,
              currentStock: products.currentStock,
            })
            .from(products)
            .where(
              and(
                eq(products.id, item.productId),
                eq(products.companyId, companyId),
              ),
            );

          throw new ValidationError(
            product
              ? `Insufficient stock for ${product.name}: ${product.currentStock} ${product.unit} available, ${item.quantity} requested.`
              : "One or more products were not found.",
          );
        }
      }

      return sale;
    });
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    throw error;
  }
}

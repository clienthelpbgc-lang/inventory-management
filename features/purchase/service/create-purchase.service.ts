import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";
import { purchaseItems } from "../schemas/purchase-item.schema";
import { purchases } from "../schemas/purchase.schema";
import { suppliers } from "@/features/suppliers/schemas/supplier.schema";

import {
  CreatePurchaseFormType,
  CreatePurchaseType,
} from "../types/purchase.type";
import { ValidationError } from "@/lib/errors";
import { generatePurchaseNumber } from "./generate-purchase-number.service";
import {
  rollbackUploadedFiles,
  uploadImage,
} from "@/lib/storage/upload-image.service";

export async function createPurchase(
  data: CreatePurchaseFormType,
  companyId: string,
  userId: string,
) {
  const IMAGE_FOLDER_NAME = `${companyId}/INCOMINGS`;

  const transactionContext = {
    uploadedFiles: [],
  };

  try {
    return await db.transaction(async (tx) => {
      const [supplier] = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(
          and(
            eq(suppliers.id, data.supplierId),
            eq(suppliers.companyId, companyId),
          ),
        );

      if (!supplier) {
        throw new ValidationError("Supplier not found.");
      }

      const purchaseNumber = await generatePurchaseNumber(tx, companyId);

      const grandTotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.purchasePrice,
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

      const purchaseData: CreatePurchaseType = {
        companyId,
        supplierId: data.supplierId,
        purchaseNumber,
        grandTotal: grandTotal.toFixed(2),
        purchaseDate: data.purchaseDate,
        challanNumber: data.challanNumber?.trim() || undefined,
        invoiceNumber: data.invoiceNumber?.trim() || undefined,
        remarks: data.remarks?.trim() || null,
        image: imageUrl,
        createdBy: userId,
      };

      const [purchase] = await tx
        .insert(purchases)
        .values(purchaseData)
        .returning();

      await tx.insert(purchaseItems).values(
        data.items.map((item) => ({
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice.toFixed(2),
          lineTotal: (item.quantity * item.purchasePrice).toFixed(2),
        })),
      );

      for (const item of data.items) {
        const updated = await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} + ${item.quantity}`,
          })
          .where(
            and(
              eq(products.id, item.productId),
              eq(products.companyId, companyId),
            ),
          )
          .returning({ id: products.id });

        if (updated.length === 0) {
          throw new ValidationError("One or more products were not found.");
        }
      }

      return purchase;
    });
  } catch (error) {
    await rollbackUploadedFiles(transactionContext);

    throw error;
  }
}

import { db } from "@/db";
import { products, purchaseRequestItems, suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPurchaseRequestProducts(purchaseRequestId: string) {
  return db
    .select({
      productId: products.id,
      productName: products.name,
      description: products.description,
      category: products.category,
      unit: products.unit,
      currentStock: products.currentStock,
      minOrderQty: products.minOrderQty,
      maxOrderQty: products.maxOrderQty,

      requestedQty: purchaseRequestItems.requestedQty,
      approvedQty: purchaseRequestItems.approvedQty,
      status: purchaseRequestItems.status,
      purchaseRequestItemId: purchaseRequestItems.id,

      supplierId: purchaseRequestItems.supplierId,
      supplierName: suppliers.companyName,
    })
    .from(purchaseRequestItems)
    .innerJoin(products, eq(products.id, purchaseRequestItems.productId))
    .leftJoin(suppliers, eq(suppliers.id, purchaseRequestItems.supplierId))
    .where(eq(purchaseRequestItems.purchaseRequestId, purchaseRequestId));
}

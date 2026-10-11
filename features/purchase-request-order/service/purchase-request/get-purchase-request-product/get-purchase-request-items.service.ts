import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { roundQty } from "@/lib/quantity";
import { getActivePurchaseRequestProductIds } from "./get-active-purchase-req-prod-id.service";
import { getEligiblePurchaseRequestProducts } from "./get-eligible-purchase-req-product.service";
import { getOnOrderQtyByProduct } from "./get-on-order-qty.service";
import { PurchaseRequestProduct } from "../../../types/purchase-request.type";

export async function getPurchaseRequestItems(
  companyId: string,
): Promise<PurchaseRequestProduct[]> {
  try {
    const [activePurchaseRequestProductIds, onOrderQtyByProduct] =
      await Promise.all([
        getActivePurchaseRequestProductIds(companyId),
        getOnOrderQtyByProduct(companyId),
      ]);

    const excludedProductIds = [
      ...new Set([...activePurchaseRequestProductIds]),
    ];

    const eligibleProducts = await getEligiblePurchaseRequestProducts(
      companyId,
      excludedProductIds,
    );

    const uniqueProducts = Array.from(
      new Map(
        eligibleProducts.map((product) => [product.productId, product]),
      ).values(),
    );

    // Stock already on order covers part of the shortage, so only products
    // still below minimum once it arrives need a new request.
    return uniqueProducts.flatMap((product) => {
      const onOrderQty = onOrderQtyByProduct.get(product.productId) ?? 0;
      const projectedStock = roundQty(product.currentStock + onOrderQty);

      if (projectedStock >= product.minOrderQty) return [];

      return [
        {
          ...product,
          onOrderQty,
          suggestedQty: roundQty(
            Math.max(
              product.reorderQty - onOrderQty,
              product.minOrderQty - projectedStock,
            ),
          ),
        },
      ];
    });
  } catch (error) {
    console.error("Failed to get purchase request items:", error);

    throw mapDatabaseError("Unable to retrieve purchase request items.");
  }
}

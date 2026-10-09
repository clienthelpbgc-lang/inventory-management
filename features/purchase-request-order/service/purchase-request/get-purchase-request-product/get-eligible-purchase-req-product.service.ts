import { and, eq, inArray, lt, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, suppliers } from "@/db/schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { PurchaseRequestProduct } from "../../../types/purchase-request.type";

/**
 * Default supplier for a product: whoever it was last bought from (incoming
 * purchase or PO, whichever is newer), falling back to the first supplier
 * linked to the product. Inactive suppliers are skipped.
 */
const defaultSupplierId = sql<string | null>`(
  SELECT used.supplier_id
  FROM (
    SELECT p.supplier_id, p.purchase_date::timestamp AS used_at, p.created_at AS tiebreak
    FROM purchase_items pi
    JOIN purchases p ON p.id = pi.purchase_id
    WHERE pi.product_id = ${products.id} AND p.company_id = ${products.companyId}

    UNION ALL

    SELECT po.supplier_id, po.created_at AS used_at, po.created_at AS tiebreak
    FROM purchase_order_items poi
    JOIN purchase_orders po ON po.id = poi.purchase_order_id
    WHERE poi.product_id = ${products.id} AND po.company_id = ${products.companyId}

    UNION ALL

    SELECT ps.supplier_id, '-infinity'::timestamp AS used_at, ps.created_at AS tiebreak
    FROM product_suppliers ps
    WHERE ps.product_id = ${products.id}
  ) used
  JOIN ${suppliers} s ON s.id = used.supplier_id AND s.is_active
  ORDER BY
    used.used_at DESC,
    -- Linked suppliers (the -infinity rows) fall back to the oldest link.
    CASE WHEN used.used_at = '-infinity' THEN used.tiebreak END ASC,
    used.tiebreak DESC
  LIMIT 1
)`;

export async function getEligiblePurchaseRequestProducts(
  companyId: string,
  excludedProductIds: string[],
): Promise<PurchaseRequestProduct[]> {
  try {
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        description: products.description,
        category: products.category,
        unit: products.unit,
        currentStock: products.currentStock,
        minOrderQty: products.minOrderQty,
        maxOrderQty: products.maxOrderQty,
        reorderQty: products.reorderQty,
        supplierId: defaultSupplierId.as("default_supplier_id"),
      })
      .from(products)
      .where(
        and(
          eq(products.companyId, companyId),
          lt(products.currentStock, products.minOrderQty),
          excludedProductIds.length
            ? notInArray(products.id, excludedProductIds)
            : undefined,
        ),
      );

    const supplierIds = [
      ...new Set(rows.flatMap(({ supplierId }) => supplierId ?? [])),
    ];

    const supplierNames = new Map(
      supplierIds.length
        ? (
            await db
              .select({ id: suppliers.id, companyName: suppliers.companyName })
              .from(suppliers)
              .where(
                and(
                  eq(suppliers.companyId, companyId),
                  inArray(suppliers.id, supplierIds),
                ),
              )
          ).map(({ id, companyName }) => [id, companyName])
        : [],
    );

    return rows.map((row) => ({
      ...row,
      supplierName: row.supplierId
        ? (supplierNames.get(row.supplierId) ?? null)
        : null,
    }));
  } catch (error) {
    console.error("Failed to fetch eligible purchase request products:", error);

    throw mapDatabaseError(
      "Unable to fetch eligible purchase request products.",
    );
  }
}

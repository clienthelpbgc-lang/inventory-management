import { sql } from "drizzle-orm";

import { db } from "@/db";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

/**
 * Returns the quantity per product that has been ordered on a PO but not yet
 * received.
 *
 * Incoming purchases aren't linked to POs, so receipts are matched by
 * product + supplier: anything received from a PO's supplier on or after the
 * date of the oldest PO for that product/supplier counts against it.
 */
export async function getOnOrderQtyByProduct(
  companyId: string,
): Promise<Map<string, number>> {
  try {
    const rows = await db.execute<{ productId: string; onOrderQty: number }>(sql`
      WITH po_lines AS (
        SELECT
          poi.product_id,
          po.supplier_id,
          SUM(poi.ordered_qty - poi.received_qty) AS ordered_qty,
          MIN(po.created_at)::date AS first_po_date
        FROM purchase_order_items poi
        JOIN purchase_orders po ON po.id = poi.purchase_order_id
        WHERE po.company_id = ${companyId}
        GROUP BY poi.product_id, po.supplier_id
      )
      SELECT
        po_lines.product_id AS "productId",
        SUM(GREATEST(po_lines.ordered_qty - COALESCE(received.qty, 0), 0))::float8
          AS "onOrderQty"
      FROM po_lines
      LEFT JOIN LATERAL (
        SELECT SUM(pi.quantity) AS qty
        FROM purchase_items pi
        JOIN purchases p ON p.id = pi.purchase_id
        WHERE p.company_id = ${companyId}
          AND p.supplier_id = po_lines.supplier_id
          AND pi.product_id = po_lines.product_id
          AND p.purchase_date >= po_lines.first_po_date
      ) received ON TRUE
      GROUP BY po_lines.product_id
    `);

    return new Map(
      rows
        .filter((row) => row.onOrderQty > 0)
        .map((row) => [row.productId, Number(row.onOrderQty)]),
    );
  } catch (error) {
    console.error("Failed to fetch on-order quantities:", error);

    throw mapDatabaseError("Unable to fetch on-order quantities.");
  }
}

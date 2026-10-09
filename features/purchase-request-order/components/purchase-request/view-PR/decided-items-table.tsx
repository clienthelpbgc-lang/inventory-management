"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryBadge } from "@/lib/category-badge";

import {
  PURCHASE_REQUEST_ITEM_STATUS,
  PURCHASE_REQUEST_ITEM_STATUS_LABEL,
  PurchaseRequestItemStatus,
} from "../../../constants/purchase-request-item-status";
import { ViewPurchaseRequestProduct } from "../../../types/purchase-request.type";

const STATUS_CLASS: Record<PurchaseRequestItemStatus, string> = {
  [PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [PURCHASE_REQUEST_ITEM_STATUS.APPROVED]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [PURCHASE_REQUEST_ITEM_STATUS.REJECTED]:
    "border-red-200 bg-red-50 text-red-700",
};

export function DecidedItemsTable({
  title,
  products,
}: {
  title: string;
  products: ViewPurchaseRequestProduct[];
}) {
  return (
    <Card className="overflow-hidden gap-0 py-0">
      <CardContent className="p-0">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">{title}</h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-4 font-semibold">Product</TableHead>
                <TableHead className="py-4 font-semibold">Category</TableHead>
                <TableHead className="py-4 font-semibold whitespace-nowrap">
                  Requested Qty
                </TableHead>
                <TableHead className="py-4 font-semibold whitespace-nowrap">
                  Approved Qty
                </TableHead>
                <TableHead className="py-4 font-semibold">Supplier</TableHead>
                <TableHead className="py-4 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow key={product.purchaseRequestItemId}>
                  <TableCell className="py-4">
                    <p className="font-semibold">{product.productName}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    <CategoryBadge category={product.category} />
                  </TableCell>
                  <TableCell className="py-4">
                    {product.requestedQty} {product.unit}
                  </TableCell>
                  <TableCell className="py-4">
                    {product.status === PURCHASE_REQUEST_ITEM_STATUS.APPROVED
                      ? `${product.approvedQty ?? 0} ${product.unit}`
                      : "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    {product.supplierName ?? "—"}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={STATUS_CLASS[product.status]}
                    >
                      {PURCHASE_REQUEST_ITEM_STATUS_LABEL[product.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

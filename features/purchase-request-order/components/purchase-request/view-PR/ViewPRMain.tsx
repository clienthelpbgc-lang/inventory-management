// Refactored ViewPRMain
"use client";

import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { can } from "@/features/auth/constants/permissions";
import { PurchaseRequestHeader } from "./PR-header";
import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";
import PurchaseRequestApprovalSection from "./purchase-request-approval-section";
import PurchaseOrderSection from "./purchase-order-section";
import { DecidedItemsTable } from "./decided-items-table";
import { PURCHASE_REQUEST_ITEM_STATUS } from "../../../constants/purchase-request-item-status";

export type PRPropDataType = {
  purchaseRequestId: string;
  purchaseRequestNumber: string;
};

export default function ViewPRMain({
  purchaseRequestTotal,
}: {
  purchaseRequestTotal: ViewPurchaseRequestType;
}) {
  const { user } = useAuth();

  const canManagePurchaseRequest =
    !!user && can(user.role, "purchase-request:approve");

  const { products, ...purchaseRequest } = purchaseRequestTotal;

  const pendingProducts = products.filter(
    ({ status }) =>
      status === PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL ||
      status === PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED,
  );
  const decidedProducts = products.filter(
    (product) => !pendingProducts.includes(product),
  );

  const showApproval = canManagePurchaseRequest && pendingProducts.length > 0;
  const readOnlyProducts = showApproval ? decidedProducts : products;

  return (
    <div className="space-y-4">
      <PurchaseRequestHeader pr={purchaseRequest} />

      {showApproval && (
        <PurchaseRequestApprovalSection
          products={pendingProducts}
          prData={{
            purchaseRequestId: purchaseRequest.id,
            purchaseRequestNumber: purchaseRequest.purchaseRequestNumber,
          }}
        />
      )}

      {readOnlyProducts.length > 0 && (
        <DecidedItemsTable
          title={showApproval ? "Decided Items" : "Items"}
          products={readOnlyProducts}
        />
      )}
      <PurchaseOrderSection purchaseRequestId={purchaseRequest.id} />
    </div>
  );
}

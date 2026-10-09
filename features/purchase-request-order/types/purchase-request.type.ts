import z from "zod";
import { purchaseOrderItems } from "../schemas/purchase-order-item.schema";
import { purchaseOrders } from "../schemas/purchase-order.schema";
import { purchaseRequestItems } from "../schemas/purchase-request-item.schema";
import { purchaseRequests } from "../schemas/purchase-request.schema";
import { PurchaseRequestFormSchema } from "../validation/purchase-request-form";
import { PurchaseRequestStatus } from "../constants/purchase-request-status";
import { PurchaseRequestItemStatus } from "../constants/purchase-request-item-status";
import { PurchaseRequestApprovalFormSchema, PurchaseRequestApprovalItemSchema } from "../validation/approve-pr-form";

export type PurchaseRequestProduct = {
  productId: string;
  productName: string;
  description?: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minOrderQty: number;
  maxOrderQty: number;
  reorderQty: number;
  // Ordered on a PO but not yet received.
  onOrderQty?: number;
  // Reorder quantity less what's already on order.
  suggestedQty?: number;
  supplierId?: string | null;
  supplierName?: string | null;
};

export type PurchaseRequest = {
  id: string;
  purchaseRequestNumber: string;
  status: PurchaseRequestStatus;
  remarks: string | null;
  totalItems: number;
  totalRequestedQty: number;
  createdByUserId?: string | null;
  createdByUserName?: string | null;
  processedByUserId?: string | null;
  processedByUserName?: string | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ViewPurchaseRequestProduct = {
  productId: string;
  purchaseRequestItemId: string;
  productName: string;
  description?: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minOrderQty: number;
  maxOrderQty: number;
  requestedQty: number;
  approvedQty?: number | null;
  status: PurchaseRequestItemStatus;
  supplierId?: string | null;
  supplierName?: string | null;
};

export type ViewPurchaseRequestType = PurchaseRequest & {
  products: ViewPurchaseRequestProduct[];
};

export type NewPurchaseRequest = typeof purchaseRequests.$inferInsert;

export type NewPurchaseRequestItem = typeof purchaseRequestItems.$inferInsert;

export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type NewPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

export type PurchaseRequestFormType = z.infer<typeof PurchaseRequestFormSchema>;

export type PurchaseRequestApprovalForm = z.infer<
  typeof PurchaseRequestApprovalFormSchema
>;
export type PurchaseRequestApprovalItemFormType = z.infer<typeof PurchaseRequestApprovalItemSchema>;

export type PurchaseRequestApprovalItems = {
  purchaseRequestItemId: string;
  decision: "APPROVE" | "REJECT" | "ACTION_REQUIRED";
  approvedQty: number;
  supplierId: string;
  supplierName: string;
};

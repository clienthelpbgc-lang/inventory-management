import Link from "next/link";
import { Calendar, Eye, Trash2, Workflow } from "lucide-react";
import { ProcessOrderList } from "../types/process-order.types";
import {
  PROCESS_ORDER_STATUS,
  ProcessOrderStatus,
} from "../constants/process-order-status";
import { DeleteProcessOrderDialog } from "./delete-process-order-dialog";
import { formatDate } from "@/lib/format-date";

const statusConfig: Record<
  ProcessOrderStatus,
  { label: string; color: string }
> = {
  [PROCESS_ORDER_STATUS.SENT]: {
    label: "Sent",
    color: "bg-blue-100 text-blue-800",
  },
  [PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED]: {
    label: "Partially Received",
    color: "bg-yellow-100 text-yellow-800",
  },
  [PROCESS_ORDER_STATUS.RECEIVED]: {
    label: "Received",
    color: "bg-green-100 text-green-800",
  },
  [PROCESS_ORDER_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
};
interface ProcessOrderCardProps {
  order: ProcessOrderList;
}

export function ProcessOrderCard({ order }: ProcessOrderCardProps) {
  const status = statusConfig[order.status];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-300 hover:shadow-lg hover:border-neutral-300">
      {/* Metrics row */}
      <div className="flex items-start gap-6">
        {/* Vendor */}
        <div className="w-56 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${status.color}`}
            >
              <Workflow className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900 text-sm">
                {order.processOrderNo}
              </p>
              {order.vendorName && (
                <p className="text-xs text-neutral-700 font-medium">
                  {order.vendorName}
                </p>
              )}
              <p className="text-xs text-neutral-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Remaining columns */}
        <div className="flex flex-1 items-center gap-3">
          {/* Status */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Status
            </p>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          {/* Items */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Items
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {order.itemCount}
            </p>
          </div>

          {/* Qty */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Qty
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {order.totalReceivedQty} / {order.totalSentQty}
            </p>
          </div>

          {/* Sent */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Sent
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {order.lastSentDate ? formatDate(order.lastSentDate) : "-"}
            </p>
          </div>

          {/* Received */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Received
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {order.lastReceivedDate
                ? formatDate(order.lastReceivedDate)
                : "-"}
            </p>
          </div>

          {/* Cost */}
          <div className="flex-1">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Cost
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {formatCurrency(order.totalProcessingCost)}
            </p>
          </div>
          <div className="flex justify-end items-center gap-4">
            <Link
              href={`/process-orders/${order.id}`}
              aria-label={`View ${order.processOrderNo}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
            <DeleteProcessOrderDialog
              processOrderId={order.id}
              processOrderNumber={order.processOrderNo}
            >
              <Trash2 className="h-4 w-4 text-red-600 cursor-pointer" />
            </DeleteProcessOrderDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

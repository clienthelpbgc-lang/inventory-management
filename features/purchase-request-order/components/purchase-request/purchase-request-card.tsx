import Link from "next/link";
import { Calendar, Eye, Layers, Package, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";

import {
  PURCHASE_REQUEST_STATUS,
  PURCHASE_REQUEST_STATUS_CONFIG,
} from "../../constants/purchase-request-status";
import { PurchaseRequest } from "../../types/purchase-request.type";

type PurchaseRequestCardProps = {
  request: PurchaseRequest;
};

const STATUS_BORDER_COLOR: Record<
  keyof typeof PURCHASE_REQUEST_STATUS,
  string
> = {
  PENDING_APPROVAL: "#f59e0b", // Amber
  APPROVED: "#10b981", // Emerald
  PARTIALLY_APPROVED: "#3b82f6", // Blue
  REJECTED: "#ef4444", // Red
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />

      <div className="leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function PurchaseRequestCard({
  request,
}: PurchaseRequestCardProps) {
  const status = PURCHASE_REQUEST_STATUS_CONFIG[request.status];

  const isProcessed =
    request.processedAt !== null && request.processedByUserName !== null;

  return (
    <div
      className="group flex h-[88px] w-full items-center gap-5 overflow-hidden rounded-xl border border-slate-200 bg-white px-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      style={{
        borderLeft: `4px solid ${STATUS_BORDER_COLOR[request.status]}`,
      }}
    >
      <div className="w-[180px] shrink-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Purchase Request
        </p>

        <h2 className="mt-0.5 truncate text-base font-semibold text-slate-900">
          {request.purchaseRequestNumber}
        </h2>

        <div
          className={`mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.className}`}
        >
          {status.label}
        </div>
      </div>

      <div className="h-10 w-px shrink-0 bg-slate-100" />

      <div className="flex shrink-0 items-center gap-5">
        <Stat icon={Layers} label="Items" value={request.totalItems} />

        <Stat
          icon={Package}
          label="Quantity"
          value={request.totalRequestedQty}
        />

        <Stat
          icon={User}
          label="Created By"
          value={request.createdByUserName}
        />
      </div>

      <div className="h-10 w-px shrink-0 bg-slate-100" />

      <div className="flex shrink-0 items-center gap-5 text-xs">
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Created
          </p>

          <p className="mt-0.5 flex items-center gap-1 font-medium text-slate-700">
            <Calendar className="h-3 w-3 text-slate-400" />
            {formatDate(request.createdAt)}
          </p>
        </div>

        <div className="min-w-[130px] leading-tight">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {request.status === PURCHASE_REQUEST_STATUS.REJECTED
              ? "Rejected By"
              : "Processed By"}
          </p>

          {isProcessed ? (
            <>
              <p className="mt-0.5 font-medium text-slate-700">
                {request.processedByUserName}
              </p>

              <p className="text-slate-400">
                {formatDate(request.processedAt!)}
              </p>
            </>
          ) : (
            <p className="mt-0.5 italic text-slate-400">Awaiting action</p>
          )}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/purchase-request/${request.id}`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        
      </div>
    </div>
  );
}
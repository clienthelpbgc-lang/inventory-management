"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  TENANT_USAGE_STATUS,
  TENANT_USAGE_STATUS_CONFIG,
  TenantUsageStatus,
} from "../constants/tenant-usage-status";

type TenantUsageSummaryProps = {
  counts: Record<TenantUsageStatus, number>;
  selected: TenantUsageStatus | null;
  onSelect: (status: TenantUsageStatus | null) => void;
};

export function TenantUsageSummary({
  counts,
  selected,
  onSelect,
}: TenantUsageSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Object.values(TENANT_USAGE_STATUS).map((status) => {
        const config = TENANT_USAGE_STATUS_CONFIG[status];
        const isSelected = selected === status;

        return (
          <button
            key={status}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected ? null : status)}
            className={cn(
              "rounded-2xl border bg-white p-5 text-left shadow-sm transition-colors",
              isSelected ? "ring-2 ring-primary" : "hover:border-slate-300",
            )}
          >
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {counts[status]}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {config.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

import {
  TENANT_USAGE_STATUS,
  TenantUsageStatus,
} from "../constants/tenant-usage-status";
import { TenantUsage } from "../types/tenant-usage.type";
import { TenantUsageSummary } from "./tenant-usage-summary";
import { TenantUsageTable } from "./tenant-usage-table";

type TenantUsageDashboardProps = {
  tenants: TenantUsage[];
  generatedAt: string;
};

export function TenantUsageDashboard({
  tenants,
  generatedAt,
}: TenantUsageDashboardProps) {
  const [status, setStatus] = useState<TenantUsageStatus | null>(null);
  const [search, setSearch] = useState("");

  const counts = countByStatus(tenants);
  const term = search.trim().toLowerCase();

  const visibleTenants = tenants.filter(
    (tenant) =>
      (!status || tenant.status === status) &&
      (!term || tenant.companyName.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-6">
      <TenantUsageSummary
        counts={counts}
        selected={status}
        onSelect={setStatus}
      />

      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company..."
          className="bg-white pl-9"
        />
      </div>

      <TenantUsageTable tenants={visibleTenants} generatedAt={generatedAt} />
    </div>
  );
}

function countByStatus(tenants: TenantUsage[]) {
  const counts = Object.fromEntries(
    Object.values(TENANT_USAGE_STATUS).map((status) => [status, 0]),
  ) as Record<TenantUsageStatus, number>;

  for (const tenant of tenants) {
    counts[tenant.status] += 1;
  }

  return counts;
}

"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TENANT_USAGE_STATUS_CONFIG } from "../constants/tenant-usage-status";
import { TenantUsage } from "../types/tenant-usage.type";
import { daysAgoLabel, displayDate } from "../utils/activity-dates";

type TenantUsageTableProps = {
  tenants: TenantUsage[];
  /** When the data was loaded; "days ago" is measured from here. */
  generatedAt: string;
};

export function TenantUsageTable({
  tenants,
  generatedAt,
}: TenantUsageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead>Activity (30 days)</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Onboarded</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                No companies match these filters.
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant, index) => {
              const status = TENANT_USAGE_STATUS_CONFIG[tenant.status];

              return (
                <TableRow
                  key={tenant.companyId}
                  className={index % 2 === 0 ? "bg-muted/30" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/tenants/${tenant.companyId}`}
                        className="hover:underline"
                      >
                        {tenant.companyName}
                      </Link>

                      {!tenant.isActive && (
                        <Badge variant="outline">Suspended</Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <TimestampCell
                      timestamp={tenant.lastActivityAt}
                      now={generatedAt}
                      emptyLabel="No activity"
                    />
                  </TableCell>

                  <TableCell>
                    <TimestampCell
                      timestamp={tenant.lastLoginAt}
                      now={generatedAt}
                      emptyLabel="Never"
                    />
                  </TableCell>

                  <TableCell>
                    <p>{tenant.activityLast30Days}</p>
                    <p className="text-xs text-muted-foreground">
                      {tenant.activityLast7Days} in last 7 days
                    </p>
                  </TableCell>

                  <TableCell>
                    <p>{tenant.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">
                      {tenant.usersSignedIn} signed in
                    </p>
                  </TableCell>

                  <TableCell>
                    {displayDate.format(new Date(tenant.onboardedAt))}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TimestampCell({
  timestamp,
  now,
  emptyLabel,
}: {
  timestamp: string | null;
  now: string;
  emptyLabel: string;
}) {
  if (!timestamp) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <>
      <p>{daysAgoLabel(timestamp, now)}</p>
      <p className="text-xs text-muted-foreground">
        {displayDate.format(new Date(timestamp))}
      </p>
    </>
  );
}

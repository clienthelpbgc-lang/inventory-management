import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACTIVITY_TYPE_LABELS } from "@/features/admin-tenants/constants/activity-type";
import { TENANT_USAGE_STATUS_CONFIG } from "@/features/admin-tenants/constants/tenant-usage-status";
import { TenantActivityChart } from "@/features/admin-tenants/components/tenant-activity-chart";
import { getTenantDetail } from "@/features/admin-tenants/service/get-tenant-detail.service";
import {
  daysAgoLabel,
  displayDate,
} from "@/features/admin-tenants/utils/activity-dates";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { ROLE_LABELS } from "@/features/auth/constants/user-role";
import { NotFoundError } from "@/lib/errors/not-found-error";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  // Checked here as well as in the layout: layouts don't re-run on every
  // navigation, and this page reads cross-tenant data.
  await requirePlatformAdmin();

  const { companyId } = await params;

  if (!z.uuid().safeParse(companyId).success) notFound();

  let tenant;

  try {
    tenant = await getTenantDetail(companyId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const now = new Date().toISOString();
  const status = TENANT_USAGE_STATUS_CONFIG[tenant.status];
  const contact = [tenant.contact.name, tenant.contact.email, tenant.contact.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All tenants
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {tenant.companyName}
            </h1>

            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>

            {!tenant.isActive && <Badge variant="outline">Suspended</Badge>}
          </div>

          <p className="mt-1 text-muted-foreground">
            Onboarded {displayDate.format(new Date(tenant.onboardedAt))}
            {contact && ` · ${contact}`}
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Last 30 days</h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tenant.activityByType.map((activity) => (
              <div
                key={activity.type}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activity.last30Days}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.lastAt
                    ? `Last used ${displayDate.format(new Date(activity.lastAt))}`
                    : "Never used"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Weekly activity</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Outgoings, incomings, returns and process orders created per week
          </p>

          <TenantActivityChart weeklyActivity={tenant.weeklyActivity} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Users ({tenant.users.length})
          </h2>

          <div className="overflow-hidden rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last login</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {tenant.users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No active users.
                    </TableCell>
                  </TableRow>
                ) : (
                  tenant.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{ROLE_LABELS[user.role] ?? user.role}</TableCell>
                      <TableCell>
                        {user.lastLoginAt ? (
                          <>
                            <p>{daysAgoLabel(user.lastLoginAt, now)}</p>
                            <p className="text-xs text-muted-foreground">
                              {displayDate.format(new Date(user.lastLoginAt))}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}

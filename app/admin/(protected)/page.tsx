import { ArrowRight, BarChart3, Building2, LucideIcon } from "lucide-react";
import Link from "next/link";

import { TENANT_USAGE_STATUS } from "@/features/admin-tenants/constants/tenant-usage-status";
import { getTenantUsage } from "@/features/admin-tenants/service/get-tenant-usage.service";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";

export default async function AdminHomePage() {
  // Checked here as well as in the layout: layouts don't re-run on every
  // navigation, and this page reads cross-tenant data.
  const admin = await requirePlatformAdmin();
  const tenants = await getTenantUsage();

  const activeCount = tenants.filter(
    (tenant) => tenant.status === TENANT_USAGE_STATUS.ACTIVE,
  ).length;

  return (
    <div className="space-y-10 py-4">
      <div>
        <p className="text-sm font-medium text-blue-600">Platform admin</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome back{admin.name ? `, ${admin.name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          What would you like to do today?
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActionCard
          href="/admin/usage"
          icon={BarChart3}
          title="Usage dashboard"
          description="See which companies are using the platform and which have gone quiet."
          meta={`${activeCount} active · ${tenants.length - activeCount} with low or no usage`}
        />

        <ActionCard
          href="/admin/onboard-company"
          icon={Building2}
          title="Onboard client"
          description="Create a new company and its users in a few steps."
          meta={`${tenants.length} companies onboarded so far`}
        />
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl border bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>

        <ArrowRight className="h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600" />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <p className="mt-6 text-sm font-medium text-slate-700">{meta}</p>
    </Link>
  );
}

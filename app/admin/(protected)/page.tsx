import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TenantUsageDashboard } from "@/features/admin-tenants/components/tenant-usage-dashboard";
import { getTenantUsage } from "@/features/admin-tenants/service/get-tenant-usage.service";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";

export default async function AdminPage() {
  // Checked here as well as in the layout: layouts don't re-run on every
  // navigation, and this page reads cross-tenant data.
  await requirePlatformAdmin();

  const tenants = await getTenantUsage();
  const generatedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <header>
          <Image
            src="/logo.png"
            alt="Inventory Edge"
            width={160}
            height={64}
            className="h-16 w-auto"
            priority
          />
        </header>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tenant usage</h1>
            <p className="mt-1 text-muted-foreground">
              Which companies are using the platform, least active first.
            </p>
          </div>

          <Button asChild>
            <Link href="/admin/onboard-company">
              Onboard client
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <TenantUsageDashboard tenants={tenants} generatedAt={generatedAt} />
      </div>
    </div>
  );
}

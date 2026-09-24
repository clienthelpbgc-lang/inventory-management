import { TenantUsageDashboard } from "@/features/admin-tenants/components/tenant-usage-dashboard";
import { getTenantUsage } from "@/features/admin-tenants/service/get-tenant-usage.service";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";

export default async function UsageDashboardPage() {
  // Checked here as well as in the layout: layouts don't re-run on every
  // navigation, and this page reads cross-tenant data.
  await requirePlatformAdmin();

  const tenants = await getTenantUsage();
  const generatedAt = new Date().toISOString();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usage dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Which companies are using the platform, least recently used first.
        </p>
      </div>

      <TenantUsageDashboard tenants={tenants} generatedAt={generatedAt} />
    </div>
  );
}

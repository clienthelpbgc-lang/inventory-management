import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AdminHeader } from "@/features/admin-users/components/admin-header";
import { AdminAuthProvider } from "@/features/admin-users/context/admin-auth-context";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requirePlatformAdmin();
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/admin/login");
    if (error instanceof AuthorizationError) redirect("/unauthorized");
    throw error;
  }

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-slate-50">
        <AdminHeader />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </AdminAuthProvider>
  );
}

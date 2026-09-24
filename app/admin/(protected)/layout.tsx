import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AdminLogoutButton } from "@/features/admin-users/components/logout-button";
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
      <div className="fixed top-4 right-6 z-50">
        <AdminLogoutButton />
      </div>
      {children}
    </AdminAuthProvider>
  );
}

import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin-users/components/login-form";
import { AdminAuthProvider } from "@/features/admin-users/context/admin-auth-context";
import { requirePlatformAdmin } from "@/features/admin-users/service/require-platform-admin.service";
import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";

export default async function AdminLoginPage() {
  try {
    await requirePlatformAdmin();
  } catch (error) {
    // Not signed in, or signed in as a tenant user: show the login form.
    if (
      !(error instanceof AuthenticationError) &&
      !(error instanceof AuthorizationError)
    ) {
      throw error;
    }

    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <AdminAuthProvider>
            <AdminLoginForm />
          </AdminAuthProvider>
        </div>
      </main>
    );
  }

  redirect("/admin");
}

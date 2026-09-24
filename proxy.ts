import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Optimistic gate for the platform-admin portal: refreshes the Supabase
 * session and sends signed-out visitors to the admin login. It does NOT decide
 * who is an admin. That check lives in requirePlatformAdmin(), called by the
 * admin layout and every admin API route.
 *
 * Scoped to /admin only; tenant routes authenticate in their own layouts.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

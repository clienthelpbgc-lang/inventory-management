import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { createClient } from "@/lib/supabase/server";
import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";
import { DatabaseError } from "@/lib/errors/database-error";

import { adminUsers } from "../schemas/admin-user.schema";

/**
 * Authoritative platform-admin check. Call it at the top of every admin route
 * handler and admin layout; the proxy redirect is only a convenience.
 *
 * Throws AuthenticationError (401) when there is no session and
 * AuthorizationError (403) when the session isn't in `admin_users`.
 */
export const requirePlatformAdmin = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError();
  }

  let admin;

  try {
    [admin] = await db
      .select({ id: adminUsers.id, name: adminUsers.name })
      .from(adminUsers)
      .where(eq(adminUsers.id, user.id))
      .limit(1);
  } catch (error) {
    throw new DatabaseError("Failed to verify platform admin", error);
  }

  if (!admin) {
    throw new AuthorizationError("Platform admin access required");
  }

  return { id: user.id, name: admin.name, email: user.email ?? null };
});

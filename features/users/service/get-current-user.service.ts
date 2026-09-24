import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { createClient } from "@/lib/supabase/server";

import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";
import { DatabaseError } from "@/lib/errors/database-error";

import {
  recordUserActivity,
  shouldRecordUserActivity,
} from "./record-user-activity.service";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new AuthenticationError();
  }

  let user;

  try {
    user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
      with: {
        company: true,
      },
    });
  } catch (error) {
    throw new DatabaseError("Failed to retrieve current user", error);
  }

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (!user.isActive) {
    throw new AuthorizationError("User is inactive");
  }

  if (!user.company.isActive) {
    throw new AuthorizationError("Company is inactive");
  }

  // Powers the admin usage dashboard. Runs after the response is sent, and a
  // failure only costs one missed data point.
  if (shouldRecordUserActivity(user.lastSeenAt, new Date())) {
    const { id, companyId } = user;

    after(() =>
      recordUserActivity(id, companyId).catch((error) =>
        console.error("[user-activity] failed to record", error),
      ),
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    companyId: user.company.id,
    companyName: user.company.name,
    companyLogo: user.company.logoUrl,
  };
});
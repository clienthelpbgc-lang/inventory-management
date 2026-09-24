import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db";

import { companies } from "../schemas/company.schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getCompanies() {
  try {
    return await db.query.companies.findMany({
      orderBy: [desc(companies.createdAt)],
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function getActiveCompanyCount() {
  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(companies)
      .where(eq(companies.isActive, true));

    return total;
  } catch (error) {
    mapDatabaseError(error);
  }
}

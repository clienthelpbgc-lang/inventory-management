import "server-only";

import { desc } from "drizzle-orm";

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

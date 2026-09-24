import { NextRequest } from "next/server";
import { ZodType } from "zod";

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodType<T>,
): Promise<T> {
  const body = await request.json();

  return schema.parse(body);
}
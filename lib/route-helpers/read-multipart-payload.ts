import { NextRequest } from "next/server";

import { ValidationError } from "@/lib/errors";

/**
 * Reads a multipart request whose JSON body is sent in a `payload` field
 * alongside any files. Malformed requests become 400s instead of 500s.
 */
export async function readMultipartPayload(request: NextRequest): Promise<{
  formData: FormData;
  payload: Record<string, unknown>;
}> {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    throw new ValidationError(
      "Request must be sent as multipart/form-data with a JSON `payload` field.",
    );
  }

  const payloadRaw = formData.get("payload");

  if (!payloadRaw || typeof payloadRaw !== "string") {
    throw new ValidationError("Payload is required.");
  }

  let payload: unknown;

  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    throw new ValidationError("Payload must be valid JSON.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError("Payload must be a JSON object.");
  }

  return { formData, payload: payload as Record<string, unknown> };
}

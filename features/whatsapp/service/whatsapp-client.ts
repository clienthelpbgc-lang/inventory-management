import { ExternalServiceError } from "@/lib/errors";

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "daily_stock_alert";
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US";

function requireConfig(): { accessToken: string; phoneNumberId: string } {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
  }

  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured");
  }

  return { accessToken, phoneNumberId };
}

function graphUrl(path: string): string {
  const { phoneNumberId } = requireConfig();

  return `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}${path}`;
}

/** Cloud API expects digits only, no leading "+" (e.g. "919876543210"). */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");

  if (digits.length < 10) {
    throw new ExternalServiceError(
      `"${phone}" is not a valid WhatsApp number (expected country code + number)`,
    );
  }

  return digits;
}

export async function uploadWhatsAppMedia(
  pdf: Buffer,
  filename: string,
): Promise<string> {
  const { accessToken } = requireConfig();

  const form = new FormData();

  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append(
    "file",
    new Blob([new Uint8Array(pdf)], { type: "application/pdf" }),
    filename,
  );

  const response = await fetch(graphUrl("/media"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  const json = await response.json();

  if (!response.ok || !json?.id) {
    throw new ExternalServiceError(
      `WhatsApp media upload failed: ${JSON.stringify(json)}`,
    );
  }

  return json.id as string;
}

export async function sendWhatsAppDocumentTemplate(
  to: string,
  mediaId: string,
  filename: string,
  bodyParams: string[],
): Promise<void> {
  const { accessToken } = requireConfig();

  const payload = {
    messaging_product: "whatsapp",
    to: normalizeWhatsAppNumber(to),
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANGUAGE },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: { id: mediaId, filename },
            },
          ],
        },
        {
          type: "body",
          parameters: bodyParams.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };

  const response = await fetch(graphUrl("/messages"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ExternalServiceError(
      `WhatsApp message send failed: ${JSON.stringify(json)}`,
    );
  }
}

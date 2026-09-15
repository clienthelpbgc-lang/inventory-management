import { eq } from "drizzle-orm";

import { db } from "@/db";
import { getStockAlertData } from "@/features/dashboard/service/helpers/get-stock-alert-data";
import { generateStockAlertPDF } from "@/features/dashboard/service/helpers/generate-stock-alert-pdf";
import {
  sendWhatsAppDocumentTemplate,
  uploadWhatsAppMedia,
} from "@/features/whatsapp/service/whatsapp-client";
import { companies } from "../schemas/company.schema";

export type StockAlertWhatsAppContent = {
  companyName: string;
  outOfStockCount: number;
  lowStockCount: number;
  pdf: Buffer;
};

function toISTDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export async function wasStockAlertWhatsAppAlreadySentToday(
  companyId: string,
): Promise<boolean> {
  const [company] = await db
    .select({
      lastLowStockWhatsappSentAt: companies.lastLowStockWhatsappSentAt,
    })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company?.lastLowStockWhatsappSentAt) return false;

  return (
    toISTDateString(company.lastLowStockWhatsappSentAt) ===
    toISTDateString(new Date())
  );
}

export async function markStockAlertWhatsAppSentToday(
  companyId: string,
): Promise<void> {
  await db
    .update(companies)
    .set({ lastLowStockWhatsappSentAt: new Date() })
    .where(eq(companies.id, companyId));
}

export async function buildStockAlertForCompanyWhatsApp(
  companyId: string,
  companyName: string,
  companyLogo: string | null,
): Promise<
  | { shouldSend: false; reason: string }
  | ({ shouldSend: true } & StockAlertWhatsAppContent)
> {
  const data = await getStockAlertData(companyId);

  if (data.outOfStockCount === 0 && data.lowStockCount === 0) {
    return { shouldSend: false, reason: "No low or out-of-stock products" };
  }

  const pdf = await generateStockAlertPDF(data, { companyName, companyLogo });

  return {
    shouldSend: true,
    companyName,
    outOfStockCount: data.outOfStockCount,
    lowStockCount: data.lowStockCount,
    pdf,
  };
}

export async function sendStockAlertWhatsApp(
  phone: string,
  content: StockAlertWhatsAppContent,
): Promise<void> {
  const filename = `Stock-Alert-${new Date().toISOString().slice(0, 10)}.pdf`;

  const mediaId = await uploadWhatsAppMedia(content.pdf, filename);

  await sendWhatsAppDocumentTemplate(phone, mediaId, filename, [
    String(content.outOfStockCount),
    String(content.lowStockCount),
  ]);
}

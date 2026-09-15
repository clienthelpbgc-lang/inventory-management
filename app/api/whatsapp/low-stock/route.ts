import { NextRequest } from "next/server";

import { getReceiverPhones } from "@/features/company/service/get-company-user-phone.service";
import { AuthorizationError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import {
  buildStockAlertForCompanyWhatsApp,
  markStockAlertWhatsAppSentToday,
  sendStockAlertWhatsApp,
  wasStockAlertWhatsAppAlreadySentToday,
} from "@/features/company/service/send-stock-alert-whatsapp.service";

type RecipientResult = {
  companyId: string;
  companyName: string;
  phone: string;
  status: "sent" | "skipped" | "failed";
  reason?: string;
};

export const POST = routeHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw new AuthorizationError("Invalid cron secret");
  }

  const targets = await getReceiverPhones();

  const companyGroups = new Map<
    string,
    { companyName: string; companyLogo: string | null; phones: string[] }
  >();
  const seenPhoneKeysByCompany = new Map<string, Set<string>>();

  for (const target of targets) {
    if (!target.phone) continue;

    // Same number can appear across multiple admin users, sometimes with a
    // different country-code prefix — dedupe on the last 10 digits so we
    // never send the same alert twice to the same person.
    const phoneKey = target.phone.replace(/[^0-9]/g, "").slice(-10);
    const seenKeys = seenPhoneKeysByCompany.get(target.companyId) ?? new Set();

    if (seenKeys.has(phoneKey)) continue;

    seenKeys.add(phoneKey);
    seenPhoneKeysByCompany.set(target.companyId, seenKeys);

    const group = companyGroups.get(target.companyId);

    if (group) {
      group.phones.push(target.phone);
    } else {
      companyGroups.set(target.companyId, {
        companyName: target.companyName,
        companyLogo: target.companyLogo,
        phones: [target.phone],
      });
    }
  }

  async function processCompany(
    companyId: string,
    companyName: string,
    companyLogo: string | null,
    phones: string[],
  ): Promise<RecipientResult[]> {
    const alreadySentToday = await wasStockAlertWhatsAppAlreadySentToday(
      companyId,
    );

    if (alreadySentToday) {
      return phones.map((phone) => ({
        companyId,
        companyName,
        phone,
        status: "skipped",
        reason: "Alert already sent today",
      }));
    }

    const content = await buildStockAlertForCompanyWhatsApp(
      companyId,
      companyName,
      companyLogo,
    );

    if (!content.shouldSend) {
      return phones.map((phone) => ({
        companyId,
        companyName,
        phone,
        status: "skipped",
        reason: content.reason,
      }));
    }

    const sendResults = await Promise.allSettled(
      phones.map((phone) => sendStockAlertWhatsApp(phone, content)),
    );

    const companyResults: RecipientResult[] = [];
    let anySucceeded = false;

    sendResults.forEach((result, index) => {
      const phone = phones[index];

      if (result.status === "fulfilled") {
        anySucceeded = true;
        companyResults.push({ companyId, companyName, phone, status: "sent" });
      } else {
        companyResults.push({
          companyId,
          companyName,
          phone,
          status: "failed",
          reason: String(result.reason),
        });
      }
    });

    if (anySucceeded) {
      await markStockAlertWhatsAppSentToday(companyId);
    }

    return companyResults;
  }

  const perCompanyResults = await Promise.all(
    Array.from(companyGroups.entries()).map(
      ([companyId, { companyName, companyLogo, phones }]) =>
        processCompany(companyId, companyName, companyLogo, phones),
    ),
  );

  const results: RecipientResult[] = perCompanyResults.flat();

  const sent = results.filter((result) => result.status === "sent");
  const failed = results.filter((result) => result.status === "failed");
  const skipped = results.filter((result) => result.status === "skipped");

  return {
    totalRecipients: results.length,
    totalCompanies: companyGroups.size,
    sentCount: sent.length,
    failedCount: failed.length,
    skippedCount: skipped.length,
    summary: results,
    sentTo: sent.map(({ companyName, phone }) => ({ companyName, phone })),
  };
});

import { NextRequest } from "next/server";

import { getReceiverEmails } from "@/features/company/service/get-company-user-email.service";
import { assertCronSecret } from "@/lib/route-helpers/assert-cron-secret";
import { routeHandler } from "@/lib/route-helpers/route-handlers";
import {
  buildStockAlertForCompany,
  markStockAlertSentToday,
  sendStockAlertEmail,
  wasStockAlertAlreadySentToday,
} from "@/features/company/service/send-stock-alert.service";

type RecipientResult = {
  companyId: string;
  companyName: string;
  email: string;
  status: "sent" | "skipped" | "failed";
  reason?: string;
};

export const POST = routeHandler(async (req: NextRequest) => {
  assertCronSecret(req);

  const targets = await getReceiverEmails();

  const companyGroups = new Map<
    string,
    { companyName: string; companyLogo: string | null; emails: string[] }
  >();

  for (const target of targets) {
    const group = companyGroups.get(target.companyId);

    if (group) {
      group.emails.push(target.email);
    } else {
      companyGroups.set(target.companyId, {
        companyName: target.companyName,
        companyLogo: target.companyLogo,
        emails: [target.email],
      });
    }
  }

  async function processCompany(
    companyId: string,
    companyName: string,
    companyLogo: string | null,
    emails: string[],
  ): Promise<RecipientResult[]> {
    const alreadySentToday = await wasStockAlertAlreadySentToday(companyId);

    if (alreadySentToday) {
      return emails.map((email) => ({
        companyId,
        companyName,
        email,
        status: "skipped",
        reason: "Alert already sent today",
      }));
    }

    const content = await buildStockAlertForCompany(
      companyId,
      companyName,
      companyLogo,
    );

    if (!content.shouldSend) {
      return emails.map((email) => ({
        companyId,
        companyName,
        email,
        status: "skipped",
        reason: content.reason,
      }));
    }

    const sendResults = await Promise.allSettled(
      emails.map((email) => sendStockAlertEmail(email, content)),
    );

    const companyResults: RecipientResult[] = [];
    let anySucceeded = false;

    sendResults.forEach((result, index) => {
      const email = emails[index];

      if (result.status === "fulfilled") {
        anySucceeded = true;
        companyResults.push({ companyId, companyName, email, status: "sent" });
      } else {
        companyResults.push({
          companyId,
          companyName,
          email,
          status: "failed",
          reason: String(result.reason),
        });
      }
    });

    if (anySucceeded) {
      await markStockAlertSentToday(companyId);
    }

    return companyResults;
  }

  const perCompanyResults = await Promise.all(
    Array.from(companyGroups.entries()).map(
      ([companyId, { companyName, companyLogo, emails }]) =>
        processCompany(companyId, companyName, companyLogo, emails),
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
    sentTo: sent.map(({ companyName, email }) => ({ companyName, email })),
  };
});

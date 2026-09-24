import { TenantUsageStatus } from "../constants/tenant-usage-status";

/** Timestamps are ISO 8601 strings, as they arrive over JSON. */
export type TenantUsage = {
  companyId: string;
  companyName: string;
  /** Admin enable/suspend switch; independent of `status`. */
  isActive: boolean;
  onboardedAt: string;
  activeUsers: number;
  /** Active users who have signed in at least once. */
  usersSignedIn: number;
  /** Latest signed-in use of the app by any active user. */
  lastSeenAt: string | null;
  /** Latest sale, purchase, return or process order created. */
  lastTransactionAt: string | null;
  /** The later of the two above; drives `status`. */
  lastUsedAt: string | null;
  /** Days in the last 30 on which anyone from the company used the app. */
  activeDaysLast30: number;
  transactionsLast7Days: number;
  transactionsLast30Days: number;
  status: TenantUsageStatus;
};

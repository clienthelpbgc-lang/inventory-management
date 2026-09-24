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
  lastLoginAt: string | null;
  /** Latest sale, purchase, return or process order. */
  lastActivityAt: string | null;
  activityLast7Days: number;
  activityLast30Days: number;
  status: TenantUsageStatus;
};

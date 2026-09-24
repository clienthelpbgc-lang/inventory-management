import { UserRole } from "@/features/auth/constants/user-role";

import { ActivityType } from "../constants/activity-type";
import { TenantUsageStatus } from "../constants/tenant-usage-status";

/** Timestamps are ISO 8601 strings, as they arrive over JSON. */
export type TenantDetail = {
  companyId: string;
  companyName: string;
  isActive: boolean;
  onboardedAt: string;
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  status: TenantUsageStatus;
  lastSeenAt: string | null;
  lastUsedAt: string | null;
  activeDaysLast30: number;
  transactionsByType: {
    type: ActivityType;
    last30Days: number;
    lastAt: string | null;
  }[];
  /** Oldest first; one entry per week, including weeks with no transactions. */
  weeklyTransactions: {
    /** Monday of the week, YYYY-MM-DD. */
    weekStart: string;
    count: number;
  }[];
  /** Active users, most recently seen first. */
  users: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastSeenAt: string | null;
    activeDaysLast30: number;
  }[];
};

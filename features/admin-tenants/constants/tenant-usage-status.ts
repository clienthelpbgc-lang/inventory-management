export const TENANT_USAGE_STATUS = {
  ACTIVE: "ACTIVE",
  LOW_USAGE: "LOW_USAGE",
  INACTIVE: "INACTIVE",
  NEVER_USED: "NEVER_USED",
} as const;

export type TenantUsageStatus =
  (typeof TENANT_USAGE_STATUS)[keyof typeof TENANT_USAGE_STATUS];

/** Days since last activity at which a tenant drops to the next status. */
export const ACTIVE_WITHIN_DAYS = 14;
export const LOW_USAGE_WITHIN_DAYS = 60;

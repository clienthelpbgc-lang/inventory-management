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

export const TENANT_USAGE_STATUS_CONFIG: Record<
  TenantUsageStatus,
  { label: string; description: string; className: string }
> = {
  [TENANT_USAGE_STATUS.ACTIVE]: {
    label: "Active",
    description: `Activity in the last ${ACTIVE_WITHIN_DAYS} days`,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [TENANT_USAGE_STATUS.LOW_USAGE]: {
    label: "Low usage",
    description: `Last activity ${ACTIVE_WITHIN_DAYS}–${LOW_USAGE_WITHIN_DAYS} days ago`,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [TENANT_USAGE_STATUS.INACTIVE]: {
    label: "Inactive",
    description: `No activity for over ${LOW_USAGE_WITHIN_DAYS} days`,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  [TENANT_USAGE_STATUS.NEVER_USED]: {
    label: "Never used",
    description: "No transactions since onboarding",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

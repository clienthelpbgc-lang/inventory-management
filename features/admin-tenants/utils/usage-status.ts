import {
  ACTIVE_WITHIN_DAYS,
  LOW_USAGE_WITHIN_DAYS,
  TENANT_USAGE_STATUS,
  TenantUsageStatus,
} from "../constants/tenant-usage-status";
import { DAY_MS } from "./activity-dates";

export function toUsageStatus(
  lastActivityAt: string | null,
  now: number,
): TenantUsageStatus {
  if (!lastActivityAt) return TENANT_USAGE_STATUS.NEVER_USED;

  const idleDays = (now - Date.parse(lastActivityAt)) / DAY_MS;

  if (idleDays <= ACTIVE_WITHIN_DAYS) return TENANT_USAGE_STATUS.ACTIVE;
  if (idleDays <= LOW_USAGE_WITHIN_DAYS) return TENANT_USAGE_STATUS.LOW_USAGE;

  return TENANT_USAGE_STATUS.INACTIVE;
}

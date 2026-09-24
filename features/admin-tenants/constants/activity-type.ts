export const ACTIVITY_TYPE = {
  SALE: "SALE",
  PURCHASE: "PURCHASE",
  RETURN: "RETURN",
  PROCESS_ORDER: "PROCESS_ORDER",
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

/** Named as the tenant app's sidebar names them. */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  [ACTIVITY_TYPE.SALE]: "Outgoings",
  [ACTIVITY_TYPE.PURCHASE]: "Incomings",
  [ACTIVITY_TYPE.RETURN]: "Returns",
  [ACTIVITY_TYPE.PROCESS_ORDER]: "Process Orders",
};

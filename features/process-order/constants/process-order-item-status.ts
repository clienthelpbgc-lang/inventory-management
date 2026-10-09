export const PROCESS_ORDER_ITEM_STATUS = {
  SENT: "SENT",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export type ProcessOrderItemStatus =
  (typeof PROCESS_ORDER_ITEM_STATUS)[keyof typeof PROCESS_ORDER_ITEM_STATUS];

export const PROCESS_ORDER_ITEM_STATUS_VALUES = Object.values(
  PROCESS_ORDER_ITEM_STATUS
) as [ProcessOrderItemStatus, ...ProcessOrderItemStatus[]];

export const PROCESS_ORDER_ITEM_STATUS_LABELS: Record<
  ProcessOrderItemStatus,
  string
> = {
  [PROCESS_ORDER_ITEM_STATUS.SENT]: "Sent",
  [PROCESS_ORDER_ITEM_STATUS.PARTIALLY_RECEIVED]: "Partially Received",
  [PROCESS_ORDER_ITEM_STATUS.RECEIVED]: "Received",
  [PROCESS_ORDER_ITEM_STATUS.CANCELLED]: "Cancelled",
};

// Items in these states can still receive stock or be cancelled.
export const OPEN_PROCESS_ORDER_ITEM_STATUSES: ProcessOrderItemStatus[] = [
  PROCESS_ORDER_ITEM_STATUS.SENT,
  PROCESS_ORDER_ITEM_STATUS.PARTIALLY_RECEIVED,
];

export const PROCESS_ORDER_ITEM_ACTION = {
  PENDING: "PENDING",
  RECEIVE: "RECEIVE",
  CANCEL: "CANCEL",
} as const;

export type ProcessOrderItemAction =
  (typeof PROCESS_ORDER_ITEM_ACTION)[keyof typeof PROCESS_ORDER_ITEM_ACTION];

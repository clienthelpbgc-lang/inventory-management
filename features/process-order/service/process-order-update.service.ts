import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";

import {
  OPEN_PROCESS_ORDER_ITEM_STATUSES,
  PROCESS_ORDER_ITEM_ACTION,
  PROCESS_ORDER_ITEM_STATUS,
  ProcessOrderItemStatus,
} from "../constants/process-order-item-status";
import {
  PROCESS_ORDER_STATUS,
  ProcessOrderStatus,
} from "../constants/process-order-status";
import { processOrderItems } from "../schemas/process-order-item.schema";
import { processOrders } from "../schemas/process-orders.schema";
import { ProcessOrderUpdateRequestSchema } from "../validation/process-order-item.validation";
import { products } from "@/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";

const isOpen = (status: ProcessOrderItemStatus) =>
  OPEN_PROCESS_ORDER_ITEM_STATUSES.includes(status);

const deriveProcessOrderStatus = (
  items: { status: ProcessOrderItemStatus; receivedQty: number | null }[],
): ProcessOrderStatus => {
  if (items.some(({ status }) => isOpen(status))) {
    return items.some(({ receivedQty }) => (receivedQty ?? 0) > 0)
      ? PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED
      : PROCESS_ORDER_STATUS.SENT;
  }

  return items.every(
    ({ status }) => status === PROCESS_ORDER_ITEM_STATUS.CANCELLED,
  )
    ? PROCESS_ORDER_STATUS.CANCELLED
    : PROCESS_ORDER_STATUS.RECEIVED;
};

export const updateProcessOrder = async (
  companyId: string,
  processOrderId: string,
  rawPayload: unknown,
) => {
  const { items } = ProcessOrderUpdateRequestSchema.parse(rawPayload);

  await db.transaction(async (tx) => {
    // Lock the order so concurrent submits can't double-apply stock changes.
    const [processOrder] = await tx
      .select({ id: processOrders.id })
      .from(processOrders)
      .where(
        and(
          eq(processOrders.id, processOrderId),
          eq(processOrders.companyId, companyId),
        ),
      )
      .for("update");

    if (!processOrder) {
      throw new NotFoundError("Process order not found.");
    }

    const existingItems = await tx
      .select({
        id: processOrderItems.id,
        sentQty: processOrderItems.sentQty,
        receivedQty: processOrderItems.receivedQty,
        sentProductId: processOrderItems.sentProductId,
        receivedProductId: processOrderItems.receivedProductId,
        status: processOrderItems.status,
      })
      .from(processOrderItems)
      .where(eq(processOrderItems.processOrderId, processOrderId));

    const existingItemMap = new Map(
      existingItems.map((item) => [item.id, item]),
    );

    const addStock = (productId: string, qty: number) =>
      tx
        .update(products)
        .set({ currentStock: sql`${products.currentStock} + ${qty}` })
        .where(
          and(eq(products.id, productId), eq(products.companyId, companyId)),
        );

    for (const item of items) {
      const existingItem = existingItemMap.get(item.id);

      if (!existingItem) {
        throw new NotFoundError("One or more process order items were not found.");
      }

      if (item.action === PROCESS_ORDER_ITEM_ACTION.PENDING) continue;

      if (!isOpen(existingItem.status)) {
        throw new ValidationError(
          "This item is already closed and can't be updated.",
        );
      }

      // A conversion (e.g. MS sheet -> mount sets) consumes everything sent,
      // and the received quantity is in a different unit, so it can't be
      // compared against or netted off the sent quantity.
      const isConversion =
        existingItem.sentProductId !== existingItem.receivedProductId;
      const alreadyReceived = existingItem.receivedQty ?? 0;

      let receivedQty = alreadyReceived;
      let status: ProcessOrderItemStatus;

      if (item.action === PROCESS_ORDER_ITEM_ACTION.RECEIVE) {
        const receiveQty = item.receiveQty!;
        receivedQty = alreadyReceived + receiveQty;

        if (!isConversion && receivedQty > existingItem.sentQty) {
          throw new ValidationError(
            "Received quantity cannot be greater than sent quantity.",
          );
        }

        await addStock(existingItem.receivedProductId, receiveQty);

        const fullyReceived =
          !isConversion && receivedQty === existingItem.sentQty;

        status =
          fullyReceived || item.markComplete
            ? PROCESS_ORDER_ITEM_STATUS.RECEIVED
            : PROCESS_ORDER_ITEM_STATUS.PARTIALLY_RECEIVED;
      } else {
        // Cancel whatever hasn't come back yet. Unprocessed stock of the same
        // product returns to inventory; a conversion only returns stock if
        // nothing was converted yet.
        const returnQty = isConversion
          ? alreadyReceived === 0
            ? existingItem.sentQty
            : 0
          : existingItem.sentQty - alreadyReceived;

        if (returnQty > 0) {
          await addStock(existingItem.sentProductId, returnQty);
        }

        status =
          alreadyReceived > 0
            ? PROCESS_ORDER_ITEM_STATUS.RECEIVED
            : PROCESS_ORDER_ITEM_STATUS.CANCELLED;
      }

      await tx
        .update(processOrderItems)
        .set({
          receivedQty,
          status,
          processingCost: item.processingCost,
          receivedDate:
            item.action === PROCESS_ORDER_ITEM_ACTION.RECEIVE
              ? (item.receivedDate ?? new Date())
              : undefined,
          location: item.location,
        })
        .where(eq(processOrderItems.id, item.id));

      existingItemMap.set(item.id, { ...existingItem, receivedQty, status });
    }

    await tx
      .update(processOrders)
      .set({
        status: deriveProcessOrderStatus([...existingItemMap.values()]),
      })
      .where(eq(processOrders.id, processOrderId));
  });
};

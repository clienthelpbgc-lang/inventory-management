import { db } from "@/db";
import {
  ProcessOrderCreate,
  ProcessOrderCreatePayload,
  ProcessOrderItemCreate,
  ProcessOrderItemCreateForm,
} from "../types/process-order.types";
import { generateProcessOrderNumber } from "./generate-process-order.service";
import { PROCESS_ORDER_STATUS } from "../constants/process-order-status";
import { processOrders } from "../schemas/process-orders.schema";
import { PROCESS_ORDER_ITEM_STATUS } from "../constants/process-order-item-status";
import { processOrderItems } from "../schemas/process-order-item.schema";
import { ProcessOrderCreateSchema } from "../validation/process-order.validation";
import {
  ProcessOrderItemCreateSchema,
} from "../validation/process-order-item.validation";
import z from "zod";
import { products } from "@/features/product/schemas/product.schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { ValidationError } from "@/lib/errors";

export const createProcessOrder = async (
  companyId: string,
  payload: ProcessOrderCreatePayload,
) => {
  const { processOrder: processOrderPayload, items } = payload
  await db.transaction(async (tx) => {
    const processOrderNumber = await generateProcessOrderNumber(tx, companyId);
    const newProcessOrder: ProcessOrderCreate = ProcessOrderCreateSchema.parse({
      companyId,
      processOrderNo: processOrderNumber,
      status: PROCESS_ORDER_STATUS.SENT,
      vendorName: processOrderPayload.vendorName ?? null,
      remarks: processOrderPayload.remarks?.trim() || null,
    });

    const [createdProcessOrder] = await tx
      .insert(processOrders)
      .values(newProcessOrder)
      .returning();

    const newProcessOrderItems: ProcessOrderItemCreate[] = items.map(
      (item: ProcessOrderItemCreateForm) => ({
        processOrderId: createdProcessOrder.id,
        sentProductId: item.sentProductId,
        receivedProductId: item.receivedProductId,
        sentQty: item.sentQty,
        sentDate: new Date(item.sentDate),
        processingCost: item.processingCost ?? null,
        location: item.location ?? null,
        status: PROCESS_ORDER_ITEM_STATUS.SENT,
      }),
    );

    z.array(ProcessOrderItemCreateSchema).parse(newProcessOrderItems);
    await tx.insert(processOrderItems).values(newProcessOrderItems);

    for (const item of newProcessOrderItems) {
      const updated = await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} - ${item.sentQty}`,
        })
        .where(
          and(
            eq(products.id, item.sentProductId),
            eq(products.companyId, companyId),
            gte(products.currentStock, item.sentQty),
          ),
        )
        .returning({ id: products.id });

      if (updated.length === 0) {
        throw new ValidationError(`Insufficient stock for a product`);
      }
    }
  });
};

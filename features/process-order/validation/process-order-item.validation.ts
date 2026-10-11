import { z } from "zod";
import {
  PROCESS_ORDER_ITEM_ACTION,
  PROCESS_ORDER_ITEM_STATUS,
} from "../constants/process-order-item-status";
import { ProcessOrderCreateFormSchema } from "./process-order.validation";

export const ProcessOrderItemBaseSchema = z.object({
  id: z.uuid(),
  processOrderId: z.uuid(),
  sentProductId: z.uuid("Please select a product"),
  receivedProductId: z.uuid("Please select a product"),
  sentQty: z.number().positive(),
  receivedQty: z.number().min(0),
  sentDate: z.date(),
  receivedDate: z.date().nullable().optional(),
  processingCost: z.number().min(0).nullable().optional(),
  location: z.string().trim().nullable().optional(),
});

export const ProcessOrderItemCreateFormSchema = ProcessOrderItemBaseSchema.pick(
  {
    sentProductId: true,
    receivedProductId: true,
    sentQty: true,
    sentDate: true,
    processingCost: true,
    location: true,
  },
);

export const ProcessOrderItemCreateSchema =
  ProcessOrderItemCreateFormSchema.extend({
    status: z.literal(PROCESS_ORDER_ITEM_STATUS.SENT),
    processOrderId: ProcessOrderItemBaseSchema.shape.processOrderId,
  });

export const ProcessOrderCreatePayloadSchema = z.object({
  processOrder: ProcessOrderCreateFormSchema,
  items: z.array(ProcessOrderItemCreateFormSchema).min(1),
});

const ProcessOrderItemUpdateBaseSchema = z.object({
  id: z.uuid(),
  action: z.enum([
    PROCESS_ORDER_ITEM_ACTION.PENDING,
    PROCESS_ORDER_ITEM_ACTION.RECEIVE,
    PROCESS_ORDER_ITEM_ACTION.CANCEL,
  ]),
  // Quantity received in this update (added to anything received earlier).
  receiveQty: z
    .number("Enter the quantity received")
    .positive("Quantity must be greater than 0")
    .optional(),
  // Close the item after this receipt even if less than sent came back.
  markComplete: z.boolean().optional(),
  receivedDate: z.date().nullable().optional(),
  processingCost: z.number().min(0).nullable().optional(),
  location: z.string().trim().nullable().optional(),
});

const requireReceiveQty = <T extends { action: string; receiveQty?: number }>(
  item: T,
) =>
  item.action !== PROCESS_ORDER_ITEM_ACTION.RECEIVE ||
  item.receiveQty !== undefined;

const receiveQtyError = {
  message: "Enter the quantity received",
  path: ["receiveQty"],
};

export const ProcessOrderItemUpdateFormSchema =
  ProcessOrderItemUpdateBaseSchema.refine(requireReceiveQty, receiveQtyError);

export const ProcessOrderUpdatePayloadSchema = z.object({
  items: z.array(ProcessOrderItemUpdateFormSchema),
});

// Same shape as the form, but dates arrive as ISO strings over JSON.
export const ProcessOrderUpdateRequestSchema = z.object({
  items: z.array(
    ProcessOrderItemUpdateBaseSchema.extend({
      receivedDate: z.coerce.date().nullable().optional(),
    }).refine(requireReceiveQty, receiveQtyError),
  ),
});

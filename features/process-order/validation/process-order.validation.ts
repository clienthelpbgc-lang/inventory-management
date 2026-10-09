import { z } from "zod";

import {
  PROCESS_ORDER_STATUS,
  PROCESS_ORDER_STATUS_VALUES,
} from "../constants/process-order-status";

export const ProcessOrderStatusSchema = z.enum(PROCESS_ORDER_STATUS_VALUES);

export const ProcessOrderBaseSchema = z.object({
  processOrderNo: z.string().min(1, "Process Order Number is required"),

  // Blank means an internal process with no outside vendor.
  vendorName: z
    .string()
    .trim()
    .max(255, "Vendor name cannot exceed 255 characters")
    .transform((value) => value || null)
    .optional()
    .nullable(),

  remarks: z.string().trim().optional().nullable(),
});

export const ProcessOrderCreateFormSchema = ProcessOrderBaseSchema.pick({
  vendorName: true,
  remarks: true,
});

export const ProcessOrderCreateSchema = ProcessOrderBaseSchema.extend({
  status: z.literal(PROCESS_ORDER_STATUS.SENT),
  companyId: z.uuid().nonempty("Company ID is required"),
});

export const ProcessOrderUpdateSchema = ProcessOrderBaseSchema.partial().extend(
  {
    status: ProcessOrderStatusSchema.optional(),
  },
);

import { z } from "zod";

export const SaleReturnItemSchema = z.object({
  saleItemId: z.uuid("Sale item is required"),

  productId: z.uuid("Product is required"),

  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .positive("Quantity must be greater than 0"),
});

export const CreateSaleReturnFormSchema = z
  .object({
    saleId: z.uuid("Sale is required"),

    returnDate: z.string().min(1, "Return date is required"),

    reason: z
      .string()
      .trim()
      .max(1000, "Reason is too long")
      .nullable()
      .optional(),

    items: z
      .array(SaleReturnItemSchema)
      .min(1, "At least one item is required"),
  })
  .refine(
    (data) => {
      const saleItemIds = data.items.map((item) => item.saleItemId);

      return new Set(saleItemIds).size === saleItemIds.length;
    },
    {
      path: ["items"],
      message: "Duplicate items are not allowed",
    },
  );

export const RejectSaleReturnSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .max(1000, "Rejection reason is too long")
    .nullable()
    .optional(),
});

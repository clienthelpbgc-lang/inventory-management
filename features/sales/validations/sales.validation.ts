import { z } from "zod";

export const SaleItemSchema = z.object({
  productId: z.uuid("Product is required"),

  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .int()
    .min(1, "Quantity must be at least 1"),

  sellingPrice: z.coerce
    .number({
      error: "Selling price must be a number",
    })
    .nonnegative("Selling price must be 0 or greater")
    .default(0),
});

export const CreateSaleFormSchema = z
  .object({
    saleDate: z.string().min(1, "Sale date is required"),

    remarks: z
      .string()
      .trim()
      .max(1000, "Remarks is too long")
      .nullable()
      .optional(),
    image: z.instanceof(File).optional().or(z.null()),
    workOrderNumber: z
      .string()
      .trim()
      .max(100, "Work order number is too long")
      .optional(),
    challanNumber: z
      .string()
      .trim()
      .max(100, "Challan number is too long")
      .optional(),
    invoiceNumber: z
      .string()
      .trim()
      .max(100, "Invoice number is too long")
      .optional(),

    isWarranty: z.boolean().optional(),

    soldTo: z
      .string()
      .trim()
      .max(500, "field value is too long")
      .nullable()
      .optional(),

    items: z.array(SaleItemSchema).min(1, "At least one item is required"),
  })
  .refine(
    (data) => {
      const productIds = data.items.map((item) => item.productId);

      return new Set(productIds).size === productIds.length;
    },
    {
      path: ["items"],
      message: "Duplicate products are not allowed",
    },
  );

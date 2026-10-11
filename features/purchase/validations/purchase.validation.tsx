import { z } from "zod";

export const PurchaseItemSchema = z.object({
  productId: z.uuid("Product is required"),
  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .positive("Quantity must be greater than 0"),
  purchasePrice: z.coerce
    .number({
      error: "Purchase price is required",
    })
    .positive("Purchase price must be greater than 0"),
});

export const CreatePurchaseFormSchema = z
  .object({
    supplierId: z.uuid("Supplier is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    challanNumber: z.string().trim().max(100, "Challan number is too long").optional(),
    invoiceNumber: z.string().trim().max(100, "Invoice number is too long").optional(),
    remarks: z.string().trim().max(1000, "Remarks is too long").optional(),
    image: z.instanceof(File).optional().or(z.null()),
    items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
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

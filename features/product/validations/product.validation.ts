import z from "zod";

import { STOCK_MOVEMENT_OPTIONS } from "../constants/product-stock-movement";

const stockMovementEnum = z.enum(
  STOCK_MOVEMENT_OPTIONS as [string, ...string[]],
);

export const CreateProductFormSchema = z.object({
  name: z
    .string("Product name is required")
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name cannot exceed 255 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  category: z.string("Category is required").min(1, "Category is required"),

  unit: z
    .string("Unit is required")
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit cannot exceed 50 characters"),

  minOrderQty: z
    .number({
      message: "Minimum order quantity is required",
    })
    .min(0, "Minimum order quantity cannot be negative"),

  maxOrderQty: z
    .number({
      message: "Maximum order quantity is required",
    })
    .min(0, "Maximum order quantity cannot be negative"),

  reorderQty: z
    .number({
      message: "Reorder quantity is required",
    })
    .min(0, "Reorder quantity cannot be negative"),

  openingStock: z
    .number({
      message: "Opening stock is required",
    })
    .min(0, "Opening stock cannot be negative"),

  unitCost: z
    .number({
      message: "Unit cost must be a valid number",
    })
    .min(0, "Unit cost cannot be negative")
    .optional(),

  location: z
    .string()
    .trim()
    .max(255, "Location cannot exceed 255 characters")
    .optional(),

  stockMovement: stockMovementEnum.optional(),

  images: z
    .array(
      z.instanceof(File, {
        message: "Please select valid image files",
      }),
    )
    .max(5, "You can upload up to 5 images per product")
    .optional(),
  supplierIds: z.array(z.uuid("Invalid supplier ID")),
});

export const UpdateProductFormSchema = CreateProductFormSchema.omit({
  images: true,
  openingStock: true,
}).extend({
  currentStock: z
    .number({
      message: "Current stock is required",
    })
    .min(0, "Current stock cannot be negative"),
  images: z
    .array(
      z.union([
        z.instanceof(File, {
          message: "Please select valid image files",
        }),
        z.url(),
      ]),
    )
    .max(5, "You can upload up to 5 images per product")
    .optional(),
});

export const CreateProductDTOSchema = z.object({
  companyId: z.uuid("Invalid company ID"),
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255, "Product name cannot exceed 255 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable(),
  category: z.string().min(1, "Category is required"),
  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(50, "Unit cannot exceed 50 characters"),
  minOrderQty: z
    .number({
      message: "Minimum order quantity is required",
    })
    .min(0, "Minimum order quantity cannot be negative"),
  maxOrderQty: z
    .number({
      message: "Maximum order quantity is required",
    })
    .min(0, "Maximum order quantity cannot be negative"),
  reorderQty: z
    .number()
    .min(0, "Reorder quantity cannot be negative"),
  openingStock: z
    .number({
      message: "Opening stock is required",
    })
    .min(0, "Opening stock cannot be negative"),
  currentStock: z
    .number({
      message: "Current stock is required",
    })
    .min(0, "Current stock cannot be negative"),
  unitCost: z.string().nullable(),
  location: z
    .string()
    .trim()
    .max(255, "Location cannot exceed 255 characters")
    .nullable(),
  stockMovement: stockMovementEnum.nullable(),
  images: z.array(z.string()).max(5, "A product can have at most 5 images"),
});

export const UpdateProductDTOSchema = CreateProductDTOSchema.omit({
  openingStock: true,
});

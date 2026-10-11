import { ParsedProductRow } from "../../types/parsed-product-row";

export type ProductImportFieldKey = keyof Omit<ParsedProductRow, "rowNumber">;

type BaseField = {
  key: ProductImportFieldKey;
  header: string;
  width: number;
  required: boolean;
};

export type ProductImportTextField = BaseField & {
  type: "text";
};

export type ProductImportNumberField = BaseField & {
  type: "number";
  integer?: boolean;
  min?: number;
};

export type ProductImportField = ProductImportTextField | ProductImportNumberField;

// Single source of truth for the bulk product import template: column
// headers/order, required vs optional, and numeric constraints. Template
// generation, parsing, and row validation all derive from this list, so a
// new column only needs an entry here (plus its key on ParsedProductRow).
export const PRODUCT_IMPORT_FIELDS: ProductImportField[] = [
  { key: "name", header: "Product Name", width: 35, type: "text", required: true },
  { key: "description", header: "Description", width: 40, type: "text", required: false },
  { key: "category", header: "Category", width: 20, type: "text", required: true },
  { key: "unit", header: "Unit", width: 15, type: "text", required: true },
  { key: "minOrderQty", header: "Min Order Qty", width: 16, type: "number", required: true, min: 0 },
  { key: "maxOrderQty", header: "Max Order Qty", width: 16, type: "number", required: true, min: 0 },
  { key: "reorderQty", header: "Reorder Qty", width: 16, type: "number", required: true, min: 0 },
  { key: "openingStock", header: "Opening Stock", width: 16, type: "number", required: true, min: 0 },
  { key: "unitCost", header: "Unit Cost", width: 16, type: "number", required: false, min: 0 },
  { key: "location", header: "Location", width: 25, type: "text", required: false },
];

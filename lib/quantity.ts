import { numeric } from "drizzle-orm/pg-core";

// Quantities may be fractional (e.g. 2.5 kg). Stored as numeric and read back
// as a JS number so existing arithmetic keeps working.
export const quantityColumn = (name: string) =>
  numeric(name, { precision: 14, scale: 3, mode: "number" });

// Round to the column's 3-decimal scale so float error (0.3 - 0.1) doesn't
// break comparisons between quantities.
export const roundQty = (value: number) => Math.round(value * 1000) / 1000;

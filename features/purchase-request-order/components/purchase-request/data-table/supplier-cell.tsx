"use client";

import { useState } from "react";
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SupplierPicker } from "@/features/suppliers/components/supplier-picker";

type SupplierCellProps<T extends FieldValues> = {
  baseName: Path<T>;
};

export function SupplierCell<T extends FieldValues>({
  baseName,
}: SupplierCellProps<T>) {
  const { control, watch, setValue } = useFormContext<T>();
  const [open, setOpen] = useState(false);

  const supplierIdName = `${baseName}.supplierId` as Path<T>;
  const supplierNameName = `${baseName}.supplierName` as Path<T>;

  const supplierName = watch(supplierNameName);

  return (
    <div className="space-y-1">
      <Controller
        control={control}
        name={supplierIdName}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-56 justify-between"
                title={supplierName || undefined}
              >
                <span className="truncate">
                  {supplierName || "Select Supplier"}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0">
              <SupplierPicker
                popover
                value={field.value}
                onChange={(supplier) => {
                  field.onChange(supplier.id);

                  setValue(
                    supplierNameName,
                    supplier.companyName as PathValue<T, typeof supplierNameName>,
                    {
                      shouldDirty: true,
                    },
                  );

                  setOpen(false); // Close after selection
                }}
                onClear={() => {
                  field.onChange("");

                  setValue(
                    supplierNameName,
                    "" as PathValue<T, typeof supplierNameName>,
                    {
                      shouldDirty: true,
                    },
                  );

                  setOpen(false); // Optional: close after clearing
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      />

      {!supplierName && (
        <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Supplier not assigned.</span>
        </div>
      )}
    </div>
  );
}
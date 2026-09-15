"use client";

import { useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { CreatePurchaseFormType } from "../types/purchase.type";
import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { Supplier } from "@/features/suppliers/types/suppliers.type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductPicker } from "@/features/product/components/product-picker";
import { ImageUpload } from "@/components/react-hook-form-fields/image-upload";
import { SupplierPicker } from "@/features/suppliers/components/supplier-picker";

export function PurchaseForm() {
  const form = useFormContext<CreatePurchaseFormType>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");

  const productIdPaths = useMemo(
    () => fields.map((_, index) => `items.${index}.productId` as const),
    [fields],
  );

  const watchedProductIds = useWatch({
    control: form.control,
    name: productIdPaths,
  });

  const selectedProductIds = useMemo(
    () => watchedProductIds.filter(Boolean) as string[],
    [watchedProductIds],
  );

  const grandTotal =
    items?.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.purchasePrice || 0),
      0,
    ) ?? 0;

  return (
    <div className="space-y-8">
      {/* Purchase Details */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Purchase Details</h2>

          <p className="text-sm text-muted-foreground">
            Enter supplier and purchase information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <SupplierPicker
                value={field.value}
                onChange={(supplier) => {
                  field.onChange(supplier.id);
                }}
                onClear={() => {
                  field.onChange("");
                }}
              />
            )}
          />

          <RHFInput
            name="purchaseDate"
            type="date"
            label="Purchase Date"
            helperText="Date when the purchase was made."
            required
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <RHFInput
            name="challanNumber"
            type="text"
            label="Challan Number"
            helperText="Enter the challan number."
          />

          <RHFInput
            name="invoiceNumber"
            type="text"
            label="Invoice Number"
            helperText="Enter the invoice number."
          />
        </div>

        <RHFTextarea
          name="remarks"
          label="Remarks"
          placeholder="Additional notes..."
          helperText="Optional notes for this purchase."
        />
        <ImageUpload
          label="Incoming Image"
          description="Upload a image of incomings"
          value={form.watch("image")}
          onChange={(file) =>
            form.setValue("image", file, {
              shouldValidate: true,
            })
          }
        />
      </section>

      <Separator />

      {/* Purchase Items */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Purchase Items</h2>

            <p className="text-sm text-muted-foreground">
              Add products included in this purchase.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                productId: "",
                quantity: 1,
                purchasePrice: 0,
              })
            }
          >
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => {
            const quantity = items?.[index]?.quantity ?? 0;

            const price = items?.[index]?.purchasePrice ?? 0;

            const total = quantity * price;

            return (
              <div key={field.id} className="rounded-lg border p-4">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <Controller
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <ProductPicker
                          value={field.value}
                          selectedProductIds={selectedProductIds}
                          onChange={(product) => {
                            field.onChange(product.id);

                            if (product.unitCost) {
                              form.setValue(
                                `items.${index}.purchasePrice`,
                                Number(product.unitCost),
                                { shouldValidate: true },
                              );
                            }
                          }}
                          onClear={() => field.onChange("")}
                        />
                      )}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <RHFInput
                      name={`items.${index}.quantity`}
                      type="number"
                      label="Quantity"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <RHFInput
                      name={`items.${index}.purchasePrice`}
                      type="number"
                      label="Price"
                    />
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <Label>Total</Label>
                    <Input value={total} disabled />
                  </div>

                  <div className="flex items-end lg:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Summary */}
      <section className="rounded-xl border bg-muted/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Purchase Summary</h3>

            <p className="text-sm text-muted-foreground">
              Calculated from current line items.
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Grand Total</p>

            <p className="text-2xl font-bold">₹{grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { CreateSaleFormType } from "../types/sales.type";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ProductPicker } from "@/features/product/components/product-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/react-hook-form-fields/image-upload";

export function SaleForm() {
  const form = useFormContext<CreateSaleFormType>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");

  const productIdPaths = useMemo(
    () =>
      fields.map(
        (_, index) => `items.${index}.productId` as const,
      ),
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
      (sum, item) => sum + (item.quantity || 0) * (item.sellingPrice || 0),
      0,
    ) ?? 0;

  return (
    <div className="space-y-8">
      {/* Sale Details */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Sale Details</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <RHFInput
            name="saleDate"
            type="date"
            label="Outgoing Date"
            helperText="Date when the outgoing was made."
            required
          />
          <RHFInput
            name="soldTo"
            label="Customer Name"
            helperText="Enter the customer, company, or person the items were sold to."
          />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <RHFInput
            name="workOrderNumber"
            label="Work Order Number"
            helperText="Enter the work order number."
          />
          <RHFInput
            name="challanNumber"
            label="Challan Number"
            helperText="Enter the challan number."
          />
          <RHFInput
            name="invoiceNumber"
            label="Invoice Number"
            helperText="Enter the invoice number."
          />
        </div>

        <RHFTextarea
          name="remarks"
          label="Remarks"
          placeholder="Additional notes..."
          helperText="Optional notes for this outgoing."
        />

        <Controller
          control={form.control}
          name="isWarranty"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="isWarranty"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
              />
              <Label htmlFor="isWarranty" className="font-normal">
                Under warranty
              </Label>
            </div>
          )}
        />

        <ImageUpload
          label="Outgoing Image"
          description="Upload a Outgoing image"
          value={form.watch("image")}
          onChange={(file) =>
            form.setValue("image", file, {
              shouldValidate: true,
            })
          }
        />
      </section>

      <Separator />

      {/* Sale Items */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Outgoing Items</h2>

            <p className="text-sm text-muted-foreground">
              Add products included in this outgoing.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                productId: "",
                quantity: 1,
                sellingPrice: 0,
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

            const price = items?.[index]?.sellingPrice ?? 0;

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
                                `items.${index}.sellingPrice`,
                                Number(product.unitCost),
                                { shouldValidate: true },
                              );
                            }
                          }}
                          onClear={() => field.onChange("")}
                          required
                        />
                      )}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <RHFInput
                      name={`items.${index}.quantity`}
                      type="number"
                      label="Quantity"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <RHFInput
                      name={`items.${index}.sellingPrice`}
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
            <h3 className="font-medium">Sale Summary</h3>

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

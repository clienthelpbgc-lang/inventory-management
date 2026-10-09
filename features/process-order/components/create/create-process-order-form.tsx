"use client";

import { useMemo } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";

import { ProcessOrderCreatePayload } from "../../types/process-order.types";
import { ProcessOrderCreatePayloadSchema } from "../../validation/process-order-item.validation";
import {
  PROCESS_ORDER_DEFAULT_VALUES,
  PROCESS_ORDER_ITEM_DEFAULT,
} from "../../constants/form-default";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/features/product/components/product-picker";
import { RHFDatePicker } from "@/components/react-hook-form-fields/rhf-datepicker";
import { useCreateProcessOrder } from "../../hooks/use-create-process-order";

const CreateProcessOrderForm = () => {
  const { mutateAsync, isPending } = useCreateProcessOrder();
  const form = useForm<ProcessOrderCreatePayload>({
    resolver: zodResolver(ProcessOrderCreatePayloadSchema),
    defaultValues: PROCESS_ORDER_DEFAULT_VALUES,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const sentProductIdPaths = useMemo(
    () => fields.map((_, index) => `items.${index}.sentProductId` as const),
    [fields],
  );

  const receivedProductIdPaths = useMemo(
    () =>
      fields.map((_, index) => `items.${index}.receivedProductId` as const),
    [fields],
  );

  const watchedSentProductIds = useWatch({
    control: form.control,
    name: sentProductIdPaths,
  });

  const watchedReceivedProductIds = useWatch({
    control: form.control,
    name: receivedProductIdPaths,
  });

  const onSubmit = async (data: ProcessOrderCreatePayload) => {
    try {
      await mutateAsync(data);
      form.reset(PROCESS_ORDER_DEFAULT_VALUES);
    } catch {}
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">Process Details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RHFInput<ProcessOrderCreatePayload>
                name="processOrder.vendorName"
                label="Vendor Name"
                type="text"
                placeholder="Enter Vendor Name"
                helperText="Leave empty if internal process"
              />
              <RHFTextarea<ProcessOrderCreatePayload>
                name="processOrder.remarks"
                label="Remarks"
                placeholder="Enter remarks of the process..."
              />
            </div>
            <hr />
            <h2 className="text-xl font-semibold">Process Items</h2>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Item #{index + 1}</h3>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={fields.length === 1}
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Controller
                        control={form.control}
                        name={`items.${index}.sentProductId`}
                        render={({ field, fieldState }) => (
                          <ProductPicker
                            error={fieldState.error?.message}
                            label="Sent Product"
                            value={field.value}
                            selectedProductIds={
                              watchedSentProductIds.filter(
                                (id, i) => i !== index && Boolean(id),
                              ) as string[]
                            }
                            onChange={(product) => field.onChange(product.id)}
                            onClear={() => field.onChange("")}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name={`items.${index}.receivedProductId`}
                        render={({ field, fieldState }) => (
                          <ProductPicker
                            error={fieldState.error?.message}
                            label="Received Product"
                            value={field.value}
                            selectedProductIds={
                              watchedReceivedProductIds.filter(
                                (id, i) => i !== index && Boolean(id),
                              ) as string[]
                            }
                            onChange={(product) => field.onChange(product.id)}
                            onClear={() => field.onChange("")}
                          />
                        )}
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.sentQty`}
                        type="number"
                        label="Sent Quantity"
                      />

                      <RHFDatePicker<ProcessOrderCreatePayload>
                        name={`items.${index}.sentDate`}
                        label="Sent Date"
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.processingCost`}
                        type="number"
                        label="Processing Cost"
                      />

                      <RHFInput<ProcessOrderCreatePayload>
                        name={`items.${index}.location`}
                        label="Location"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    ...PROCESS_ORDER_ITEM_DEFAULT,
                  })
                }
              >
                Add Item
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending
                ? "Creating..."
                : "Create Process Order"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};

export default CreateProcessOrderForm;

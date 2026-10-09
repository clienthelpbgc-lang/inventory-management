"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { PurchaseRequestTable } from "@/features/purchase-request-order/components/purchase-request/data-table/purchase-request-table";
import { useCreatePurchaseRequest } from "@/features/purchase-request-order/hooks/use-create-PR";
import { useGetPRProduct } from "@/features/purchase-request-order/hooks/use-get-low-stock-products";
import { PurchaseRequestFormType } from "@/features/purchase-request-order/types/purchase-request.type";
import { PurchaseRequestFormSchema } from "@/features/purchase-request-order/validation/purchase-request-form";

const defaultValues: PurchaseRequestFormType = {
  remarks: "",
  items: [],
};

const PurchaseRequestCreationPage = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: lowStockProducts = [], isLoading } = useGetPRProduct();
  const { mutate: createPurchaseRequest, isPending: isPRCreatePending } =
    useCreatePurchaseRequest();

  const form = useForm<PurchaseRequestFormType>({
    // resolver: zodResolver(PurchaseRequestFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!lowStockProducts.length) return;

    form.reset({
      remarks: "",
      items: lowStockProducts.map((product) => ({
        productId: product.productId,
        supplierId: product.supplierId ?? null,
        supplierName: product.supplierName ?? null,
        requestedQty: product.suggestedQty ?? product.reorderQty,
      })),
    });
  }, [form, lowStockProducts]);

  const onSubmit = ({ remarks, items }: PurchaseRequestFormType) => {
    const selectedItems = items.filter(
      ({ productId }) => rowSelection[productId],
    );

    if (selectedItems.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    // Validate only the selected items
    const result = PurchaseRequestFormSchema.safeParse({
      remarks,
      items: selectedItems,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }

    createPurchaseRequest(result.data);
  };

  const onInvalid = () => {
    toast.error("Please fix the validation errors before continuing.");
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Purchase Request
          </h1>

          <p className="mt-1 text-muted-foreground">
            Select products, review quantities, assign suppliers, and generate a
            purchase request.
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PurchaseRequestTable
            data={lowStockProducts}
            isLoading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            isPRCreatePending={isPRCreatePending}
          />
        </form>
      </FormProvider>
   </>
  );
};

export default PurchaseRequestCreationPage;

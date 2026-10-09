"use client";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/features/sales/components/add-sale-form";
import { CREATE_SALE_FORM_DEFAULT } from "@/features/sales/constants/form-default";
import { useCreateSale } from "@/features/sales/hooks/use-create-sale";
import { CreateSaleFormType } from "@/features/sales/types/sales.type";
import { CreateSaleFormSchema } from "@/features/sales/validations/sales.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const AddSalePage = () => {
  const createSaleForm = useForm({
    resolver: zodResolver(CreateSaleFormSchema),
    defaultValues: CREATE_SALE_FORM_DEFAULT,
    mode: "onTouched",
  });

  const { mutate, isPending } = useCreateSale();

  const onSubmit = (data: CreateSaleFormType) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Outgoing created successfully");
        createSaleForm.reset();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to create Outgoing"));
      },
    });
  };
  return (

      <div className="mx-auto w-full space-y-8">
        <div className="flex justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add New Outgoing
            </h1>

            <p className="mt-2 text-muted-foreground">
              inventory procurement and operational management.
            </p>
          </div>
          <Button asChild>
            <Link href={"/sales"}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <FormProvider {...createSaleForm}>
            <form
              onSubmit={createSaleForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <SaleForm />

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <p className="text-sm font-medium">
                    Ready to create this Outgoing?
                  </p>
                </div>

                <Button type="submit" disabled={isPending} size="lg">
                  {isPending ? "Creating Outgoing..." : "Create Outgoing"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
  );
};

export default AddSalePage;

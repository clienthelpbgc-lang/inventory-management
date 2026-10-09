"use client";
import { Button } from "@/components/ui/button";
import { PurchaseForm } from "@/features/purchase/components/add-purchase-form";
import { CREATE_PURCHASE_FORM_DEFAULT } from "@/features/purchase/constants/form-defaults";
import { useCreatePurchase } from "@/features/purchase/hooks/use-create-purchase";
import { CreatePurchaseFormType } from "@/features/purchase/types/purchase.type";
import { CreatePurchaseFormSchema } from "@/features/purchase/validations/purchase.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const AddPurchasePage = () => {
  const createPurchaseForm = useForm({
    resolver: zodResolver(CreatePurchaseFormSchema),
    defaultValues: CREATE_PURCHASE_FORM_DEFAULT,
    mode: "onTouched",
  });

  const { mutate, isPending } = useCreatePurchase();

  const onSubmit = (data: CreatePurchaseFormType) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Incoming created successfully");
        createPurchaseForm.reset();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to create Incoming"));
      },
    });
  };
  return (
      <div className="mx-auto w-full space-y-8">
        <div className="flex justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add New Incoming
            </h1>

            <p className="mt-2 text-muted-foreground">
              inventory procurement and operational management.
            </p>
          </div>
          <Button asChild>
            <Link href={"/purchases"}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <FormProvider {...createPurchaseForm}>
            <form
              onSubmit={createPurchaseForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <PurchaseForm />

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <p className="text-sm font-medium">
                    Ready to create this Incoming?
                  </p>
                </div>

                <Button type="submit" disabled={isPending} size="lg">
                  {isPending ? "Creating Incoming..." : "Create Incoming"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
  );
};

export default AddPurchasePage;

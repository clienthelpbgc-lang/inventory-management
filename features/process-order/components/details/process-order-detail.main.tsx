import { useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ProcessOrderDetail,
  ProcessOrderUpdatePayload,
} from "../../types/process-order.types";
import { ProcessOrderUpdatePayloadSchema } from "../../validation/process-order-item.validation";
import { PROCESS_ORDER_ITEM_ACTION } from "../../constants/process-order-item-status";

import { ProcessOrderHeader } from "./process-order-header";
import { ProcessOrderItems } from "./process-order-detail-item";
import { useUpdateProcessOrder } from "../../hooks/use-update-process-order";

const ProcessOrderDetailMain = ({
  processOrder,
}: {
  processOrder: ProcessOrderDetail;
}) => {
  const { mutateAsync, isPending } = useUpdateProcessOrder(processOrder.id);
  const form = useForm<ProcessOrderUpdatePayload>({
    resolver: zodResolver(ProcessOrderUpdatePayloadSchema),

    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    if (!processOrder?.items) return;

    form.reset({
      items: processOrder.items.map((item) => ({
        id: item.id,
        action: PROCESS_ORDER_ITEM_ACTION.PENDING,
        receiveQty: undefined,
        markComplete: false,
        receivedDate: new Date(),
        processingCost: item.processingCost ?? undefined,
        location: item.location,
      })),
    });
  }, [processOrder, form]);

  const onSubmit: SubmitHandler<ProcessOrderUpdatePayload> = async (data) => {
    try {
      await mutateAsync(data);
    } catch (error) {
      console.error("Failed to update process order:", error);
    }
  };
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ProcessOrderHeader order={processOrder} />
        <ProcessOrderItems
          items={processOrder.items}
          status={processOrder.status}
          isProcessOrderUpdatePending={isPending}
        />
      </form>
    </FormProvider>
  );
};

export default ProcessOrderDetailMain;

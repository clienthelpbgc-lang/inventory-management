import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { PurchaseRequestFormType } from "../types/purchase-request.type";

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: PurchaseRequestFormType) => {
      const { data } = await axios.post<{
        data: {
          id: string;
        };
      }>("/api/purchase-request", payload);

      return data.data;
    },

    onSuccess: async ({ id }) => {
      toast.success("Purchase Request created successfully!");

      router.push(`/purchase-request/${id}`);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchase-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["purchase-requests-products"], // same key used by useGetPRProduct
        }),
      ]);
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Failed to create purchase request."),
      );
    },
  });
}
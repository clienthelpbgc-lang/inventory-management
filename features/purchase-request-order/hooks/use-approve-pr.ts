import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import { PurchaseRequestApprovalItemFormType } from "../types/purchase-request.type";
import { useRouter } from "next/navigation";

type ApprovePurchaseRequestPayload = {
  purchaseRequestId: string;
  items: PurchaseRequestApprovalItemFormType[];
};

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      purchaseRequestId,
      items,
    }: ApprovePurchaseRequestPayload) => {
      const { data } = await axios.put(
        `/api/purchase-request/${purchaseRequestId}`,
        items,
      );

      return data;
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.purchaseRequestId],
        refetchType: "active",
      });

      await queryClient.invalidateQueries({
        queryKey: ["purchase-requests"],
      });

      // Approving/rejecting items changes which products can be requested.
      await queryClient.invalidateQueries({
        queryKey: ["purchase-requests-products"],
      });

      toast.success("Purchase Request approved successfully.");
    },

    onError: (error) => {
      console.error("Error approving purchase request:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
            "Failed to approve Purchase Request.",
        );
        return;
      }

      toast.error("Something went wrong.");
    },
  });
}

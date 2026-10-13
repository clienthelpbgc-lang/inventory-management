import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/purchase-request/${id}`);

      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: ["purchase-requests"],
      });

      // Rejected items free their products up for a new request.
      queryClient.invalidateQueries({
        queryKey: ["purchase-requests-products"],
      });
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ?? "Failed to reject purchase request.",
        );
      } else {
        toast.error("Something went wrong.");
      }
    },
  });
}

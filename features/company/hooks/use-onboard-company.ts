"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { OnboardCompanyType } from "../types/company.type";

// The API returns the created company row.
type OnboardCompanyResponse = {
  id: string;
  name: string;
};

export function useOnboardCompany() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    OnboardCompanyResponse,
    Error,
    OnboardCompanyType
  >({
    mutationFn: async (values) => {
      const response = await axios.post(
        "/api/company",
        values,
      );

      return response.data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["company"],
      });

      queryClient.invalidateQueries({
        queryKey: ["companies"],
      });
    },
  });

  return {
    onboardCompany: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
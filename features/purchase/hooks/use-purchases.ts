"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { GetPurchasesParams } from "../types/purchase.type";
import axios from "axios";
import { purchaseKeys } from "../query/purchase-keys";

// The API reads supplierIds as one comma-separated value; axios would
// otherwise send arrays as supplierIds[]=a&supplierIds[]=b.
function toQueryParams({ supplierIds, ...rest }: GetPurchasesParams) {
  return {
    ...rest,
    supplierIds: supplierIds?.length ? supplierIds.join(",") : undefined,
  };
}

export function usePurchases(params: GetPurchasesParams) {
  return useQuery({
    queryKey: purchaseKeys.list(params),

    queryFn: async () => {
      const response = await axios.get("/api/purchases", {
        params: toQueryParams(params),
      });

      return response.data.data;
    },
  });
}

export function useExportPurchases() {
  return useMutation({
    mutationFn: async (filters: GetPurchasesParams) => {
      const { data } = await axios.get("/api/purchases/export", {
        params: toQueryParams(filters),
      });

      return data.data;
    },
  });
}

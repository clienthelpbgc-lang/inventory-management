// lib/api-error.ts

import { AxiosError } from "axios";
import { ApiErrorResponse } from "./common-types";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  return (
    (error as AxiosError<ApiErrorResponse>).response?.data?.error?.message ??
    fallback
  );
}
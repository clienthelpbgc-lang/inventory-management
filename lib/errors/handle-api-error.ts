import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/errors/app-error";

export function handleApiError(error: unknown) {
  // Bad request bodies are the caller's fault, not a server error.
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues[0]?.message ?? "Validation failed",
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.statusCode,
      },
    );
  }

  console.error("Unhandled Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    {
      status: 500,
    },
  );
}
"use client";

import Link from "next/link";
import { AlertCircle, FileText, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import PurchaseRequestCard from "@/features/purchase-request-order/components/purchase-request/purchase-request-card";
import { useGetPR } from "@/features/purchase-request-order/hooks/use-get-PR";
import { useGetPRProduct } from "@/features/purchase-request-order/hooks/use-get-low-stock-products";
import { Badge } from "@/components/ui/badge";

function PurchaseRequestCardSkeleton() {
  return (
    <div className="flex h-[88px] items-center gap-5 rounded-xl border bg-white px-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="h-10 w-px bg-slate-100" />

      <div className="flex gap-8">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="ml-auto">
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

export default function PurchaseRequestPage() {
  const {
    data: purchaseRequests = [],
    isPending,
    isError,
    error,
    refetch,
  } = useGetPR();
  const { data: lowStockProducts = [], isLoading } = useGetPRProduct();
  const lowStockCount = lowStockProducts.length;

  return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase Requests
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Review purchase requests submitted by your organization, monitor
              their approval status, and track procurement progress.
            </p>
          </div>
          {isLoading || lowStockCount === 0 ? (
            <Button disabled>Create Purchase Request</Button>
          ) : (
            <Button asChild>
              <Link href="/purchase-request/create">
                Create Purchase Request
              </Link>
            </Button>
          )}
        </div>

        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <PurchaseRequestCardSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />

            <h2 className="text-lg font-semibold">
              Unable to load purchase requests
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading purchase requests."}
            </p>

            <Button className="mt-6" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {!isPending && !isError && purchaseRequests.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />

            <h2 className="text-lg font-semibold">
              No purchase requests found
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Purchase requests created by your organization will appear here
              once they are submitted.
            </p>
          </div>
        )}

        {!isPending && !isError && purchaseRequests.length > 0 && (
          <div className="space-y-4">
            {purchaseRequests.map((purchaseRequest) => (
              <PurchaseRequestCard
                key={purchaseRequest.id}
                request={purchaseRequest}
              />
            ))}
          </div>
        )}
      </div>
  );
}

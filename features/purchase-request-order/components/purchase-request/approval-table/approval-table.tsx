"use client";

import React from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Check, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  PurchaseRequestApprovalForm,
  ViewPurchaseRequestProduct,
} from "@/features/purchase-request-order/types/purchase-request.type";
import { approvalColumns } from "./approval-column";
import { PRPropDataType } from "../view-PR/ViewPRMain";

type PurchaseRequestApprovalTableProps = {
  data: ViewPurchaseRequestProduct[];
  isLoading: boolean;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
  prData: PRPropDataType;
  onReject: () => Promise<void> | void;
};

export function PurchaseRequestApprovalTable({
  data,
  isLoading,
  isApprovePending = false,
}: PurchaseRequestApprovalTableProps) {
  const { watch } = useFormContext<PurchaseRequestApprovalForm>();

  const purchaseRequestItems = watch("purchaseRequestItems");

  const table = useReactTable({
    data,
    columns: approvalColumns,
    getRowId: (row) => row.purchaseRequestItemId,
    getCoreRowModel: getCoreRowModel(),
  });

  const approvedCount = purchaseRequestItems.filter(
    (item) => item.decision === "APPROVE",
  ).length;

  const rejectedCount = purchaseRequestItems.filter(
    (item) => item.decision === "REJECT",
  ).length;

  const actionRequiredCount = purchaseRequestItems.filter(
    (item) => item.decision === "ACTION_REQUIRED",
  ).length;

  return (
    <Card className="overflow-hidden gap-0 py-0">
      <CardContent className="p-0">
        {/* One scroll container for both axes so the horizontal scrollbar
            stays reachable and the sticky header keeps working. */}
        <Table
          containerClassName="max-h-[50vh] overflow-auto overscroll-x-contain"
          className="min-w-[1100px]"
        >
            <TableHeader className="sticky top-0 z-20 bg-background">
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="bg-background py-4 font-semibold whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={approvalColumns.length}
                    className="h-[550px]"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />

                      <div className="space-y-1 text-center">
                        <p className="font-medium">
                          Loading purchase request...
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Please wait while we fetch the items.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={approvalColumns.length}
                    className="h-[550px]"
                  >
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <p className="font-medium">No items found</p>

                      <p className="text-sm text-muted-foreground">
                        This purchase request doesn't contain any items.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/20 px-6 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="font-medium text-green-700">
                {approvedCount}
              </span>{" "}
              <span className="text-muted-foreground">Approve</span>
            </div>

            <div>
              <span className="font-medium text-red-600">
                {rejectedCount}
              </span>{" "}
              <span className="text-muted-foreground">Reject</span>
            </div>

            <div>
              <span className="font-medium text-amber-600">
                {actionRequiredCount}
              </span>{" "}
              <span className="text-muted-foreground">Needs Supplier</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isApprovePending}
            className="min-w-40"
          >
            <Check className="mr-2 h-4 w-4" />
            Submit Decision
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
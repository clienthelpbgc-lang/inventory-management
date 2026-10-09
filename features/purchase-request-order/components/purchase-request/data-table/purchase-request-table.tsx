"use client";

import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { columns } from "./purchase-request-columns";
import {
  PurchaseRequestFormType,
  PurchaseRequestProduct,
} from "@/features/purchase-request-order/types/purchase-request.type";

type PurchaseRequestTableProps = {
  data: PurchaseRequestProduct[];
  isLoading: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: React.Dispatch<
    React.SetStateAction<RowSelectionState>
  >;
  isPRCreatePending: boolean;
};

function hasValidationIssue(
  item?: PurchaseRequestFormType["items"][number],
) {
  return (
    !item?.supplierId ||
    !item.supplierName ||
    !item.requestedQty ||
    item.requestedQty <= 0
  );
}

type TableMessageProps = {
  title: string;
  description: string;
  loading?: boolean;
};

function TableMessage({
  title,
  description,
  loading = false,
}: TableMessageProps) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-[550px]">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          {loading && (
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          )}

          <div className="space-y-1 text-center">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PurchaseRequestTable({
  data,
  isLoading,
  rowSelection,
  onRowSelectionChange,
  isPRCreatePending,
}: PurchaseRequestTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.productId,
    enableRowSelection: true,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
  });

  const { control } = useFormContext<PurchaseRequestFormType>();

  const items = useWatch({
    control,
    name: "items",
  });

  const rows = table.getRowModel().rows;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="p-0">
        {/* One scroll container for both axes so the horizontal scrollbar
            stays reachable and the sticky header keeps working. */}
        <Table
          containerClassName="max-h-[50vh] overflow-auto overscroll-x-contain"
          className="min-w-[900px]"
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
                <TableMessage
                  loading
                  title="Loading products..."
                  description="Please wait while we fetch the inventory."
                />
              ) : rows.length === 0 ? (
                <TableMessage
                  title="No products found"
                  description="There are no products available to create a purchase request."
                />
              ) : (
                rows.map((row, index) => {
                  const hasIssue = hasValidationIssue(items?.[index]);

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "transition-colors data-[state=selected]:bg-inherit!",
                        hasIssue
                          ? "bg-amber-50/60 hover:bg-amber-50/60"
                          : "hover:bg-muted/40",
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-4 align-middle",
                            hasIssue &&
                              cellIndex === 0 &&
                              "border-l-4 border-amber-500",
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
        </Table>

        <div>
          <div className="border-t bg-muted/20 px-6 py-4">
            <RHFTextarea<PurchaseRequestFormType>
              name="remarks"
              label="Remarks"
              placeholder="Add any notes or special instructions for this purchase request..."
              helperText="Optional. This remark will be included with the purchase request."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
            <p className="text-sm text-muted-foreground">
              {selectedCount} product{selectedCount !== 1 && "s"} selected
            </p>

            <Button
              type="submit"
              disabled={
                isLoading ||
                selectedCount === 0 ||
                isPRCreatePending
              }
            >
              {isPRCreatePending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Purchase Request
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
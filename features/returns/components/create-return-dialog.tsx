"use client";

import { useMemo, useState } from "react";
import { roundQty } from "@/lib/quantity";
import { AlertCircle, Loader2, PackageX, Undo2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSale } from "@/features/sales/hooks/use-sale";

import { useCreateSaleReturn } from "../hooks/use-create-return";
import { OutgoingPicker } from "./outgoing-picker";

type ReturnableSaleItem = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  returnedQty: number;
  pendingReturnQty: number;
  returnableQty: number;
};

type CreateReturnDialogProps = {
  // Omit to let the user pick the outgoing inside the dialog.
  saleId?: string;
  saleNumber?: string;
  children?: React.ReactNode;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateReturnDialog({
  saleId,
  saleNumber,
  children,
}: CreateReturnDialogProps) {
  const [open, setOpen] = useState(false);
  const [pickedSale, setPickedSale] = useState<{
    id: string;
    saleNumber: string;
  } | null>(null);

  const selectedSale =
    saleId && saleNumber ? { id: saleId, saleNumber } : pickedSale;

  const {
    data: sale,
    isLoading,
    isError,
    error,
  } = useSale(open ? selectedSale?.id : undefined);

  const { mutateAsync, isPending } = useCreateSaleReturn();

  const [returnDate, setReturnDate] = useState(today);
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setPickedSale(null);
      setReturnDate(today());
      setReason("");
      setQuantities({});
    }
  }

  const returnableItems: ReturnableSaleItem[] = useMemo(
    () =>
      (sale?.items ?? []).filter(
        (item: ReturnableSaleItem) => item.returnableQty > 0,
      ),
    [sale?.items],
  );

  const selectedItems = useMemo(
    () =>
      returnableItems
        .map((item) => ({
          item,
          quantity: Number(quantities[item.id]) || 0,
        }))
        .filter(({ quantity }) => quantity > 0),
    [returnableItems, quantities],
  );

  const totalReturnQty = roundQty(
    selectedItems.reduce((sum, { quantity }) => sum + quantity, 0),
  );

  function handleQuantityChange(
    itemId: string,
    maxQty: number,
    rawValue: string,
  ) {
    // Keep the raw text so partial decimals like "1." stay editable.
    const cleaned = rawValue.replace(/[^0-9.]/g, "");
    const value = Number(cleaned) > maxQty ? String(maxQty) : cleaned;

    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  async function handleSubmit() {
    if (!selectedSale) return;

    if (!returnDate) {
      toast.error("Return date is required");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Enter a quantity for at least one item");
      return;
    }

    try {
      await mutateAsync({
        saleId: selectedSale.id,
        returnDate,
        reason: reason.trim() || undefined,
        items: selectedItems.map(({ item, quantity }) => ({
          saleItemId: item.id,
          productId: item.productId,
          quantity,
        })),
      });

      toast.success("Return request created successfully");
      handleOpenChange(false);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error?.message ?? err.response?.data?.message)
        : undefined;

      toast.error(message ?? "Failed to create return request");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="sm">
            <Undo2 className="mr-2 h-4 w-4" />
            Return
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="flex flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-2xl"
        style={{
          width: "min(72vw, 860px)",
          maxWidth: "min(72vw, 860px)",
          height: "75vh",
          maxHeight: "75vh",
        }}
      >
        <DialogHeader className="shrink-0 border-b bg-background p-5">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Undo2 className="h-4 w-4 text-muted-foreground" />
            {selectedSale
              ? `Create Return — ${selectedSale.saleNumber}`
              : "Create Return — Select Outgoing"}
          </DialogTitle>
        </DialogHeader>

        {!selectedSale ? (
          <OutgoingPicker onSelect={setPickedSale} />
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">Failed to load sale</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        ) : !sale ? null : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="return-date">
                      Return Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-reason">Reason</Label>
                  <Textarea
                    id="return-reason"
                    placeholder="Why are these items being returned?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <Separator />

                {returnableItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
                    <PackageX className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Nothing left to return
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Every item on this outgoing has already been returned.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">Product</TableHead>
                          <TableHead className="text-xs">Sold</TableHead>
                          <TableHead className="text-xs">Returned</TableHead>
                          <TableHead className="text-xs">
                            Pending Review
                          </TableHead>
                          <TableHead className="text-xs">
                            Returnable
                          </TableHead>
                          <TableHead className="w-32 text-xs">
                            Return Qty
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {returnableItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="py-3">
                              <p className="text-sm font-medium">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.unit}
                              </p>
                            </TableCell>

                            <TableCell className="py-3 text-sm">
                              {item.quantity}
                            </TableCell>

                            <TableCell className="py-3 text-sm">
                              {item.returnedQty}
                            </TableCell>

                            <TableCell className="py-3 text-sm text-muted-foreground">
                              {item.pendingReturnQty > 0
                                ? `${item.pendingReturnQty} pending`
                                : "—"}
                            </TableCell>

                            <TableCell className="py-3 text-sm">
                              <Badge variant="secondary">
                                {item.returnableQty}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-3">
                              <Input
                                type="number"
                                min={0}
                                step="any"
                                max={item.returnableQty}
                                placeholder="0"
                                value={quantities[item.id] ?? ""}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.id,
                                    item.returnableQty,
                                    e.target.value,
                                  )
                                }
                                className="h-9"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Return Quantity
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    {totalReturnQty}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {pickedSale && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPickedSale(null);
                        setQuantities({});
                      }}
                      disabled={isPending}
                    >
                      Change Outgoing
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || selectedItems.length === 0}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Create Return Request"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

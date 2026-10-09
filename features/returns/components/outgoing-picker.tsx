"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format-date";

import { useDebouncedValue } from "@/features/product/hooks/use-debounced-value";
import { useSales } from "@/features/sales/hooks/use-sales";
import type { SaleRow } from "@/features/sales/components/data-table/sale-columns";
import {
  SALE_RETURN_FLAG,
  SALE_RETURN_FLAG_CONFIG,
} from "@/features/sales/constants/sale-return-flag";

type OutgoingPickerProps = {
  onSelect: (sale: { id: string; saleNumber: string }) => void;
};

/** Search outgoings by number or customer to start a return from. */
export function OutgoingPicker({ onSelect }: OutgoingPickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data, isLoading, isError } = useSales({
    page: 1,
    search: debouncedSearch || undefined,
    sortOrder: "desc",
  });

  const sales: SaleRow[] = data?.data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search outgoing by number or customer..."
          className="pl-9"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border">
        {isLoading ? (
          <div className="flex h-full items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-destructive">
            Failed to load outgoings. Try searching again.
          </p>
        ) : sales.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No outgoings found.
          </p>
        ) : (
          sales.map((sale) => {
            const fullyReturned =
              sale.returnFlag === SALE_RETURN_FLAG.FULLY_RETURNED;

            return (
              <button
                key={sale.id}
                type="button"
                disabled={fullyReturned}
                onClick={() =>
                  onSelect({ id: sale.id, saleNumber: sale.saleNumber })
                }
                className="flex w-full items-center justify-between gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{sale.saleNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[sale.soldTo, formatDate(sale.saleDate)]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>

                {sale.returnFlag && (
                  <Badge
                    variant="outline"
                    className={SALE_RETURN_FLAG_CONFIG[sale.returnFlag].className}
                  >
                    {SALE_RETURN_FLAG_CONFIG[sale.returnFlag].label}
                  </Badge>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

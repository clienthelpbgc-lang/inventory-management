"use client";

import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SALE_RETURN_STATUS_CONFIG } from "../../constants/sale-return-status";
import { SaleReturnStatus } from "../../constants/sale-return-status";
import { useExportSaleReturnsPdf } from "../../hooks/use-export-return";

type ReturnTableToolsProps = {
  search: string;
  onSearchChange: (value: string) => void;

  status?: SaleReturnStatus;
  onStatusChange: (value?: SaleReturnStatus) => void;

  startDate?: string;
  endDate?: string;

  onStartDateChange: (value?: string) => void;
  onEndDateChange: (value?: string) => void;
};

export function ReturnTableTools({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ReturnTableToolsProps) {
  const hasFilters =
    !!search.trim() || !!status || !!startDate || !!endDate;
  const { mutate: exportPdf, isPending } = useExportSaleReturnsPdf();

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search return number..."
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            exportPdf({
              search,
              status,
              startDate,
              endDate,
            })
          }
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            "Export PDF"
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-white p-4">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Status</h4>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={!status}
                    onChange={() => onStatusChange(undefined)}
                  />
                  All
                </label>

                {Object.entries(SALE_RETURN_STATUS_CONFIG).map(
                  ([value, config]) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        checked={status === value}
                        onChange={() =>
                          onStatusChange(value as SaleReturnStatus)
                        }
                      />
                      {config.label}
                    </label>
                  ),
                )}
              </div>
            </div>

            <div className="my-4 border-t" />

            <div>
              <h4 className="mb-3 text-sm font-semibold">Date Range</h4>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Start Date
                  </label>

                  <Input
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) =>
                      onStartDateChange(e.target.value || undefined)
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    End Date
                  </label>

                  <Input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) =>
                      onEndDateChange(e.target.value || undefined)
                    }
                  />
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          disabled={!hasFilters}
          onClick={() => {
            onSearchChange("");
            onStatusChange(undefined);
            onStartDateChange(undefined);
            onEndDateChange(undefined);
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

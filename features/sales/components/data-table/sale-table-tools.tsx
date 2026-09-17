"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SaleExportButton } from "../sale-pdf-button";
import { GetSalesParams } from "../../types/sales.type";

type SaleTableToolsProps = {
  search: string;
  onSearchChange: (value: string) => void;

  startDate?: string;
  endDate?: string;

  onStartDateChange: (value?: string) => void;
  onEndDateChange: (value?: string) => void;

  sortOrder?: "asc" | "desc";
  onSortOrderChange: (value?: "asc" | "desc") => void;

  exportFilters: GetSalesParams;
};

export function SaleTableTools({
  search,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sortOrder,
  onSortOrderChange,
  exportFilters,
}: SaleTableToolsProps) {
  const hasFilters = !!startDate || !!endDate || !!sortOrder;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sale number or customer name..."
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <SaleExportButton filters={exportFilters} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-white p-4">
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

            <div className="my-4 border-t" />

            <div>
              <h4 className="mb-3 text-sm font-semibold">Sort Order</h4>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={sortOrder === "asc"}
                    onChange={() => onSortOrderChange("asc")}
                  />
                  Ascending
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={sortOrder === "desc"}
                    onChange={() => onSortOrderChange("desc")}
                  />
                  Descending
                </label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          disabled={!hasFilters}
          onClick={() => {
            onStartDateChange(undefined);
            onEndDateChange(undefined);
            onSortOrderChange(undefined);
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

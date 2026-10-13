"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PurchaseExportButton } from "../purchase-pdf-button";
import { GetPurchasesParams } from "../../types/purchase.type";

type PurchaseTableToolsProps = {
  search: string;
  onSearchChange: (value: string) => void;

  suppliers: {
    id: string;
    companyName: string;
  }[];

  selectedSupplierIds: string[];
  onSupplierChange: (values: string[]) => void;

  startDate?: string;
  endDate?: string;

  onStartDateChange: (value?: string) => void;
  onEndDateChange: (value?: string) => void;

  sortBy?: "supplier" | "grandTotal";
  sortOrder?: "asc" | "desc";

  onSortByChange: (
    value?: "supplier" | "grandTotal",
  ) => void;

  onSortOrderChange: (
    value?: "asc" | "desc",
  ) => void;

  exportFilters: GetPurchasesParams;
};

export function PurchaseTableTools({
  search,
  onSearchChange,
  suppliers,
  selectedSupplierIds,
  onSupplierChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  exportFilters,
}: PurchaseTableToolsProps) {
  const hasFilters =
    !!search.trim() ||
    selectedSupplierIds.length > 0 ||
    !!startDate ||
    !!endDate ||
    !!sortBy ||
    !!sortOrder;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

        <Input
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search purchase # or supplier..."
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-3">
        <PurchaseExportButton filters={exportFilters} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[420px] space-y-6 p-4"
          >
            <SupplierFilterSection
              suppliers={suppliers}
              selected={selectedSupplierIds}
              onChange={onSupplierChange}
            />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Date Range
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={startDate ?? ""}
                  onChange={(e) =>
                    onStartDateChange(
                      e.target.value || undefined,
                    )
                  }
                />

                <Input
                  type="date"
                  value={endDate ?? ""}
                  onChange={(e) =>
                    onEndDateChange(
                      e.target.value || undefined,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Sort By
              </h4>

              <select
                value={sortBy ?? ""}
                onChange={(e) =>
                  onSortByChange(
                    (e.target.value ||
                      undefined) as
                      | "supplier"
                      | "grandTotal"
                      | undefined,
                  )
                }
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="">None</option>
                <option value="supplier">
                  Supplier
                </option>
                <option value="grandTotal">
                  Grand Total
                </option>
              </select>

              <select
                value={sortOrder ?? ""}
                onChange={(e) =>
                  onSortOrderChange(
                    (e.target.value ||
                      undefined) as
                      | "asc"
                      | "desc"
                      | undefined,
                  )
                }
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="">None</option>
                <option value="asc">
                  Ascending
                </option>
                <option value="desc">
                  Descending
                </option>
              </select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          disabled={!hasFilters}
          onClick={() => {
            onSearchChange("");
            onSupplierChange([]);
            onStartDateChange(undefined);
            onEndDateChange(undefined);
            onSortByChange(undefined);
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

type SupplierFilterSectionProps = {
  suppliers: {
    id: string;
    companyName: string;
  }[];
  selected: string[];
  onChange: (values: string[]) => void;
};

function SupplierFilterSection({
  suppliers,
  selected,
  onChange,
}: SupplierFilterSectionProps) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">
        Suppliers
      </h4>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="flex items-center gap-2"
          >
            <Checkbox
              id={`supplier-filter-${supplier.id}`}
              checked={selected.includes(
                supplier.id,
              )}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([
                    ...selected,
                    supplier.id,
                  ]);
                } else {
                  onChange(
                    selected.filter(
                      (id) => id !== supplier.id,
                    ),
                  );
                }
              }}
            />

            <label
              htmlFor={`supplier-filter-${supplier.id}`}
              className="cursor-pointer text-sm"
            >
              {supplier.companyName}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
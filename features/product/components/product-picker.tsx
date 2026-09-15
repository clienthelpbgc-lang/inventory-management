"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Package, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useProducts } from "../hooks/use-products";
import { Product } from "../types/product.types";

type ProductPickerProps = {
  value?: string;
  selectedProductIds?: string[];
  onChange: (product: Product) => void;
  onClear?: () => void;
  label?: string;
  error?: string;
  required?: boolean;
};

function ProductPickerImpl({
  value,
  selectedProductIds = [],
  onChange,
  onClear,
  label = "Product",
  error,
  required = false,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined,
  );

  const needsResolve = Boolean(value) && selectedProduct?.id !== value;

  const { data, isLoading, isFetching, isError } = useProducts({
    search: debouncedSearch,
    enabled: Boolean(debouncedSearch) || needsResolve,
  });

  if (!value && selectedProduct) {
    setSelectedProduct(undefined);
  } else if (needsResolve) {
    const resolved = data?.data?.find((product) => product.id === value);

    if (resolved) {
      setSelectedProduct(resolved);
    }
  }

  const products = useMemo(() => {
    return (data?.data ?? []).filter((product: Product) => {
      if (product.id === value) {
        return true;
      }

      return !selectedProductIds.includes(product.id);
    });
  }, [data?.data, selectedProductIds, value]);

  const handleSelect = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      onChange(product);
      setSearch("");
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    setSelectedProduct(undefined);
    setSearch("");
    onClear?.();
  }, [onClear]);

  if (selectedProduct) {
    return (
      <div className="rounded-xl border bg-card px-4 py-2 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 gap-1">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{selectedProduct.name}</p>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  Stock: {selectedProduct.currentStock}
                </span>

                <span className="text-sm text-muted-foreground">
                  Unit: {selectedProduct.unit}
                </span>
                {selectedProduct.unitCost && (
                  <span className="text-sm text-muted-foreground">
                    Unit Cost: ₹{selectedProduct?.unitCost}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleClear}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product by name..."
          className="pl-9"
        />
      </div>

      {debouncedSearch && (
        <div className="overflow-hidden rounded-xl border bg-card">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Searching products...
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-destructive">
              Failed to load products. Try searching again.
            </div>
          ) : products.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No products found
            </div>
          ) : (
            <div
              role="listbox"
              aria-busy={isFetching}
              className="max-h-72 overflow-y-auto"
            >
              {products.map((product: Product) => (
                <button
                  key={product.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    // Commit the selection on press, not on click, so a
                    // re-render between press and release (e.g. from a
                    // background refetch) can't cause the release to land
                    // on a moved/removed item and drop the selection.
                    e.preventDefault();
                    handleSelect(product);
                  }}
                  className="flex w-full items-start gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="truncate text-xs">{product.description}</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Stock: {product.currentStock}
                      </span>

                      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        Unit: {product.unit}
                      </span>

                      {product.unitCost && (
                        <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                          Unit Cost: ₹{product?.unitCost}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export const ProductPicker = memo(ProductPickerImpl);

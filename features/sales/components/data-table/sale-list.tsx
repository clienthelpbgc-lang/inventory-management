"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { useSales } from "../../hooks/use-sales";

import { SalePagination } from "./sale-pagination";
import { SaleTable } from "./sale-table";
import { SaleTableTools } from "./sale-table-tools";

export function SaleList() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const [sortOrder, setSortOrder] = useState<
    "asc" | "desc" | undefined
  >();

  const [debouncedSearch] = useDebounce(search, 500);



  const { data, isLoading } = useSales({
    page,
    search: debouncedSearch,
    startDate,
    endDate,
    sortOrder,
  });

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    startDate,
    endDate,
    sortOrder,
  ]);

  return (
    <div className="space-y-4">
      <SaleTableTools
        exportFilters={{
          search: debouncedSearch,
          startDate,
          endDate,
          sortOrder,
        }}
        search={search}
        onSearchChange={setSearch}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <SaleTable
        data={data?.data ?? []}
        isLoading={isLoading}
      />

      <SalePagination
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
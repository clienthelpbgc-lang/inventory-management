"use client";

import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createPDF } from "@/lib/create-pdf";

import { useExportSales } from "../hooks/use-sales";
import { GetSalesParams } from "../types/sales.type";

type SaleExportButtonProps = {
  filters: GetSalesParams;
};

export function SaleExportButton({ filters }: SaleExportButtonProps) {
  const exportSales = useExportSales();

  const handleExport = async () => {
    try {
      const sales = await exportSales.mutateAsync(filters);

      const rows = sales.map(
        (
          sale: {
            saleNumber: string;
            saleDate: string;
            soldTo: string | null;
            itemsCount: number;
            grandTotal: string | number;
          },
          index: number,
        ) => [
          index + 1,
          sale.saleNumber,
          format(new Date(sale.saleDate), "dd MMM yyyy"),
          sale.soldTo ?? "-",
          sale.itemsCount,
          Number(sale.grandTotal).toFixed(2),
        ],
      );

      createPDF({
        title: "Outgoing Report",
        fileName: `outgoing-${format(new Date(), "yyyy-MM-dd")}.pdf`,
        headers: [
          "Sr",
          "Sale #",
          "Sale Date",
          "Customer",
          "Items",
          "Grand Total",
        ],
        rows,
      });
    } catch (error) {
      console.error("Failed to export sales:", error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={exportSales.isPending}
      className="gap-2"
    >
      {exportSales.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

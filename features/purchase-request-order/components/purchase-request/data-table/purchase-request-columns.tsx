import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { RequestQtyCell } from "./request-qty-cell";
import { SupplierCell } from "./supplier-cell";
import { CategoryBadge } from "@/lib/category-badge";
import {
  PurchaseRequestFormType,
  PurchaseRequestProduct,
} from "@/features/purchase-request-order/types/purchase-request.type";

export const columns: ColumnDef<PurchaseRequestProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  {
    accessorKey: "productName",
    header: "Product",
    size: 245,
    minSize: 245,
    maxSize: 245,
    cell: ({ row }) => (
      <div className="w-[245px] space-y-1">
        <p
          className="break-words whitespace-normal font-semibold leading-tight"
          title={row.original.productName}
        >
          {row.original.productName}
        </p>

        {row.original.description && (
          <p className="break-words whitespace-normal text-muted-foreground text-xs leading-relaxed">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },

  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <CategoryBadge category={row.original.category} />,
  },

  {
    accessorKey: "currentStock",
    header: "Current Stock",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.currentStock} {row.original.unit}
        </p>

        <p className="text-muted-foreground text-xs">
          Min: {row.original.minOrderQty}
          {" • "}
          Max: {row.original.maxOrderQty ?? "-"}
        </p>

        {!!row.original.onOrderQty && (
          <p className="text-xs font-medium text-blue-600">
            On order: {row.original.onOrderQty} {row.original.unit}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "requestedQty",
    header: "Request Qty",
    cell: ({ row }) => <RequestQtyCell index={row.index} />,
  },
  {
    accessorKey: "supplierId",
    header: "Supplier",
    cell: ({ row }) => (
      <SupplierCell<PurchaseRequestFormType> baseName={`items.${row.index}`} />
    ),
  },
];

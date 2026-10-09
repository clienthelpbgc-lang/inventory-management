import PRTableMain from "./pr-table.main";
import { PRPropDataType } from "./ViewPRMain";
import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";

export default function PurchaseRequestApprovalSection({
  products,
  prData,
}: {
  products: ViewPurchaseRequestType["products"];
  prData: PRPropDataType;
}) {
  // Nothing left to decide: hide the section instead of an empty table with
  // an active Submit Decision button.
  if (products.length === 0) return null;

  return <PRTableMain products={products} prData={prData} />;
}

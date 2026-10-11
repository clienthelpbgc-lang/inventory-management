import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";

import { CreateSupplierFormType } from "../../types/suppliers.type";

export function CreateSupplierForm() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Supplier Information</h3>

          <p className="text-sm text-muted-foreground">
            Basic company, compliance, and supplier profile information.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RHFInput<CreateSupplierFormType>
            name="companyName"
            label="Company Name"
            placeholder="Enter company name"
            helperText="Legal or trading name of the supplier."
            required
          />

          <RHFInput<CreateSupplierFormType>
            name="gst"
            label="GST Number"
            placeholder="Enter GST Number"
            helperText="Tax registration number, if applicable."
          />
        </div>

        <RHFTextarea<CreateSupplierFormType>
          name="address"
          label="Business Address"
          placeholder="Enter Address"
        />

        <RHFTextarea<CreateSupplierFormType>
          name="description"
          label="Description"
          placeholder="Add a description"
          helperText="Additional notes, brand, bank details etc."
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Contact Information</h3>

          <p className="text-sm text-muted-foreground">
            Primary contact for purchase orders and supplier communication.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RHFInput<CreateSupplierFormType>
            name="contactPersonName"
            label="Contact Person"
            placeholder="Enter Primary Contact Name"
          />

          <RHFInput<CreateSupplierFormType>
            name="phone"
            label="Phone Number"
            placeholder="Enter phone number"
          />
        </div>

        <RHFInput<CreateSupplierFormType>
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter email address"
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            Procurement Preferences
          </h3>

          <p className="text-sm text-muted-foreground">
            Operational information used during purchasing and planning.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RHFInput<CreateSupplierFormType>
            name="estimatedDeliveryPeriod"
            label="Estimated Delivery Period (Days)"
            type="number"
            step={1}
            helperText="Average number of days required to deliver an order."
          />

          <RHFInput<CreateSupplierFormType>
            name="paymentTerm"
            label="Payment Terms"
            helperText="Examples: Net 30, COD, 50% Advance, Monthly Settlement."
          />
        </div>
      </section>
    </div>
  );
}
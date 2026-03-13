import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier, SupplierInput } from "@/modules/suppliers";

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierInput) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const SupplierForm = ({ supplier, onSubmit, onCancel, isPending }: SupplierFormProps) => {
  const [formData, setFormData] = useState<SupplierInput>({
    name: supplier?.name || "",
    contact_person: supplier?.contact_person || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    city: supplier?.city || "",
    state: supplier?.state || "",
    country: supplier?.country || "Nigeria",
    payment_terms: supplier?.payment_terms || "",
    tax_id: supplier?.tax_id || "",
    notes: supplier?.notes || "",
    is_active: supplier?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Supplier Name *</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input id="contact_person" value={formData.contact_person || ""} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input id="tax_id" value={formData.tax_id || ""} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" value={formData.state || ""} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input id="payment_terms" placeholder="e.g., Net 30, COD" value={formData.payment_terms || ""} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes || ""} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
};

// Suppliers module types

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  payment_terms: string | null;
  tax_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SupplierInput = Omit<Supplier, "id" | "created_at" | "updated_at">;

export interface SupplierWithStats extends Supplier {
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string | null;
}

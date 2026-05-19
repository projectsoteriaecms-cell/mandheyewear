// Backwards compatibility re-export
// This file re-exports from the new modular location
export {
  useSuppliers,
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/modules/suppliers/hooks/useSuppliers";

export type { Supplier, SupplierInput } from "@/modules/suppliers/types";

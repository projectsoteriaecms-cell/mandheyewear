// Backwards compatibility re-export
// This file re-exports from the new modular location
export {
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  useReceivePurchaseOrder,
} from "@/modules/inventory/hooks/usePurchaseOrders";

export type {
  PurchaseOrder,
  PurchaseOrderItem,
  CreatePurchaseOrderInput,
} from "@/modules/inventory/types";

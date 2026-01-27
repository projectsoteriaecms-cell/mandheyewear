// Backwards compatibility re-export
// This file re-exports from the new modular location
export {
  useInventoryOverview,
  useLowStockAlerts,
  useInventoryStats,
} from "@/modules/inventory/hooks/useInventoryOverview";

export type { InventoryItem, InventoryStats } from "@/modules/inventory/types";

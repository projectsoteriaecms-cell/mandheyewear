// Backwards compatibility re-export
// This file re-exports from the new modular location
export {
  useStockTransfers,
  useStockTransfer,
  useCreateStockTransfer,
  useUpdateTransferStatus,
} from "@/modules/inventory/hooks/useStockTransfers";

export type {
  StockTransfer,
  StockTransferItem,
  CreateStockTransferInput,
} from "@/modules/inventory/types";

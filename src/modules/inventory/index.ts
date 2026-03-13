// Inventory module public API

// Hooks
export {
  useInventoryOverview,
  useLowStockAlerts,
  useInventoryStats,
  useStockTransfers,
  useStockTransfer,
  useCreateStockTransfer,
  useUpdateTransferStatus,
  useStockAdjustments,
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  useReceivePurchaseOrder,
  useInventoryTransactions,
  useBulkStockUpdate,
  parseStockExcel,
} from "./hooks";

// Types from hooks
export type {
  StockUpdateRow,
  ParsedStockData,
  StockUpdateProgress,
  StockUpdateResult,
  BulkStockUpdateProgress,
} from "./hooks";

// Types from types module
export type {
  InventoryItem,
  InventoryStats,
  StockTransfer,
  StockTransferItem,
  CreateStockTransferInput,
  StockAdjustment,
  CreateAdjustmentData,
  PurchaseOrder,
  PurchaseOrderItem,
  CreatePurchaseOrderInput,
  InventoryTransaction,
  TransferStatus,
  AdjustmentType,
  TransactionType,
  PurchaseOrderStatus,
} from "./types";

// Components
export {
  BulkStockImportDialog,
  CreateAdjustmentDialog,
  CreateStockTransferDialog,
  CreatePurchaseOrderDialog,
} from "./components";

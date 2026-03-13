// Main shared module barrel export
export * from "./layouts/admin";

// Re-export hooks explicitly to avoid AppRole collision
export { 
  useAuth,
  useUserRole,
  useIsStaff,
  useIsManager,
  useIsSuperAdmin,
  type AppRole,
} from "./hooks";

export * from "./lib";

// Re-export specific types to avoid ambiguity (excluding AppRole since it's from hooks)
export type { 
  Database, 
  TablesInsert, 
  TablesUpdate, 
  Enums,
  BranchType,
  BrandLine,
  ItemType,
  OrderStatus,
  PaymentStatus,
  PriceTier,
  PurchaseOrderStatus,
  TransactionType,
  TransferStatus,
  AdjustmentType,
  AppointmentStatus,
  Branch,
  Product,
  Category,
  Supplier,
  Service,
  Inventory,
  PurchaseOrder,
  StockTransfer,
  StockAdjustment,
  InventoryTransaction,
  Profile,
  Order,
  OrderItem,
  FrameAttributes,
  LensAttributes,
  ImportHistory,
  UserInvitation,
} from "./types";
export { Constants } from "./types";

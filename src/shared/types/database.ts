// Re-export common database types for convenience
import type { Database, Tables as TablesType, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";

export type { Database, TablesInsert, TablesUpdate, Enums };
export { Constants };

// Common type aliases used across modules
export type AppRole = Database["public"]["Enums"]["app_role"];
export type BranchType = Database["public"]["Enums"]["branch_type"];
export type BrandLine = Database["public"]["Enums"]["brand_line"];
export type ItemType = Database["public"]["Enums"]["item_type"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type PriceTier = Database["public"]["Enums"]["price_tier"];
export type PurchaseOrderStatus = Database["public"]["Enums"]["purchase_order_status"];
export type TransactionType = Database["public"]["Enums"]["transaction_type"];
export type TransferStatus = Database["public"]["Enums"]["transfer_status"];
export type AdjustmentType = Database["public"]["Enums"]["adjustment_type"];
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

// Table row types
export type Branch = TablesType<"branches">;
export type Product = TablesType<"products">;
export type Category = TablesType<"categories">;
export type Supplier = TablesType<"suppliers">;
export type Service = TablesType<"services">;
export type Inventory = TablesType<"inventory">;
export type PurchaseOrder = TablesType<"purchase_orders">;
export type StockTransfer = TablesType<"stock_transfers">;
export type StockAdjustment = TablesType<"stock_adjustments">;
export type InventoryTransaction = TablesType<"inventory_transactions">;
export type Profile = TablesType<"profiles">;
export type Order = TablesType<"orders">;
export type OrderItem = TablesType<"order_items">;
export type FrameAttributes = TablesType<"frame_attributes">;
export type LensAttributes = TablesType<"lens_attributes">;
export type ImportHistory = TablesType<"import_history">;
export type UserInvitation = TablesType<"user_invitations">;

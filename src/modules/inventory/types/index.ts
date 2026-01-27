// Inventory module types
import type { Database } from "@/integrations/supabase/types";

// Re-export enums for convenience
export type TransferStatus = Database["public"]["Enums"]["transfer_status"];
export type AdjustmentType = Database["public"]["Enums"]["adjustment_type"];
export type TransactionType = Database["public"]["Enums"]["transaction_type"];
export type PurchaseOrderStatus = Database["public"]["Enums"]["purchase_order_status"];

// Inventory Overview Types
export interface InventoryItem {
  id: string;
  product_id: string;
  branch_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  last_stock_count_date: string | null;
  last_received_date: string | null;
  bin_location: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    cost_price: number | null;
    item_type: string | null;
    reorder_level: number | null;
    image_url: string | null;
  };
  branch: {
    id: string;
    name: string;
    city: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  productCount: number;
  supplierCount: number;
}

// Stock Transfer Types
export interface StockTransferItem {
  id: string;
  stock_transfer_id: string;
  product_id: string;
  quantity_requested: number;
  quantity_sent: number;
  quantity_received: number;
  notes: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_branch_id: string;
  to_branch_id: string;
  status: TransferStatus;
  initiated_by: string;
  received_by: string | null;
  notes: string | null;
  created_at: string;
  shipped_at: string | null;
  completed_at: string | null;
  from_branch?: {
    id: string;
    name: string;
    city: string;
  };
  to_branch?: {
    id: string;
    name: string;
    city: string;
  };
  items?: StockTransferItem[];
}

export interface CreateStockTransferInput {
  from_branch_id: string;
  to_branch_id: string;
  notes?: string;
  items: {
    product_id: string;
    quantity_requested: number;
  }[];
}

// Stock Adjustment Types
export interface CreateAdjustmentData {
  branch_id: string;
  product_id: string;
  adjustment_type: AdjustmentType;
  quantity_change: number;
  reason: string;
}

export interface StockAdjustment {
  id: string;
  branch_id: string;
  product_id: string;
  adjustment_type: AdjustmentType;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number | null;
  reason: string;
  performed_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

// Purchase Order Types
export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  notes: string | null;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  branch_id: string;
  order_date: string;
  expected_delivery_date: string | null;
  received_date: string | null;
  status: PurchaseOrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
    city: string;
  };
  items?: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderInput {
  supplier_id: string;
  branch_id: string;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity_ordered: number;
    unit_cost: number;
  }[];
}

// Inventory Transaction Types
export interface InventoryTransaction {
  id: string;
  branch_id: string;
  product_id: string;
  transaction_type: TransactionType;
  quantity_before: number;
  quantity_after: number;
  quantity_change: number;
  reference_type: string | null;
  reference_id: string | null;
  performed_by: string;
  notes: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

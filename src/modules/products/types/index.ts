import type { Database } from "@/integrations/supabase/types";

// Database types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type FrameAttributes = Database["public"]["Tables"]["frame_attributes"]["Row"];
export type FrameAttributesInsert = Database["public"]["Tables"]["frame_attributes"]["Insert"];
export type FrameAttributesUpdate = Database["public"]["Tables"]["frame_attributes"]["Update"];

export type LensAttributes = Database["public"]["Tables"]["lens_attributes"]["Row"];
export type LensAttributesInsert = Database["public"]["Tables"]["lens_attributes"]["Insert"];
export type LensAttributesUpdate = Database["public"]["Tables"]["lens_attributes"]["Update"];

export type ItemType = Database["public"]["Enums"]["item_type"];
export type BrandLine = Database["public"]["Enums"]["brand_line"];
export type PriceTier = Database["public"]["Enums"]["price_tier"];

// ECMS Parser types
export interface ParsedDimensions {
  lens_width?: number;
  bridge_size?: number;
  temple_length?: number;
}

export interface ParsedProduct {
  external_id?: string;
  name: string;
  sku: string;
  brand?: string;
  brand_line: BrandLine;
  price: number;
  cost_price?: number;
  unit?: string;
  item_type?: ItemType;
  description?: string;
  color?: string;
  material?: string;
  style?: string;
  gender?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  lead_time_days?: number;
  frame_attributes?: {
    model_code?: string;
    frame_shape?: string;
    frame_material?: string;
    front_color?: string;
    lens_width?: number;
    bridge_size?: number;
    temple_length?: number;
  };
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ParseResult {
  products: ParsedProduct[];
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Import types
export type DuplicateHandling = "skip" | "update" | "fail";

export interface ImportOptions {
  batchSize: number;
  duplicateHandling: DuplicateHandling;
  createFrameAttributes: boolean;
}

export interface ImportProgress {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: ValidationError[];
  startTime: number;
  estimatedTimeRemaining: number | null;
}

export interface ImportResult {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ValidationError[];
}

// Import history types
export interface ImportHistoryRecord {
  id: string;
  import_type: string;
  file_name: string | null;
  total_records: number;
  new_products: number;
  updated_products: number;
  failed_records: number;
  duration_seconds: number | null;
  performed_by: string;
  created_at: string;
  error_details: ValidationError[];
}

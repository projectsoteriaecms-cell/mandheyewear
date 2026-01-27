import type { Database } from "@/integrations/supabase/types";

type ItemType = Database["public"]["Enums"]["item_type"];
type BrandLine = Database["public"]["Enums"]["brand_line"];

// Column name mappings from ECMS to database fields
export const ECMS_COLUMN_MAPPINGS: Record<string, string> = {
  // External ID
  productid: "external_id",
  product_id: "external_id",
  id: "external_id",
  externalid: "external_id",
  external_id: "external_id",

  // Product name
  itemdescription: "name",
  item_description: "name",
  productname: "name",
  product_name: "name",
  name: "name",
  description: "name",
  title: "name",

  // SKU
  sku: "sku",
  itemno: "sku",
  item_no: "sku",
  itemnumber: "sku",
  item_number: "sku",
  productcode: "sku",
  product_code: "sku",
  barcode: "sku",

  // Brand
  brand: "brand",
  brandname: "brand",
  brand_name: "brand",
  manufacturer: "brand",

  // Brand line
  brandline: "brand_line",
  brand_line: "brand_line",
  line: "brand_line",
  productline: "brand_line",
  product_line: "brand_line",
  category_line: "brand_line",

  // Price
  unitprice: "price",
  unit_price: "price",
  price: "price",
  sellingprice: "price",
  selling_price: "price",
  retailprice: "price",
  retail_price: "price",

  // Cost price
  costprice: "cost_price",
  cost_price: "cost_price",
  cost: "cost_price",
  purchaseprice: "cost_price",
  purchase_price: "cost_price",
  unitcost: "cost_price",
  unit_cost: "cost_price",

  // Unit
  unit: "unit",
  uom: "unit",
  unitofmeasure: "unit",
  unit_of_measure: "unit",

  // Item type
  producttype: "item_type",
  product_type: "item_type",
  itemtype: "item_type",
  item_type: "item_type",
  type: "item_type",
  category: "item_type",

  // Description
  fulldescription: "description",
  full_description: "description",
  longdescription: "description",
  long_description: "description",
  productdescription: "description",
  product_description: "description",
  details: "description",

  // Color
  color: "color",
  colour: "color",
  framecolor: "color",
  frame_color: "color",

  // Material
  material: "material",
  framematerial: "material",
  frame_material: "material",

  // Style
  style: "style",
  framestyle: "style",
  frame_style: "style",

  // Gender
  gender: "gender",
  sex: "gender",
  target_gender: "gender",

  // Dimensions (parsed separately)
  dimensions: "dimensions",
  size: "dimensions",
  framesize: "dimensions",
  frame_size: "dimensions",

  // Frame attributes
  modelcode: "model_code",
  model_code: "model_code",
  model: "model_code",
  modelnumber: "model_code",
  model_number: "model_code",

  frameshape: "frame_shape",
  frame_shape: "frame_shape",
  shape: "frame_shape",

  // Reorder settings
  reorderlevel: "reorder_level",
  reorder_level: "reorder_level",
  minstock: "reorder_level",
  min_stock: "reorder_level",
  minimumstock: "reorder_level",

  reorderqty: "reorder_quantity",
  reorder_qty: "reorder_quantity",
  reorderquantity: "reorder_quantity",
  reorder_quantity: "reorder_quantity",

  leadtimedays: "lead_time_days",
  lead_time_days: "lead_time_days",
  leadtime: "lead_time_days",
  lead_time: "lead_time_days",
};

// Database field names available for mapping
export const DATABASE_FIELDS = [
  { value: "external_id", label: "External ID" },
  { value: "name", label: "Product Name", required: true },
  { value: "sku", label: "SKU", required: true },
  { value: "brand", label: "Brand" },
  { value: "brand_line", label: "Brand Line", required: true },
  { value: "price", label: "Price", required: true },
  { value: "cost_price", label: "Cost Price" },
  { value: "unit", label: "Unit" },
  { value: "item_type", label: "Item Type" },
  { value: "description", label: "Description" },
  { value: "color", label: "Color" },
  { value: "material", label: "Material" },
  { value: "style", label: "Style" },
  { value: "gender", label: "Gender" },
  { value: "dimensions", label: "Dimensions (Frame Size)" },
  { value: "model_code", label: "Model Code" },
  { value: "frame_shape", label: "Frame Shape" },
  { value: "reorder_level", label: "Reorder Level" },
  { value: "reorder_quantity", label: "Reorder Quantity" },
  { value: "lead_time_days", label: "Lead Time (Days)" },
  { value: "_skip", label: "Skip Column" },
];

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
  // Frame attributes (populated if item_type is frames)
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

/**
 * Parse frame dimensions from various formats
 * Supports: "52-18-145", "52mm x 18mm x 145mm", "52/18/145"
 */
export function parseDimensions(dimString: string): ParsedDimensions {
  if (!dimString || typeof dimString !== "string") {
    return {};
  }

  const cleaned = dimString.trim().toLowerCase();

  // Pattern 1: "52-18-145" or "52/18/145"
  const dashSlashPattern = /^(\d+)\s*[-\/]\s*(\d+)\s*[-\/]\s*(\d+)$/;
  const dashSlashMatch = cleaned.match(dashSlashPattern);
  if (dashSlashMatch) {
    return {
      lens_width: parseInt(dashSlashMatch[1], 10),
      bridge_size: parseInt(dashSlashMatch[2], 10),
      temple_length: parseInt(dashSlashMatch[3], 10),
    };
  }

  // Pattern 2: "52mm x 18mm x 145mm" or "52 x 18 x 145"
  const xPattern = /^(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?\s*x\s*(\d+)\s*(?:mm)?$/;
  const xMatch = cleaned.match(xPattern);
  if (xMatch) {
    return {
      lens_width: parseInt(xMatch[1], 10),
      bridge_size: parseInt(xMatch[2], 10),
      temple_length: parseInt(xMatch[3], 10),
    };
  }

  // Pattern 3: Just numbers separated by spaces "52 18 145"
  const spacePattern = /^(\d+)\s+(\d+)\s+(\d+)$/;
  const spaceMatch = cleaned.match(spacePattern);
  if (spaceMatch) {
    return {
      lens_width: parseInt(spaceMatch[1], 10),
      bridge_size: parseInt(spaceMatch[2], 10),
      temple_length: parseInt(spaceMatch[3], 10),
    };
  }

  return {};
}

/**
 * Normalize brand line value to valid enum
 */
export function normalizeBrandLine(value: string): BrandLine | null {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim().replace(/[\s_-]+/g, "_");

  // Direct matches
  if (cleaned === "soteria_medical" || cleaned === "soteria") {
    return "soteria_medical";
  }
  if (
    cleaned === "m_and_h_fashion" ||
    cleaned === "m&h" ||
    cleaned === "mh" ||
    cleaned === "m_h" ||
    cleaned === "mandh" ||
    cleaned === "m_and_h"
  ) {
    return "m_and_h_fashion";
  }

  // Partial matches
  if (cleaned.includes("soteria") || cleaned.includes("medical")) {
    return "soteria_medical";
  }
  if (cleaned.includes("fashion") || cleaned.includes("m&h") || cleaned.includes("mh")) {
    return "m_and_h_fashion";
  }

  return null;
}

/**
 * Normalize item type value to valid enum
 */
export function normalizeItemType(value: string): ItemType | null {
  if (!value) return null;

  const cleaned = value.toLowerCase().trim().replace(/[\s-]+/g, "_");

  const typeMap: Record<string, ItemType> = {
    frame: "frames",
    frames: "frames",
    eyeglasses: "frames",
    sunglasses: "frames",
    spectacles: "frames",

    lens: "lenses",
    lenses: "lenses",

    contact_lens: "contact_lenses",
    contact_lenses: "contact_lenses",
    contacts: "contact_lenses",
    contactlens: "contact_lenses",

    solution: "solutions",
    solutions: "solutions",
    lens_solution: "solutions",

    medication: "medications",
    medications: "medications",
    medicine: "medications",
    drug: "medications",
    drugs: "medications",

    accessory: "accessories",
    accessories: "accessories",
    case: "accessories",
    cloth: "accessories",
    cleaning_cloth: "accessories",

    cleanser: "cleanser",
    cleaner: "cleanser",

    packaging: "packaging",
    package: "packaging",
    box: "packaging",

    other: "other",
    misc: "other",
    miscellaneous: "other",
  };

  return typeMap[cleaned] || null;
}

/**
 * Parse price from various formats
 * Handles: "85000", "85,000", "₦85,000", "NGN 85000", "85000.00"
 */
export function parsePrice(value: string | number): number | null {
  if (typeof value === "number") {
    return value > 0 ? Math.round(value) : null;
  }

  if (!value || typeof value !== "string") return null;

  // Remove currency symbols, commas, and whitespace
  const cleaned = value
    .replace(/[₦NGN$€£]/gi, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  const num = parseFloat(cleaned);
  return !isNaN(num) && num > 0 ? Math.round(num) : null;
}

/**
 * Auto-detect column mappings from header row
 */
export function detectColumnMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().replace(/[\s_-]+/g, "").trim();
    const dbField = ECMS_COLUMN_MAPPINGS[normalized];
    if (dbField) {
      mappings[header] = dbField;
    }
  });

  return mappings;
}

/**
 * Validate a single parsed product row
 */
export function validateProduct(
  product: Partial<ParsedProduct>,
  rowNum: number
): { errors: ValidationError[]; warnings: ValidationError[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!product.name?.trim()) {
    errors.push({ row: rowNum, column: "name", message: "Product name is required" });
  }
  if (!product.sku?.trim()) {
    errors.push({ row: rowNum, column: "sku", message: "SKU is required" });
  }
  if (!product.brand_line) {
    errors.push({ row: rowNum, column: "brand_line", message: "Brand line is required" });
  }
  if (!product.price || product.price <= 0) {
    errors.push({
      row: rowNum,
      column: "price",
      message: "Price must be a positive number",
      value: String(product.price || ""),
    });
  }

  // Warnings for missing optional fields
  if (!product.item_type) {
    warnings.push({
      row: rowNum,
      column: "item_type",
      message: "Item type not specified, will default to 'other'",
    });
  }
  if (!product.brand) {
    warnings.push({
      row: rowNum,
      column: "brand",
      message: "Brand name not specified",
    });
  }

  return { errors, warnings };
}

/**
 * Transform raw row data to ParsedProduct
 */
export function transformRowToProduct(
  row: Record<string, any>,
  mappings: Record<string, string>,
  rowNum: number
): { product: Partial<ParsedProduct>; errors: ValidationError[]; warnings: ValidationError[] } {
  const product: Partial<ParsedProduct> = {};
  const frameAttrs: ParsedProduct["frame_attributes"] = {};
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Process each mapped column
  Object.entries(mappings).forEach(([sourceCol, dbField]) => {
    if (dbField === "_skip") return;

    const value = row[sourceCol];
    if (value === undefined || value === null || value === "") return;

    const strValue = String(value).trim();

    switch (dbField) {
      case "external_id":
        product.external_id = strValue;
        break;

      case "name":
        product.name = strValue;
        break;

      case "sku":
        product.sku = strValue;
        break;

      case "brand":
        product.brand = strValue;
        break;

      case "brand_line":
        const brandLine = normalizeBrandLine(strValue);
        if (brandLine) {
          product.brand_line = brandLine;
        } else {
          warnings.push({
            row: rowNum,
            column: sourceCol,
            message: `Unknown brand line "${strValue}", defaulting to soteria_medical`,
            value: strValue,
          });
          product.brand_line = "soteria_medical";
        }
        break;

      case "price":
        const price = parsePrice(value);
        if (price !== null) {
          product.price = price;
        } else {
          errors.push({
            row: rowNum,
            column: sourceCol,
            message: `Invalid price format: "${strValue}"`,
            value: strValue,
          });
        }
        break;

      case "cost_price":
        const costPrice = parsePrice(value);
        if (costPrice !== null) {
          product.cost_price = costPrice;
        }
        break;

      case "unit":
        product.unit = strValue;
        break;

      case "item_type":
        const itemType = normalizeItemType(strValue);
        if (itemType) {
          product.item_type = itemType;
        } else {
          warnings.push({
            row: rowNum,
            column: sourceCol,
            message: `Unknown item type "${strValue}", defaulting to other`,
            value: strValue,
          });
          product.item_type = "other";
        }
        break;

      case "description":
        product.description = strValue;
        break;

      case "color":
        product.color = strValue;
        frameAttrs.front_color = strValue;
        break;

      case "material":
        product.material = strValue;
        frameAttrs.frame_material = strValue;
        break;

      case "style":
        product.style = strValue;
        break;

      case "gender":
        product.gender = strValue.toLowerCase();
        break;

      case "dimensions":
        const dims = parseDimensions(strValue);
        if (dims.lens_width) frameAttrs.lens_width = dims.lens_width;
        if (dims.bridge_size) frameAttrs.bridge_size = dims.bridge_size;
        if (dims.temple_length) frameAttrs.temple_length = dims.temple_length;
        break;

      case "model_code":
        frameAttrs.model_code = strValue;
        break;

      case "frame_shape":
        frameAttrs.frame_shape = strValue;
        break;

      case "reorder_level":
        const reorderLevel = parseInt(strValue, 10);
        if (!isNaN(reorderLevel)) product.reorder_level = reorderLevel;
        break;

      case "reorder_quantity":
        const reorderQty = parseInt(strValue, 10);
        if (!isNaN(reorderQty)) product.reorder_quantity = reorderQty;
        break;

      case "lead_time_days":
        const leadTime = parseInt(strValue, 10);
        if (!isNaN(leadTime)) product.lead_time_days = leadTime;
        break;
    }
  });

  // Attach frame attributes if we have any and it's a frame product
  const hasFrameAttrs = Object.values(frameAttrs).some((v) => v !== undefined);
  if (hasFrameAttrs && product.item_type === "frames") {
    product.frame_attributes = frameAttrs;
  }

  // Validate
  const validation = validateProduct(product, rowNum);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  return { product, errors, warnings };
}

/**
 * Generate a sample CSV template for ECMS import
 */
export function generateECMSTemplate(): string {
  const headers = [
    "ProductId",
    "ItemDescription",
    "SKU",
    "Brand",
    "BrandLine",
    "UnitPrice",
    "CostPrice",
    "Unit",
    "ProductType",
    "Description",
    "Color",
    "Material",
    "Style",
    "Gender",
    "Dimensions",
    "ModelCode",
    "FrameShape",
    "ReorderLevel",
    "ReorderQty",
    "LeadTimeDays",
  ];

  const sampleRow = [
    "1001",
    "VOGUE Cat Eye Frames",
    "VG-CE-001",
    "VOGUE",
    "soteria_medical",
    "85000",
    "45000",
    "Item",
    "frames",
    "Elegant cat eye frames for women",
    "Black",
    "Acetate",
    "Cat Eye",
    "female",
    "52-18-145",
    "VO5423",
    "Cat Eye",
    "10",
    "20",
    "7",
  ];

  return [headers.join(","), sampleRow.join(",")].join("\n");
}

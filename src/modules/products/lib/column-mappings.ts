// ECMS column name mappings to database fields
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

// Database field names available for mapping in UI
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

/**
 * Auto-detect column mappings from header row
 */
export function detectColumnMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};

  headers.forEach((header) => {
    const normalized = header.toLowerCase().replace(/[\s_-]+/g, "").trim();
    const dbField = ECMS_COLUMN_MAPPINGS[normalized];
    if (dbField) {
      mappings[header] = dbField;
    }
  });

  return mappings;
}

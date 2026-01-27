import type { ParsedProduct, ValidationError } from "../types";
import { parseDimensions, normalizeBrandLine, normalizeItemType, parsePrice } from "./parsers";
import { validateProduct } from "./validators";

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

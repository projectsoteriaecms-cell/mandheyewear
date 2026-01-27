import type { ParsedProduct, ValidationError } from "../types";

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

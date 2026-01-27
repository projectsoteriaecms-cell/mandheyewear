// Re-export from products module for backwards compatibility
// TODO: Update imports across codebase to use @/modules/products directly
export {
  ECMS_COLUMN_MAPPINGS,
  DATABASE_FIELDS,
  detectColumnMappings,
  parseDimensions,
  normalizeBrandLine,
  normalizeItemType,
  parsePrice,
  validateProduct,
  transformRowToProduct,
  generateECMSTemplate,
  type ParsedDimensions,
  type ParsedProduct,
  type ValidationError,
  type ParseResult,
} from "@/modules/products";

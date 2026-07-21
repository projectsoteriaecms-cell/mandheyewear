// Products module public API
// Hooks
export {
  useAdminProducts,
  useAdminProductsPaged,
  useProductImageStats,
  useECMSImport,
  useImportHistory,
  saveImportHistory,
  useFrameAttributes,
  useLensAttributes,
  useProductImageUpload,
  // Storefront-facing hooks — used by storefront, personalization, inventory
  useProducts,
  useProduct,
  useFeaturedProducts,
  useProductCategoryCounts,
  PUBLIC_PRODUCT_COLUMNS,
} from "./hooks";

// Types
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  FrameAttributes,
  FrameAttributesInsert,
  FrameAttributesUpdate,
  LensAttributes,
  LensAttributesInsert,
  LensAttributesUpdate,
  ItemType,
  BrandLine,
  PriceTier,
  ParsedDimensions,
  ParsedProduct,
  ValidationError,
  ParseResult,
  DuplicateHandling,
  ImportOptions,
  ImportProgress,
  ImportResult,
  ImportHistoryRecord,
} from "./types";
export type { ProductFilters, CategoryCount } from "./hooks/useProducts";

// Lib utilities
export * from "./lib";

// Components
export * from "./components";

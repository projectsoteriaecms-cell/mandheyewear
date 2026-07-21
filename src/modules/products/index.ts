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
  getHeroImage,
  getDisplayImages,
} from "./lib";

// Components
export {
  BulkImageUploadDialog,
  BulkUploadDialog,
  CreateProductDialog,
  DraggableImageItem,
  ECMSImportDialog,
  EditProductDialog,
  FrameAttributesForm,
  GenerateImagesDialog,
  ImagePreviewLightbox,
  ImportHistoryPanel,
  LensAttributesForm,
  LinkToZohoDialog,
  ProductImageCard,
  ProductImageListView,
  ProductImageUpload,
  IMAGE_POSITION_LABELS,
  ProductListView,
  QuickImageUploadModal,
  ZohoSyncHistoryPanel,
} from "./components";
export type { ImagePosition } from "./components";

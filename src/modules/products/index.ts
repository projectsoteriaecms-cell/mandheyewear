// Products module public API
// Hooks
export { 
  useAdminProducts,
  useProductImageStats,
  useECMSImport,
  useImportHistory,
  saveImportHistory,
  useFrameAttributes,
  useLensAttributes,
  useProductImageUpload,
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

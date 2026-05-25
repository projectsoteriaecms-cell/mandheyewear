// Products module hooks barrel export
export { useAdminProducts, useAdminProductsPaged, useProductImageStats } from "./useAdminProducts";
export type { AdminProductsParams } from "./useAdminProducts";
export { useECMSImport } from "./useECMSImport";
export { useImportHistory, saveImportHistory } from "./useImportHistory";
export { useFrameAttributes } from "./useFrameAttributes";
export { useLensAttributes } from "./useLensAttributes";
export { useProductImageUpload } from "./useProductImageUpload";
export { useSeedDescriptions } from "./useSeedDescriptions";
export type { SeedSource, SeedMode, SeedChange, SeedDryRunResult, SeedCommitResult, SeedOverride } from "./useSeedDescriptions";
export { useSeedImages, fileToBase64 } from "./useSeedImages";
export type {
  SeedImagesSource,
  SeedImagesMode,
  SeedImagesDryRunResult,
  SeedImagesCommitResult,
  SeedImagesPlanEntry,
  SeedImageFile,
} from "./useSeedImages";

// Storefront product hooks
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
  useProductCategoryCounts,
  type Product,
  type ProductFilters,
  type CategoryCount,
} from "./useProducts";

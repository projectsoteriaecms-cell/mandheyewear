// Products module hooks barrel export
export { useAdminProducts, useAdminProductsPaged, useProductImageStats } from "./useAdminProducts";
export type { AdminProductsParams } from "./useAdminProducts";
export { useECMSImport } from "./useECMSImport";
export { useImportHistory, saveImportHistory } from "./useImportHistory";
export { useFrameAttributes } from "./useFrameAttributes";
export { useLensAttributes } from "./useLensAttributes";
export { useProductImageUpload } from "./useProductImageUpload";
export { useSeedDescriptions } from "./useSeedDescriptions";
export type { SeedSource, SeedMode, SeedChange, SeedDryRunResult, SeedCommitResult } from "./useSeedDescriptions";

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

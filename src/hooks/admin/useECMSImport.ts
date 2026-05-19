// Re-export from products module for backwards compatibility
// TODO: Update imports across codebase to use @/modules/products directly
export { 
  useECMSImport,
  type DuplicateHandling,
  type ImportOptions,
  type ImportProgress,
  type ImportResult,
} from "@/modules/products";

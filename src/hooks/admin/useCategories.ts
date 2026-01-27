// Backwards compatibility re-export
// This file re-exports from the new modular location
export {
  useCategories,
  useActiveCategories,
} from "@/modules/categories/hooks/useCategories";

export type {
  Category,
  CategoryInsert,
  CategoryUpdate,
} from "@/modules/categories/types";

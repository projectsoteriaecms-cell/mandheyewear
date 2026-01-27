// Categories module types
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type CategoryInsert = TablesInsert<"categories">;
export type CategoryUpdate = TablesUpdate<"categories">;

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number | null;
  is_active: boolean | null;
  children: CategoryNode[];
}

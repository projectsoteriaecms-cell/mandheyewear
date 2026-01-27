import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Category, CategoryInsert, CategoryUpdate } from "../types";

export const useCategories = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: CategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`);
    },
  });

  const reorderCategories = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each category with its new display_order
      const updates = orderedIds.map((id, index) => 
        supabase
          .from("categories")
          .update({ display_order: index })
          .eq("id", id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error("Failed to update some categories");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category order updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder categories: ${error.message}`);
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
};

// Hook for public-facing categories (active only)
export const useActiveCategories = () => {
  return useQuery({
    queryKey: ["categories", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
};

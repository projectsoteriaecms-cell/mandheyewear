import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, ProductInsert } from "../types";

const IMAGE_STATS_REFETCH_MS = 30_000;

export const useProductImageStats = () => {
  const queryClient = useQueryClient();

  // Realtime invalidation: any product row change refreshes stats
  useEffect(() => {
    const channel = supabase
      .channel("product-image-stats-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const statsQuery = useQuery({
    queryKey: ["product-image-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_image_stats");
      if (error) {
        console.error("[useProductImageStats] RPC error:", error);
        throw error;
      }
      const result = data as Record<string, unknown> | null;
      return {
        total: Number(result?.total ?? 0),
        withPrimary: Number(result?.with_primary ?? 0),
        complete: Number(result?.complete ?? 0),
      };
    },
    refetchInterval: IMAGE_STATS_REFETCH_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const stats = statsQuery.data;

  return {
    total: stats?.total ?? 0,
    withPrimary: stats?.withPrimary ?? 0,
    missingPrimary: (stats?.total ?? 0) - (stats?.withPrimary ?? 0),
    complete: stats?.complete ?? 0,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
  };
};

export interface AdminProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brandFilter?: string;
  statusFilter?: string;
}

export const useAdminProducts = (params: AdminProductsParams = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, pageSize = 50, search = "", brandFilter = "all", statusFilter = "all" } = params;

  const productsQuery = useQuery({
    queryKey: ["admin-products", { page, pageSize, search, brandFilter, statusFilter }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select(
          `*, category:categories(id, name), supplier:suppliers(id, name)`,
          { count: "exact" }
        );

      const term = search.trim();
      if (term) {
        const safe = term.replace(/[%,()]/g, " ");
        query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`);
      }
      if (brandFilter !== "all") {
        query = query.eq("brand_line", brandFilter as any);
      }
      if (statusFilter === "active") query = query.eq("is_active", true);
      if (statusFilter === "inactive") query = query.eq("is_active", false);

      const { data, error, count } = await query
        .order("image_url", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { rows: data ?? [], totalCount: count ?? 0 };
    },
    placeholderData: (prev) => prev,
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductInsert) => {
      const { data: product, error } = await supabase
        .from("products")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const { data: product, error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const bulkCreateProducts = useMutation({
    mutationFn: async (products: ProductInsert[]) => {
      const { data, error } = await supabase
        .from("products")
        .insert(products)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      toast.success(`${data.length} products imported successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import products");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      toast.success("Product deactivated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate product");
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct,
    updateProduct,
    bulkCreateProducts,
    deleteProduct,
  };
};

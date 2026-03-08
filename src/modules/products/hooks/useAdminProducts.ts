import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, ProductInsert } from "../types";

export const useProductImageStats = () => {
  const totalQuery = useQuery({
    queryKey: ["product-image-stats", "total"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const withImagesQuery = useQuery({
    queryKey: ["product-image-stats", "with-images"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .not("image_url", "is", null);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const completeQuery = useQuery({
    queryKey: ["product-image-stats", "complete"],
    queryFn: async () => {
      // Can't filter array length server-side easily, so fetch ids of products with images + additional_images
      // Use a lightweight approach: fetch only additional_images for products that have a primary image
      const { data, error } = await supabase
        .from("products")
        .select("additional_images")
        .not("image_url", "is", null)
        .not("additional_images", "is", null)
        .range(0, 4999);
      if (error) throw error;
      return (data ?? []).filter(
        (p) => p.additional_images && p.additional_images.length >= 5
      ).length;
    },
  });

  const total = totalQuery.data ?? 0;
  const withPrimary = withImagesQuery.data ?? 0;

  return {
    total,
    withPrimary,
    missingPrimary: total - withPrimary,
    complete: completeQuery.data ?? 0,
    isLoading: totalQuery.isLoading || withImagesQuery.isLoading || completeQuery.isLoading,
  };
};

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          supplier:suppliers(id, name),
          frame_attributes(*),
          lens_attributes(*)
        `)
        .order("created_at", { ascending: false })
        .range(0, 4999);

      if (error) throw error;
      return data;
    },
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const useProducts = (brandLine?: "soteria_medical" | "m_and_h_fashion", withImagesOnly?: boolean) => {
  return useQuery({
    queryKey: ["products", brandLine, withImagesOnly],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (brandLine) {
        query = query.eq("brand_line", brandLine);
      }

      if (withImagesOnly) {
        query = query.not("image_url", "is", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
};

const LUXURY_BRANDS = [
  "CARTIER", "GUCCI", "BURBERRY", "CHANEL", "CHROME HEART",
  "GENTLE MONSTER", "SAINT LAURENT", "VERSACE",
];

export const useFeaturedProducts = (limit = 4) => {
  return useQuery({
    queryKey: ["featured-products", limit],
    queryFn: async () => {
      // Get products with images, ordered by price desc (luxury first)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .not("image_url", "is", null)
        .order("price", { ascending: false });

      if (error) throw error;

      // Prioritize products with 3+ additional images, then luxury brands
      const scored = (data || []).map((p) => {
        const imgCount = p.additional_images?.length ?? 0;
        const isLuxury = LUXURY_BRANDS.some(
          (b) => p.brand?.toUpperCase() === b
        );
        return {
          product: p,
          score: (imgCount >= 3 ? 100 : imgCount * 20) + (isLuxury ? 50 : 0),
        };
      });

      scored.sort((a, b) => b.score - a.score || b.product.price - a.product.price);

      return scored.slice(0, limit).map((s) => s.product) as Product[];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!productId,
  });
};

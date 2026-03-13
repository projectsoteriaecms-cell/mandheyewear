import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export interface ProductFilters {
  brandLine?: "soteria_medical" | "m_and_h_fashion";
  withImagesOnly?: boolean;
  categoryFilter?: string;
  genderFilter?: string;
  styleFilter?: string;
  priceTierFilter?: string | null;
  priceSort?: string;
  page?: number;
  pageSize?: number;
}

const PAGE_SIZE = 12;

async function fetchAllRows(query: any): Promise<Product[]> {
  const batchSize = 1000;
  let allData: Product[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await query.range(from, from + batchSize - 1);
    if (error) throw error;
    allData = allData.concat(data || []);
    hasMore = (data?.length || 0) === batchSize;
    from += batchSize;
  }

  return allData;
}

export const useProducts = (brandLine?: "soteria_medical" | "m_and_h_fashion", withImagesOnly?: boolean) => {
  return useQuery({
    queryKey: ["products", brandLine, withImagesOnly],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (brandLine) {
        query = query.eq("brand_line", brandLine);
      }

      if (withImagesOnly) {
        query = query.not("image_url", "is", null);
      }

      return fetchAllRows(query);
    },
  });
};

export type CategoryCount = { category: string; count: number };

export const useProductCategoryCounts = () => {
  return useQuery({
    queryKey: ["product-category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_category_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of (data || []) as CategoryCount[]) {
        counts[row.category] = Number(row.count);
      }
      return counts;
    },
    staleTime: 60_000,
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

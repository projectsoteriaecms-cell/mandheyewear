import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { HIDE_MH_FRAMES, MH_FRAME_CATEGORY_KEYS } from "../lib/catalog-flags";

export type Product = Tables<"products">;

/**
 * Columns the `anon`/`authenticated` roles are granted SELECT on.
 * The products table uses column-level grants to hide wholesale/ERP data
 * (cost_price, supplier_id, zoho_item_id, reorder_*, etc.), so `select("*")`
 * fails with 401 "permission denied" — storefront queries must list columns
 * explicitly. Keep in sync with the DB grants.
 */
export const PUBLIC_PRODUCT_COLUMNS =
  "additional_images, brand, brand_line, bridge_size, category_id, color, created_at, currency, description, description_html, description_raw, frame_width, gender, id, image_url, is_active, is_prescription_compatible, item_type, material, name, price, price_tier, primary_image_locked, record_type, sku, style, tagline, temple_length, unit, updated_at";

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
    queryKey: ["products", brandLine, withImagesOnly, HIDE_MH_FRAMES],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (brandLine) {
        query = query.eq("brand_line", brandLine);
      }

      if (withImagesOnly) {
        query = query.not("image_url", "is", null);
      }

      if (withImagesOnly || brandLine === "m_and_h_fashion") {
        query = query.gt("price", 0);
      }

      // Soft-hide M&H Eyewear frames from storefront while images are being finetuned.
      if (HIDE_MH_FRAMES && (brandLine === "m_and_h_fashion" || !brandLine)) {
        query = query.neq("item_type", "frames");
      }

      return fetchAllRows(query);
    },
  });
};

export type CategoryCount = { category: string; count: number };

export const useProductCategoryCounts = () => {
  return useQuery({
    queryKey: ["product-category-counts", HIDE_MH_FRAMES],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_product_category_counts");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of (data || []) as CategoryCount[]) {
        counts[row.category] = Number(row.count);
      }
      if (HIDE_MH_FRAMES) {
        for (const key of MH_FRAME_CATEGORY_KEYS) counts[key] = 0;
        // 'all' includes frames — recompute from remaining non-frame categories.
        const nonFrame = Object.entries(counts)
          .filter(([k]) => k !== "all" && !MH_FRAME_CATEGORY_KEYS.includes(k as any))
          .reduce((sum, [, v]) => sum + v, 0);
        counts.all = nonFrame;
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
      let q = supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("image_url", "is", null)
        .gt("price", 0)
        .order("price", { ascending: false });

      if (HIDE_MH_FRAMES) {
        q = q.neq("item_type", "frames");
      }

      const { data, error } = await q;

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
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("id", productId)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!productId,
  });
};

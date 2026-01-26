import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const useProducts = (brandLine?: "soteria_medical" | "m_and_h_fashion") => {
  return useQuery({
    queryKey: ["products", brandLine],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (brandLine) {
        query = query.eq("brand_line", brandLine);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
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

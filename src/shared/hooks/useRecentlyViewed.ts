import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { PUBLIC_PRODUCT_COLUMNS } from "@/modules/products";

export const useRecentlyViewed = (limit = 8) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recently-viewed", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      // Get distinct recently viewed product IDs
      const { data: activities, error } = await supabase
        .from("user_activity")
        .select("product_id, created_at")
        .eq("user_id", user.id)
        .eq("activity_type", "product_view")
        .not("product_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Deduplicate by product_id, keeping the most recent
      const seen = new Set<string>();
      const uniqueProductIds: string[] = [];
      for (const a of activities || []) {
        if (a.product_id && !seen.has(a.product_id)) {
          seen.add(a.product_id);
          uniqueProductIds.push(a.product_id);
        }
        if (uniqueProductIds.length >= limit) break;
      }

      if (!uniqueProductIds.length) return [];

      // Fetch the products
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .in("id", uniqueProductIds)
        .eq("is_active", true);

      if (pErr) throw pErr;

      // Sort by the order they were viewed (most recent first)
      const productMap = new Map((products || []).map((p) => [p.id, p]));
      return uniqueProductIds
        .map((id) => productMap.get(id))
        .filter(Boolean) as typeof products;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
};

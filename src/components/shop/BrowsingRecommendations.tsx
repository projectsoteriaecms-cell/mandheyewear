import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_PRODUCT_COLUMNS, type Product } from "@/modules/products/hooks/useProducts";
import { ProductCard } from "@/modules/storefront/components/eyewear/ProductCard";
import { Sparkles } from "lucide-react";

export const BrowsingRecommendations = () => {
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ["browsing-recommendations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get styles/brands/materials from recently viewed products
      const { data: activities } = await supabase
        .from("user_activity")
        .select("product_id")
        .eq("user_id", user.id)
        .eq("activity_type", "product_view")
        .not("product_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!activities?.length) return [];

      const viewedIds = [...new Set(activities.map((a) => a.product_id!))];

      // Get the viewed products' metadata
      const { data: viewedProducts } = await supabase
        .from("products")
        .select("style, material, brand, price_tier")
        .in("id", viewedIds)
        .eq("is_active", true);

      if (!viewedProducts?.length) return [];

      // Collect the most common styles/materials
      const styles = viewedProducts.map((p) => p.style).filter(Boolean) as string[];
      const materials = viewedProducts.map((p) => p.material).filter(Boolean) as string[];

      // Find similar products not yet viewed
      let query = supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("id", "in", `(${viewedIds.join(",")})`)
        .limit(8);

      // Prefer matching styles
      if (styles.length > 0) {
        const topStyle = styles[0];
        query = query.ilike("style", `%${topStyle}%`);
      }

      const { data: recommended } = await query;

      // If style filter is too narrow, fallback to broader results
      if (!recommended?.length) {
        const { data: fallback } = await supabase
          .from("products")
          .select(PUBLIC_PRODUCT_COLUMNS)
          .eq("is_active", true)
          .eq("brand_line", "m_and_h_fashion")
          .not("id", "in", `(${viewedIds.join(",")})`)
          .limit(8);

        // Rows exclude admin-only columns (cost_price etc.) which the storefront never renders
        return (fallback || []) as Product[];
      }

      return recommended as Product[];
    },
    enabled: !!user,
    staleTime: 120_000,
  });

  if (isLoading || !products?.length) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground">
          Based on Your Browsing
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

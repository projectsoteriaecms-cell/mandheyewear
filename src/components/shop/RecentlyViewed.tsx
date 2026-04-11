import { useRecentlyViewed } from "@/shared/hooks/useRecentlyViewed";
import { ProductCard } from "@/modules/storefront/components/eyewear/ProductCard";
import { Clock } from "lucide-react";

export const RecentlyViewed = () => {
  const { data: products, isLoading } = useRecentlyViewed(8);

  if (isLoading || !products?.length) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground">
          Recently Viewed
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

import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/eyewear/ProductCard";
import { ProductFilters } from "@/components/eyewear/ProductFilters";
import { VirtualTryOnBanner } from "@/components/eyewear/VirtualTryOnBanner";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Eyewear = () => {
  const [genderFilter, setGenderFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("featured");

  // Fetch M&H Fashion products for the eyewear page
  const { data: products, isLoading, error } = useProducts("m_and_h_fashion");

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((p) => {
        if (genderFilter === "all") return true;
        return p.gender === genderFilter || p.gender === "unisex";
      })
      .filter((p) => {
        if (styleFilter === "all") return true;
        return p.style === styleFilter;
      })
      .sort((a, b) => {
        if (priceSort === "low-high") return a.price - b.price;
        if (priceSort === "high-low") return b.price - a.price;
        return 0;
      });
  }, [products, genderFilter, styleFilter, priceSort]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              M & H Eyewear Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designer frames that combine style, comfort, and precision
            </p>
          </div>

          <ProductFilters
            genderFilter={genderFilter}
            styleFilter={styleFilter}
            priceSort={priceSort}
            onGenderChange={setGenderFilter}
            onStyleChange={setStyleFilter}
            onPriceSortChange={setPriceSort}
          />

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                Failed to load products. Please try again later.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No products match your filters. Try adjusting your selection.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <VirtualTryOnBanner />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Eyewear;

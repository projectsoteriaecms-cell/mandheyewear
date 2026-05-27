import { useState, useMemo, useEffect } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Link, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/modules/storefront/components/eyewear/ProductCard";
import { ProductListCard } from "@/modules/storefront/components/eyewear/ProductListCard";
import { ShopCategoryBar } from "@/modules/storefront/components/eyewear/ShopCategoryBar";
import { ShopSidebar } from "@/modules/storefront/components/eyewear/ShopSidebar";
import { MobileFilterDrawer } from "@/modules/storefront/components/eyewear/MobileFilterDrawer";
import { VirtualTryOnBanner } from "@/modules/storefront/components/eyewear/VirtualTryOnBanner";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { useProducts, useProductCategoryCounts } from "@/modules/products/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Pagination, ProductQuickView } from "@/modules/storefront/components/shared";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { House, Eye, SquaresFour, List } from "@phosphor-icons/react";

const PRODUCTS_PER_PAGE = 12;

type ViewMode = "grid" | "list";
type PriceTier = "budget" | "standard" | "premium" | "luxury";
type SortMode = "featured" | "low-high" | "high-low" | "newest" | "trending";

const Eyewear = () => {
  useSEO({
    title: "Shop Designer Eyewear – Prescription Glasses & Sunglasses | M&H",
    description: "Browse 100+ premium frames. Prescription glasses, sunglasses, and fashion eyewear with free virtual try-on.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [genderFilter, setGenderFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceSort, setPriceSort] = useState<SortMode>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [priceTierFilter, setPriceTierFilter] = useState<PriceTier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Parse filter/sort/category from URL params
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "new-arrivals") {
      setPriceSort("newest");
      setPriceTierFilter(null);
    } else if (filter === "trending") {
      setPriceSort("trending");
      setPriceTierFilter(null);
    } else if (filter?.startsWith("price-tier-")) {
      const tier = filter.replace("price-tier-", "") as PriceTier;
      if (["budget", "standard", "premium", "luxury"].includes(tier)) {
        setPriceTierFilter(tier);
      }
      setPriceSort("featured");
    } else {
      setPriceTierFilter(null);
      // Don't reset priceSort here — let the user's manual choice persist
    }
    const category = searchParams.get("category");
    setCategoryFilter(category || "all");
  }, [searchParams]);

  const clearPriceTierFilter = () => {
    setPriceTierFilter(null);
    searchParams.delete("filter");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const { data: products, isLoading, error } = useProducts("m_and_h_fashion");
  const { data: categoryCounts = {} } = useProductCategoryCounts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p) => genderFilter === "all" || p.gender === genderFilter || p.gender === "unisex")
      .filter((p) => styleFilter === "all" || p.style === styleFilter)
      .filter((p) => !priceTierFilter || p.price_tier === priceTierFilter)
      .filter((p) => {
        if (categoryFilter === "all") return true;
        if (categoryFilter === "eyeglasses") return p.item_type === "frames" && p.is_prescription_compatible !== false;
        if (categoryFilter === "sunglasses") return p.item_type === "frames" && p.is_prescription_compatible === false;
        if (categoryFilter === "accessories") return ["accessories", "solutions", "cleanser", "other", "medications"].includes(p.item_type || "");
        return p.item_type === categoryFilter;
      })
      .sort((a, b) => {
        // Tier score helper — luxury at top, untiered at bottom
        const tierScore = (p: typeof a) => {
          if (p.price_tier === "luxury") return 4;
          if (p.price_tier === "premium") return 3;
          if (p.price_tier === "standard") return 2;
          if (p.price_tier === "budget") return 1;
          return 0;
        };

        // Primary: products with images always surface above those without
        const aHasImage = a.image_url ? 1 : 0;
        const bHasImage = b.image_url ? 1 : 0;
        if (aHasImage !== bHasImage) return bHasImage - aHasImage;

        // Manual sort overrides (user chose a different order in the sidebar)
        if (priceSort === "low-high") return a.price - b.price;
        if (priceSort === "high-low") return b.price - a.price;
        if (priceSort === "newest") {
          return new Date((b as any).created_at || 0).getTime() -
                 new Date((a as any).created_at || 0).getTime();
        }

        // Default ("featured") and "trending": highest tier first within each image group
        return tierScore(b) - tierScore(a);
      });
  }, [products, genderFilter, styleFilter, priceSort, priceTierFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleQuickView = (productId: string) => {
    setQuickViewProductId(productId);
  };

  // Count active filters
  const activeFilterCount = [
    genderFilter !== "all",
    styleFilter !== "all",
    priceSort !== "featured",
    !!priceTierFilter,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setGenderFilter("all");
    setStyleFilter("all");
    setPriceSort("featured");
    setPriceTierFilter(null);
    searchParams.delete("filter");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  const filterProps = {
    genderFilter,
    styleFilter,
    priceSort,
    priceTierFilter: priceTierFilter as string | null,
    onGenderChange: handleFilterChange(setGenderFilter),
    onStyleChange: handleFilterChange(setStyleFilter),
    onPriceSortChange: handleFilterChange(setPriceSort as (value: string) => void),
    onPriceTierChange: (val: string | null) => {
      setPriceTierFilter(val as PriceTier | null);
      if (val) {
        searchParams.set("filter", `price-tier-${val}`);
      } else {
        searchParams.delete("filter");
      }
      setSearchParams(searchParams);
      setCurrentPage(1);
    },
    activeFilterCount,
    onClearAll: clearAllFilters,
  };

  // Page title based on category
  const pageTitle = categoryFilter === "eyeglasses"
    ? "Eyeglasses"
    : categoryFilter === "sunglasses"
    ? "Sunglasses"
    : categoryFilter === "accessories"
    ? "Accessories"
    : categoryFilter === "all"
    ? "M & H Collection"
    : categoryFilter.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <House weight="light" className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {categoryFilter !== "all" ? (
                  <>
                    <BreadcrumbLink asChild>
                      <Link to="/shop" className="flex items-center gap-1">Shop</Link>
                    </BreadcrumbLink>
                  </>
                ) : (
                  <BreadcrumbPage className="flex items-center gap-1">
                    <Eye weight="duotone" className="h-4 w-4" />
                    Shop
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {categoryFilter !== "all" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-3">
              {pageTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designer frames, lenses, accessories & more
            </p>
          </div>
        </div>

        {/* Category Bar — full-width visual strip */}
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto">
            <ShopCategoryBar
              activeCategory={categoryFilter}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Two-column layout: Sidebar + Products */}
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-28">
                <ShopSidebar {...filterProps} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile filter trigger */}
                  <MobileFilterDrawer {...filterProps} />

                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </p>
                </div>

                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => value && setViewMode(value as ViewMode)}
                  className="border rounded-lg p-0.5"
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view" className="px-2.5 h-8">
                    <SquaresFour className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" className="px-2.5 h-8">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-lg" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <EmptyState
                  type="products"
                  title="Failed to load products"
                  description="We couldn't load the collection. Please try again later."
                  actionLabel="Refresh Page"
                  onAction={() => window.location.reload()}
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  type="search"
                  title="No products match your filters"
                  description="Try adjusting your selection or clear filters to see all products."
                  actionLabel="Clear All Filters"
                  onAction={() => {
                    clearAllFilters();
                    handleCategoryChange("all");
                  }}
                />
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {paginatedProducts.map((product) => (
                        <div key={product.id} onClick={() => handleQuickView(product.id)}>
                          <ProductListCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>

          <VirtualTryOnBanner />

          {/* Recently Viewed */}
          <RecentlyViewed />
        </div>
      </div>

      <ProductQuickView
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      <Footer />
    </div>
  );
};

export default Eyewear;

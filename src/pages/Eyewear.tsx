import { useState, useMemo, useEffect, useRef } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Link, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/eyewear/ProductCard";
import { ProductListCard } from "@/components/eyewear/ProductListCard";
import { ProductFilters } from "@/components/eyewear/ProductFilters";
import { VirtualTryOnBanner } from "@/components/eyewear/VirtualTryOnBanner";
import { useProducts } from "@/hooks/useProducts";
import { usePersonalizedProducts } from "@/hooks/usePersonalizedProducts";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Pagination, ProductQuickView } from "@/components/storefront";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { House, Eye, SquaresFour, List, X, Eyeglasses, Sun, Drop, FirstAid, Package, Cube } from "@phosphor-icons/react";
import { Sparkles, ChevronRight } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

type ViewMode = "grid" | "list";
type PriceTier = "budget" | "standard" | "premium" | "luxury";

// Price tier display names
const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  budget: "Budget",
  standard: "Standard",
  premium: "Premium",
  luxury: "Luxury",
};

// Item type category definitions
const ITEM_TYPE_CATEGORIES = [
  { key: "all", label: "All Products", icon: Cube },
  { key: "eyeglasses", label: "Eyeglasses", icon: Eyeglasses },
  { key: "sunglasses", label: "Sunglasses", icon: Sun },
  { key: "lenses", label: "Lenses", icon: Eye },
  { key: "contact_lenses", label: "Contact Lenses", icon: Drop },
  { key: "accessories", label: "Accessories", icon: Package },
  { key: "solutions", label: "Solutions & Care", icon: Drop },
  { key: "medications", label: "Medications", icon: FirstAid },
  { key: "other", label: "Other Items", icon: Cube },
] as const;

type CategoryKey = typeof ITEM_TYPE_CATEGORIES[number]["key"];

const Eyewear = () => {
  useSEO({
    title: "Shop Eyewear, Lenses, Contacts & Accessories | M&H",
    description: "Browse our full catalog — prescription glasses, sunglasses, contact lenses, solutions, accessories and more. Buy online in Nigeria.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [genderFilter, setGenderFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [showPersonalized, setShowPersonalized] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [priceTierFilter, setPriceTierFilter] = useState<PriceTier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryKey>("all");

  const { isAuthenticated } = useAuth();
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const [highlightRecommendations, setHighlightRecommendations] = useState(false);

  // Handle redirect from onboarding
  useEffect(() => {
    if (searchParams.get("from") === "onboarding") {
      searchParams.delete("from");
      setSearchParams(searchParams, { replace: true });
      setHighlightRecommendations(true);
      setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
      setTimeout(() => setHighlightRecommendations(false), 3000);
    }
  }, []);

  // Parse price tier and category from URL params
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter?.startsWith("price-tier-")) {
      const tier = filter.replace("price-tier-", "") as PriceTier;
      if (["budget", "standard", "premium", "luxury"].includes(tier)) {
        setPriceTierFilter(tier);
      }
    } else {
      setPriceTierFilter(null);
    }

    const category = searchParams.get("category");
    if (category) {
      const validKeys = ITEM_TYPE_CATEGORIES.map(c => c.key);
      setCategoryFilter(validKeys.includes(category as CategoryKey) ? category as CategoryKey : "all");
    } else {
      setCategoryFilter("all");
    }
  }, [searchParams]);

  // Clear price tier filter
  const clearPriceTierFilter = () => {
    setPriceTierFilter(null);
    searchParams.delete("filter");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Set category filter
  const handleCategoryChange = (key: CategoryKey) => {
    setCategoryFilter(key);
    if (key === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", key);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Fetch ALL products (not just ones with images)
  const { data: products, isLoading, error } = useProducts();

  // Get personalized products
  const {
    scoredProducts,
    topPicks,
    hasPreferences,
    hasMeasurements,
    getProductScore,
  } = usePersonalizedProducts();

  // Get category counts for badges
  const categoryCounts = useMemo(() => {
    if (!products) return {};
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      // Map to our display categories
      if (p.item_type === "frames") {
        if (p.is_prescription_compatible === false) {
          counts["sunglasses"] = (counts["sunglasses"] || 0) + 1;
        } else {
          counts["eyeglasses"] = (counts["eyeglasses"] || 0) + 1;
        }
      } else if (p.item_type) {
        // Group cleanser with solutions
        const key = p.item_type === "cleanser" ? "solutions" : 
                    p.item_type === "packaging" ? "other" : p.item_type;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

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
      .filter((p) => {
        if (!priceTierFilter) return true;
        return p.price_tier === priceTierFilter;
      })
      .filter((p) => {
        if (categoryFilter === "all") return true;
        if (categoryFilter === "eyeglasses") return p.item_type === "frames" && p.is_prescription_compatible !== false;
        if (categoryFilter === "sunglasses") return p.item_type === "frames" && p.is_prescription_compatible === false;
        if (categoryFilter === "solutions") return p.item_type === "solutions" || p.item_type === "cleanser";
        if (categoryFilter === "other") return p.item_type === "other" || p.item_type === "packaging";
        return p.item_type === categoryFilter;
      })
      .sort((a, b) => {
        if (priceSort === "low-high") return a.price - b.price;
        if (priceSort === "high-low") return b.price - a.price;
        // Prioritize products with images, then by match score
        const aHasImage = a.image_url ? 1 : 0;
        const bHasImage = b.image_url ? 1 : 0;
        if (aHasImage !== bHasImage) return bHasImage - aHasImage;
        if (showPersonalized && hasPreferences) {
          const scoreA = getProductScore(a.id)?.matchScore || 0;
          const scoreB = getProductScore(b.id)?.matchScore || 0;
          return scoreB - scoreA;
        }
        return 0;
      });
  }, [products, genderFilter, styleFilter, priceSort, showPersonalized, hasPreferences, getProductScore, priceTierFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleQuickView = (productId: string) => {
    setQuickViewProductId(productId);
  };

  const showRecommendationsSection = isAuthenticated && hasPreferences && topPicks.length > 0;

  // Determine page title based on active category
  const activeCategory = ITEM_TYPE_CATEGORIES.find(c => c.key === categoryFilter);
  const pageTitle = categoryFilter === "all" ? "M & H Product Catalog" : activeCategory?.label || "Products";

  // Show frame-specific filters only for frame categories
  const showFrameFilters = categoryFilter === "all" || categoryFilter === "eyeglasses" || categoryFilter === "sunglasses";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
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
                <BreadcrumbPage className="flex items-center gap-1">
                  <Eye weight="duotone" className="h-4 w-4" />
                  {categoryFilter === "all" ? "Shop" : activeCategory?.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              {pageTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {categoryFilter === "all"
                ? "Eyewear, lenses, contacts, accessories and more"
                : `Browse our ${activeCategory?.label?.toLowerCase()} collection`}
            </p>
            {filteredProducts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </p>
            )}
          </div>

          {/* Category Tabs */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2 min-w-max justify-center flex-wrap">
              {ITEM_TYPE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = categoryCounts[cat.key] || 0;
                const isActive = categoryFilter === cat.key;
                // Hide categories with 0 products (except "all")
                if (cat.key !== "all" && count === 0) return null;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon weight={isActive ? "fill" : "regular"} className="h-4 w-4" />
                    {cat.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filter Badges */}
          {priceTierFilter && (
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtering by:</span>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                {PRICE_TIER_LABELS[priceTierFilter]} Frames
                <button
                  onClick={clearPriceTierFilter}
                  className="ml-1 hover:bg-muted rounded-full p-0.5 transition-colors"
                  aria-label="Clear price tier filter"
                >
                  <X weight="bold" className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Personalization CTA for non-personalized users */}
          {isAuthenticated && !hasPreferences && (
            <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Find Your Perfect Frames</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete your style profile and get personalized recommendations
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/onboarding">
                    Get Personalized
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommended For You Section */}
          {showRecommendationsSection && (
            <div
              ref={recommendationsRef}
              className={`mb-12 rounded-xl transition-all duration-1000 ${highlightRecommendations ? "ring-2 ring-primary/50 bg-primary/5 p-4 -m-4" : ""}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-display font-bold">Recommended For You</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard?tab=frame-profile">
                    Edit Preferences
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topPicks.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    onDoubleClick={() => handleQuickView(product.id)}
                  >
                    <ProductCard
                      product={product}
                      matchScore={product.matchScore}
                      matchReasons={product.matchReasons}
                      fitIndicator={product.fitIndicator}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Products Section */}
          {showRecommendationsSection && (
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-display font-bold">All Products</h2>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {showFrameFilters && (
              <ProductFilters
                genderFilter={genderFilter}
                styleFilter={styleFilter}
                priceSort={priceSort}
                onGenderChange={handleFilterChange(setGenderFilter)}
                onStyleChange={handleFilterChange(setStyleFilter)}
                onPriceSortChange={handleFilterChange(setPriceSort)}
              />
            )}
            {!showFrameFilters && (
              <div className="flex-1">
                <ProductFilters
                  genderFilter="all"
                  styleFilter="all"
                  priceSort={priceSort}
                  onGenderChange={() => {}}
                  onStyleChange={() => {}}
                  onPriceSortChange={handleFilterChange(setPriceSort)}
                  sortOnly
                />
              </div>
            )}
            
            {/* View Mode Toggle */}
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="border rounded-lg p-1"
            >
              <ToggleGroupItem value="grid" aria-label="Grid view" className="px-3">
                <SquaresFour className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view" className="px-3">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

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
            <EmptyState
              type="products"
              title="Failed to load products"
              description="We couldn't load the product catalog. Please try again later."
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
                setGenderFilter("all");
                setStyleFilter("all");
                setPriceSort("featured");
                handleCategoryChange("all");
              }}
            />
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => {
                    const scored = getProductScore(product.id);
                    return (
                      <div
                        key={product.id}
                        onDoubleClick={() => handleQuickView(product.id)}
                      >
                        <ProductCard
                          product={product}
                          matchScore={hasPreferences ? scored?.matchScore : undefined}
                          matchReasons={scored?.matchReasons}
                          fitIndicator={hasMeasurements ? scored?.fitIndicator : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {paginatedProducts.map((product) => {
                    const scored = getProductScore(product.id);
                    return (
                      <div
                        key={product.id}
                        onDoubleClick={() => handleQuickView(product.id)}
                      >
                        <ProductListCard
                          product={product}
                          matchScore={hasPreferences ? scored?.matchScore : undefined}
                          matchReasons={scored?.matchReasons}
                          fitIndicator={hasMeasurements ? scored?.fitIndicator : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          <VirtualTryOnBanner />
        </div>
      </div>

      {/* Quick View Modal */}
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

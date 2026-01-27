import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/eyewear/ProductCard";
import { ProductFilters } from "@/components/eyewear/ProductFilters";
import { VirtualTryOnBanner } from "@/components/eyewear/VirtualTryOnBanner";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, Pagination, ProductQuickView } from "@/components/storefront";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const PRODUCTS_PER_PAGE = 12;

const Eyewear = () => {
  const [genderFilter, setGenderFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);

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
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Eyewear
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              M & H Eyewear Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designer frames that combine style, comfort, and precision
            </p>
            {filteredProducts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
              </p>
            )}
          </div>

          <ProductFilters
            genderFilter={genderFilter}
            styleFilter={styleFilter}
            priceSort={priceSort}
            onGenderChange={handleFilterChange(setGenderFilter)}
            onStyleChange={handleFilterChange(setStyleFilter)}
            onPriceSortChange={handleFilterChange(setPriceSort)}
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
            <EmptyState
              type="products"
              title="Failed to load products"
              description="We couldn't load the eyewear collection. Please try again later."
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
              }}
            />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onDoubleClick={() => handleQuickView(product.id)}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

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

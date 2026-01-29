import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkle,
  TrendUp,
  Tag,
  CurrencyCircleDollar,
  Camera,
  ArrowRight,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Quick filter options with meaningful icons
const quickFilters = [
  { label: "Best Sellers", filter: "best-sellers", icon: TrendUp },
  { label: "New Arrivals", filter: "new-arrivals", icon: Sparkle },
  { label: "Under ₦50k", filter: "under-50000", icon: CurrencyCircleDollar },
  { label: "Virtual Try-On", filter: "try-on-ready", icon: Camera },
  { label: "On Sale", filter: "on-sale", icon: Tag },
];

export const QuickDiscovery = () => {
  // Fetch trending products with real images
  const { data: products, isLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, image_url")
        .eq("is_active", true)
        .eq("item_type", "frames")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  // Get featured product for banner (first product with image)
  const featuredProduct = products?.[0];

  return (
    <section className="py-8 lg:py-12 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container px-4">
        {/* Trending Frames Row */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-primary uppercase tracking-wider">
              Trending Frames
            </h2>
            <Link 
              to="/eyewear?filter=trending"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <Skeleton className="w-32 h-32 rounded-xl" />
                  <Skeleton className="w-20 h-3 mt-2" />
                  <Skeleton className="w-16 h-4 mt-1" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div 
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/eyewear/${product.id}`}
                  className="flex-shrink-0 w-32 snap-start group"
                >
                  <div className="relative w-32 h-32 rounded-xl bg-white border border-border overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {product.brand || "M&H Eyewear"}
                  </p>
                  <p className="text-sm font-semibold text-accent">
                    ₦{product.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No trending frames available</p>
            </div>
          )}
        </div>

        {/* Promotional Banner - Rich Blue Gradient */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary/85">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-accent/20 rounded-full blur-xl" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            
            {/* Content grid */}
            <div className="relative grid md:grid-cols-5 gap-6 p-6 lg:p-10">
              <div className="md:col-span-3 space-y-4 z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium">
                  <Sparkle weight="fill" className="w-3.5 h-3.5 text-accent" />
                  New Collection
                </span>
                <h3 className="text-2xl lg:text-3xl font-serif font-semibold text-white">
                  2026 Designer Frames
                </h3>
                <p className="text-white/80 text-sm lg:text-base max-w-md">
                  Premium eyewear curated by M&H experts for the discerning customer
                </p>
                <Button 
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground mt-2 shadow-gold"
                >
                  <Link to="/eyewear?filter=new-arrivals">
                    Shop Collection
                    <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {/* Hero product image */}
              <div className="md:col-span-2 relative hidden md:flex items-center justify-center">
                {featuredProduct?.image_url ? (
                  <img 
                    src={featuredProduct.image_url}
                    alt="Featured Frame"
                    className="w-48 h-48 object-contain drop-shadow-2xl animate-float-slow"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="text-white/20 text-6xl">🕶️</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div>
          <div 
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              
              return (
                <Link
                  key={filter.filter}
                  to={`/eyewear?filter=${filter.filter}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-background border-2 border-primary/20 text-sm font-medium text-foreground hover:border-primary hover:bg-primary/5 whitespace-nowrap transition-all duration-200 hover:shadow-sm"
                >
                  <IconComponent weight="duotone" className="w-4 h-4 text-primary" />
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

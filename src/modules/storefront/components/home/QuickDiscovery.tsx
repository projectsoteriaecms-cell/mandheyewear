import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkle,
  TrendUp,
  Tag,
  CurrencyCircleDollar,
  ArrowRight,
  Diamond,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

// Import template frame images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

// Quick filter options - price tiers and discovery
const quickFilters = [
  { label: "Best Sellers", filter: "best-sellers", icon: TrendUp },
  { label: "New Arrivals", filter: "new-arrivals", icon: Sparkle },
  { label: "Budget", filter: "price-tier-budget", icon: Tag },
  { label: "Standard", filter: "price-tier-standard", icon: CurrencyCircleDollar },
  { label: "Premium", filter: "price-tier-premium", icon: Diamond },
  { label: "Luxury", filter: "price-tier-luxury", icon: Sparkle },
];

// Curated showcase frames for the luxury slideshow
const SHOWCASE_FRAMES = [
  { id: 1, src: frame1, name: "Classic Round", style: "Timeless Elegance" },
  { id: 2, src: frame2, name: "Modern Square", style: "Contemporary Edge" },
  { id: 3, src: frame3, name: "Bold Cat-Eye", style: "Statement Maker" },
  { id: 4, src: frame4, name: "Aviator", style: "Iconic Style" },
];

export const QuickDiscovery = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Track current slide
  useEffect(() => {
    if (!carouselApi) return;
    
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Fetch trending products with real images
  const { data: products, isLoading } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, image_url")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .eq("item_type", "frames")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });


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

        {/* Luxurious Promotional Banner */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl min-h-[320px] md:min-h-[400px] bg-gradient-to-br from-[hsl(215_50%_22%)] via-[hsl(218_45%_18%)] to-[hsl(220_40%_15%)]">
            {/* Golden shimmer line at top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            
            {/* Decorative luxury elements */}
            <div className="absolute top-10 right-10 w-40 h-40 bg-accent/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            
            {/* Luxury corner accents */}
            <div className="absolute top-6 right-6 w-16 h-16 border border-accent/20 rounded-lg opacity-40" />
            <div className="absolute bottom-6 left-6 w-10 h-10 border border-white/10 rounded opacity-30" />
            
            {/* Content grid */}
            <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 lg:p-16 h-full min-h-[320px] md:min-h-[400px]">
              {/* Text content */}
              <div className="flex flex-col justify-center space-y-6 z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 text-accent text-xs font-medium tracking-wider uppercase w-fit">
                  <Diamond weight="fill" className="w-4 h-4" />
                  Exclusive Collection
                </span>
                
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-white leading-tight tracking-tight">
                  2026 Designer Frames
                </h3>
                
                <p className="text-white/70 text-base md:text-lg max-w-md font-light leading-relaxed">
                  Curated luxury eyewear from the world's most prestigious houses
                </p>
                
                <Button 
                  asChild
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-base font-medium shadow-lg shadow-accent/30 w-fit group transition-all duration-300 hover:shadow-xl hover:shadow-accent/40"
                >
                  <Link to="/eyewear?filter=new-arrivals">
                    Explore Collection
                    <ArrowRight weight="bold" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              
              {/* Luxury Frames Slideshow */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-full flex flex-col items-center">
                  <Carousel
                    setApi={setCarouselApi}
                    opts={{ loop: true, align: "center" }}
                    plugins={[
                      Autoplay({
                        delay: 4000,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                      }),
                    ]}
                    className="w-full max-w-sm md:max-w-md"
                  >
                    <CarouselContent>
                      {SHOWCASE_FRAMES.map((frame) => (
                        <CarouselItem key={frame.id} className="flex items-center justify-center">
                          <div className="relative">
                            {/* Soft glow behind frame */}
                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl scale-90" />
                            
                            {/* Frame image - large and floating */}
                            <img 
                              src={frame.src}
                              alt={frame.name}
                              className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                            />
                            
                            {/* Style badge below */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                              <span className="text-white/90 text-sm font-medium tracking-widest uppercase">
                                {frame.style}
                              </span>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  
                  {/* Slide indicators */}
                  <div className="flex gap-2 mt-8">
                    {SHOWCASE_FRAMES.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => carouselApi?.scrollTo(index)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          currentSlide === index 
                            ? "bg-accent w-6" 
                            : "bg-white/30 hover:bg-white/50 w-2"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom gold accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
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

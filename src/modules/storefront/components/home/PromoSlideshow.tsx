import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Lightning,
  ArrowRight,
  Fire,
  Tag,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const PromoSlideshow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  // Fetch products with images for the slideshow
  const { data: products } = useQuery({
    queryKey: ["promo-slideshow-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, price, image_url, price_tier, style")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .eq("item_type", "frames")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const items = products || [];
  const totalSlides = items.length;

  const goToNext = useCallback(() => {
    if (isTransitioning || totalSlides === 0) return;
    setDirection("next");
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
      setIsTransitioning(false);
    }, 400);
  }, [isTransitioning, totalSlides]);

  // Auto-rotate every 3.5s
  useEffect(() => {
    if (totalSlides < 2) return;
    const timer = setInterval(goToNext, 3500);
    return () => clearInterval(timer);
  }, [goToNext, totalSlides]);

  if (!items.length) return null;

  const currentItem = items[activeIndex];
  const nextIndex = (activeIndex + 1) % totalSlides;
  const prevIndex = (activeIndex - 1 + totalSlides) % totalSlides;

  // Accent colors per slide for variety
  const accentStyles = [
    "from-flame/20 via-flame/5",
    "from-mh-gold/20 via-mh-gold/5",
    "from-[hsl(280_60%_50%/0.2)] via-[hsl(280_60%_50%/0.05)]",
    "from-[hsl(180_60%_40%/0.2)] via-[hsl(180_60%_40%/0.05)]",
    "from-flame/20 via-flame/5",
    "from-mh-gold/20 via-mh-gold/5",
  ];

  return (
    <section className="py-6 lg:py-10 bg-background overflow-hidden">
      <div className="container px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Fire weight="fill" className="w-5 h-5 text-flame animate-pulse" />
            <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
              Hot Picks
            </h2>
          </div>
          <Link
            to="/eyewear"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            See All
            <ArrowRight weight="bold" className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Main slideshow card */}
        <div className="relative rounded-2xl overflow-hidden bg-ink min-h-[340px] sm:min-h-[380px]">
          {/* Dynamic gradient background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br to-transparent transition-all duration-500",
              accentStyles[activeIndex % accentStyles.length]
            )}
          />

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mh-gold/30 to-transparent" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-mh-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-flame/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full min-h-[340px] sm:min-h-[380px]">
            {/* Product image area — large and bold */}
            <div className="flex-1 flex items-center justify-center pt-6 pb-2 px-4 relative">
              {/* Peek previous */}
              {totalSlides > 2 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 opacity-30 blur-[1px] pointer-events-none">
                  <img
                    src={items[prevIndex]?.image_url || "/placeholder.svg"}
                    alt=""
                    className="w-full h-32 sm:h-40 object-contain"
                  />
                </div>
              )}

              {/* Main product image */}
              <div
                className={cn(
                  "relative transition-all duration-400 ease-out",
                  isTransitioning
                    ? "opacity-0 scale-90 translate-y-4"
                    : "opacity-100 scale-100 translate-y-0"
                )}
              >
                {/* Glow behind product */}
                <div className="absolute inset-0 bg-mh-gold/15 rounded-full blur-3xl scale-110" />

                <img
                  src={currentItem?.image_url || "/placeholder.svg"}
                  alt={currentItem?.name || "Product"}
                  className="relative w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                />

                {/* Price tag badge */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-flame rounded-full shadow-lg shadow-flame/30">
                  <Tag weight="fill" className="w-3.5 h-3.5 text-cream" />
                  <span className="font-display font-extrabold text-cream text-base sm:text-lg">
                    ₦{currentItem?.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Peek next */}
              {totalSlides > 2 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 opacity-30 blur-[1px] pointer-events-none">
                  <img
                    src={items[nextIndex]?.image_url || "/placeholder.svg"}
                    alt=""
                    className="w-full h-32 sm:h-40 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="px-5 pb-3 text-center">
              <p
                className={cn(
                  "font-display font-bold text-lg sm:text-xl text-cream transition-all duration-400",
                  isTransitioning
                    ? "opacity-0 translate-y-3"
                    : "opacity-100 translate-y-0"
                )}
                style={{ transitionDelay: isTransitioning ? "0ms" : "100ms" }}
              >
                {currentItem?.name}
              </p>
              <p
                className={cn(
                  "text-sm text-cream/50 font-body transition-all duration-400",
                  isTransitioning
                    ? "opacity-0 translate-y-3"
                    : "opacity-100 translate-y-0"
                )}
                style={{ transitionDelay: isTransitioning ? "0ms" : "150ms" }}
              >
                {currentItem?.brand || "M&H Eyewear"} • {currentItem?.style || "Classic"}
              </p>
            </div>

            {/* CTA Button */}
            <div className="px-5 pb-4 flex justify-center">
              <Link
                to={`/eyewear/${currentItem?.id}`}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full bg-mh-gold text-ink font-display font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all duration-300 shadow-lg shadow-mh-gold/20 group",
                  isTransitioning
                    ? "opacity-0 scale-90"
                    : "opacity-100 scale-100"
                )}
                style={{ transitionDelay: isTransitioning ? "0ms" : "200ms" }}
              >
                View Frame
                <ArrowRight
                  weight="bold"
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-1.5 pb-4">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index === activeIndex || isTransitioning) return;
                    setDirection(index > activeIndex ? "next" : "prev");
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setActiveIndex(index);
                      setIsTransitioning(false);
                    }, 400);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === index
                      ? "bg-mh-gold w-6"
                      : "bg-cream/25 hover:bg-cream/40 w-1.5"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mh-gold/30 to-transparent" />
        </div>

        {/* Quick thumbnails row below */}
        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                if (i === activeIndex || isTransitioning) return;
                setDirection(i > activeIndex ? "next" : "prev");
                setIsTransitioning(true);
                setTimeout(() => {
                  setActiveIndex(i);
                  setIsTransitioning(false);
                }, 400);
              }}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300",
                activeIndex === i
                  ? "border-mh-gold shadow-lg shadow-mh-gold/20 scale-105"
                  : "border-cream/10 opacity-50 hover:opacity-80"
              )}
            >
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

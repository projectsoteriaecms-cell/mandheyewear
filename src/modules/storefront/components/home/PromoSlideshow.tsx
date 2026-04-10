import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Fire, Tag, Lightning, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SlideshowProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  style: string | null;
  price_tier: string | null;
  discount_percent: number | null;
  discount_label: string | null;
}

/** Filter out invalid storefront products */
const isValidProduct = (p: { name?: string; price?: number; description?: string | null; description_raw?: string | null }) => {
  if (!p.price || p.price <= 0) return false;
  const text = `${p.name || ""} ${p.description || ""} ${p.description_raw || ""}`;
  if (/\[NEEDS?_RESEARCH\]/i.test(text)) return false;
  return true;
};

export const PromoSlideshow = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: slideshowData } = useQuery({
    queryKey: ["promo-slideshow-products"],
    queryFn: async () => {
      const { data: curated, error } = await supabase
        .from("slideshow_items")
        .select("discount_percent, discount_label, product:products(id, name, brand, price, image_url, style, price_tier, description, description_raw)")
        .eq("is_active", true)
        .order("display_order");

      if (!error && curated && curated.length > 0) {
        return curated
          .filter((item: any) => item.product && isValidProduct(item.product))
          .map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            image_url: item.product.image_url,
            style: item.product.style,
            price_tier: item.product.price_tier,
            discount_percent: item.discount_percent,
            discount_label: item.discount_label,
          })) as SlideshowProduct[];
      }

      const { data: fallback } = await supabase
        .from("products")
        .select("id, name, brand, price, image_url, price_tier, style, description, description_raw")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .eq("item_type", "frames")
        .not("image_url", "is", null)
        .gt("price", 0)
        .order("created_at", { ascending: false })
        .limit(12);

      return (fallback || [])
        .filter(isValidProduct)
        .slice(0, 6)
        .map((p) => ({
          ...p,
          discount_percent: null,
          discount_label: null,
        })) as SlideshowProduct[];
    },
  });

  const items = slideshowData || [];
  const totalSlides = items.length;

  const navigate = useCallback(
    (dir: "left" | "right") => {
      if (isAnimating || totalSlides < 2) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) =>
          dir === "right"
            ? (prev + 1) % totalSlides
            : (prev - 1 + totalSlides) % totalSlides
        );
        setIsAnimating(false);
      }, 450);
    },
    [isAnimating, totalSlides]
  );

  useEffect(() => {
    if (totalSlides < 2) return;
    const timer = setInterval(() => navigate("right"), 4000);
    return () => clearInterval(timer);
  }, [navigate, totalSlides]);

  if (!items.length) return null;

  const currentItem = items[activeIndex];
  const hasDiscount = !!currentItem?.discount_percent;
  const discountedPrice = hasDiscount
    ? Math.round(currentItem.price * (1 - currentItem.discount_percent! / 100))
    : currentItem?.price;

  const getVisibleItems = () => {
    if (totalSlides <= 1) return [{ item: currentItem, pos: "center" as const }];
    const prev = (activeIndex - 1 + totalSlides) % totalSlides;
    const next = (activeIndex + 1) % totalSlides;
    return [
      { item: items[prev], pos: "left" as const },
      { item: currentItem, pos: "center" as const },
      { item: items[next], pos: "right" as const },
    ];
  };

  return (
    <section className="py-8 lg:py-14 bg-background overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-flame/15 flex items-center justify-center">
              <Fire weight="fill" className="w-4 h-4 text-flame" />
            </div>
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

        {/* Desktop: 3-card showcase */}
        <div className="relative">
          {/* Navigation arrows — desktop */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={() => navigate("left")}
                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-ink/80 backdrop-blur border border-cream/10 items-center justify-center text-cream hover:bg-ink hover:border-mh-gold/40 hover:scale-110 transition-all shadow-xl"
                aria-label="Previous"
              >
                <CaretLeft weight="bold" className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("right")}
                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-ink/80 backdrop-blur border border-cream/10 items-center justify-center text-cream hover:bg-ink hover:border-mh-gold/40 hover:scale-110 transition-all shadow-xl"
                aria-label="Next"
              >
                <CaretRight weight="bold" className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Cards row */}
          <div className="flex items-center justify-center gap-4 lg:gap-6">
            {getVisibleItems().map(({ item, pos }) => {
              const isCenter = pos === "center";
              const itemDiscount = isCenter ? hasDiscount : false;
              const itemDiscountedPrice = isCenter ? discountedPrice : item?.price;

              return (
                <div
                  key={`${item.id}-${pos}`}
                  className={cn(
                    "relative rounded-2xl overflow-hidden transition-all duration-500 ease-out",
                    isCenter
                      ? "w-full lg:w-[420px] lg:min-h-[420px] z-20 scale-100"
                      : "hidden lg:block w-[280px] min-h-[380px] z-10 scale-[0.92] opacity-60",
                    isAnimating && isCenter && direction === "right" && "animate-slide-in-right",
                    isAnimating && isCenter && direction === "left" && "animate-slide-in-left"
                  )}
                >
                  {/* Card bg */}
                  <div className="absolute inset-0 bg-ink" />
                  <div className={cn(
                    "absolute inset-0 opacity-40",
                    isCenter
                      ? "bg-[radial-gradient(ellipse_at_top,hsl(var(--mh-gold)/0.15),transparent_70%)]"
                      : "bg-[radial-gradient(ellipse_at_top,hsl(var(--mh-gold)/0.08),transparent_70%)]"
                  )} />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mh-gold/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream/10 to-transparent" />

                  {/* Badges — center only */}
                  {isCenter && currentItem?.discount_label && (
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-flame text-cream font-display font-bold text-[11px] uppercase tracking-wider shadow-lg">
                      <Lightning weight="fill" className="w-3 h-3 inline mr-1" />
                      {currentItem.discount_label}
                    </div>
                  )}
                  {isCenter && hasDiscount && (
                    <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-mh-gold text-ink font-display font-extrabold text-[11px] shadow-lg">
                      {currentItem.discount_percent}% OFF
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full p-5">
                    {/* Product image */}
                    <div className="flex-1 flex items-center justify-center py-6 relative">
                      {/* Glow behind product */}
                      <div className={cn(
                        "absolute w-40 h-40 rounded-full blur-3xl",
                        isCenter ? "bg-mh-gold/12" : "bg-mh-gold/6"
                      )} />
                      <img
                        src={item?.image_url || "/placeholder.svg"}
                        alt={item?.name || "Product"}
                        className={cn(
                          "relative object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-transform duration-500",
                          isCenter
                            ? "w-52 h-52 sm:w-60 sm:h-60 hover:scale-105"
                            : "w-36 h-36"
                        )}
                      />
                    </div>

                    {/* Product info */}
                    <div className={cn("text-center space-y-2", !isCenter && "opacity-70")}>
                      <p className={cn(
                        "font-display font-bold text-cream truncate",
                        isCenter ? "text-lg" : "text-sm"
                      )}>
                        {item?.name}
                      </p>
                      {isCenter && (
                        <p className="text-xs text-cream/45 font-body">
                          {item?.brand || "M&H Eyewear"} • {item?.style || "Classic"}
                        </p>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2">
                        <Tag weight="fill" className={cn("text-mh-gold", isCenter ? "w-3.5 h-3.5" : "w-3 h-3")} />
                        {itemDiscount ? (
                          <>
                            <span className="font-display text-cream/40 text-xs line-through">
                              ₦{item?.price?.toLocaleString()}
                            </span>
                            <span className={cn(
                              "font-display font-extrabold text-mh-gold",
                              isCenter ? "text-lg" : "text-sm"
                            )}>
                              ₦{itemDiscountedPrice?.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className={cn(
                            "font-display font-extrabold text-mh-gold",
                            isCenter ? "text-lg" : "text-sm"
                          )}>
                            ₦{item?.price?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* CTA — center only */}
                      {isCenter && (
                        <div className="pt-2">
                          <Link
                            to={`/eyewear/${item?.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mh-gold text-ink font-display font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all duration-300 shadow-lg shadow-mh-gold/20 group"
                          >
                            View Frame
                            <ArrowRight weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide progress bar */}
          <div className="flex justify-center gap-1.5 mt-5">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index === activeIndex || isAnimating) return;
                  setDirection(index > activeIndex ? "right" : "left");
                  setIsAnimating(true);
                  setTimeout(() => {
                    setActiveIndex(index);
                    setIsAnimating(false);
                  }, 450);
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-400",
                  activeIndex === index
                    ? "bg-mh-gold w-8"
                    : "bg-foreground/15 hover:bg-foreground/30 w-1.5"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile swipe hint */}
          <div className="lg:hidden flex justify-center gap-3 mt-3">
            <button
              onClick={() => navigate("left")}
              className="w-9 h-9 rounded-full bg-ink/60 border border-cream/10 flex items-center justify-center text-cream/60 active:scale-95 transition-all"
              aria-label="Previous"
            >
              <CaretLeft weight="bold" className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("right")}
              className="w-9 h-9 rounded-full bg-ink/60 border border-cream/10 flex items-center justify-center text-cream/60 active:scale-95 transition-all"
              aria-label="Next"
            >
              <CaretRight weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

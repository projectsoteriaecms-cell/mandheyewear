import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Tag, Lightning } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroEyewear from "@/assets/hero-eyewear.jpg";

/** Static glasses image for the "OO" in outlook */
const GlassesOO = ({ src, className = "" }: { src: string; className?: string }) => (
  <span className={`relative inline-flex items-center align-middle ${className}`}>
    {/* Left lens */}
    <span className="relative w-[0.45em] h-[0.45em] rounded-full overflow-hidden border-2 border-mh-gold/50 shadow-lg">
      <img src={src} alt="Left lens" className="absolute inset-0 w-full h-full object-cover" />
    </span>
    {/* Bridge */}
    <span className="w-[0.08em] h-[0.04em] bg-mh-gold/50 -mx-px" />
    {/* Right lens */}
    <span className="relative w-[0.45em] h-[0.45em] rounded-full overflow-hidden border-2 border-mh-gold/50 shadow-lg">
      <img src={src} alt="Right lens" className="absolute inset-0 w-full h-full object-cover" />
    </span>
  </span>
);

/** Countdown timer hook — counts down to end of day */
const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);

interface PromoBanner {
  id: string;
  title_line1: string;
  title_line2: string;
  date_label: string;
  description: string;
  discount_prefix: string;
  discount_value: string;
  disclaimer: string;
  featured_product_ids: string[];
}

const defaultBanner: PromoBanner = {
  id: "",
  title_line1: "New Season",
  title_line2: "Collection",
  date_label: "April 2026 Drop",
  description: "Every frame you love — now with a fresh new twist. Explore our latest arrivals before they are gone.",
  discount_prefix: "Up to",
  discount_value: "20% OFF",
  disclaimer: "T&Cs apply • Limited time offer",
  featured_product_ids: [],
};

interface SlideshowProduct {
  discount_percent: number | null;
  discount_label: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    brand: string | null;
  };
}

export const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const countdown = useCountdown();

  // Fetch active promo banner
  const { data: banner } = useQuery({
    queryKey: ["active-promo-banner"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error || !data) return defaultBanner;
      return {
        id: data.id,
        title_line1: data.title_line1 || defaultBanner.title_line1,
        title_line2: data.title_line2 || defaultBanner.title_line2,
        date_label: data.date_label || defaultBanner.date_label,
        description: data.description || defaultBanner.description,
        discount_prefix: data.discount_prefix || defaultBanner.discount_prefix,
        discount_value: data.discount_value || defaultBanner.discount_value,
        disclaimer: data.disclaimer || defaultBanner.disclaimer,
        featured_product_ids: (data.featured_product_ids || []) as string[],
      } as PromoBanner;
    },
    staleTime: 60_000,
  });

  const activeBanner = banner || defaultBanner;

  const { data: slideshowItems } = useQuery({
    queryKey: ["hero-flash-deals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("slideshow_items")
        .select("discount_percent, discount_label, product:products(id, name, price, image_url, brand)")
        .eq("is_active", true)
        .order("display_order")
        .limit(6);
      return (data || []).filter((d: any) => d.product) as SlideshowProduct[];
    },
    staleTime: 60_000,
  });

  // Fallback: fetch newest products when no curated slideshow items exist
  const { data: fallbackProducts } = useQuery({
    queryKey: ["hero-flash-deals-fallback"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url, brand")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("image_url", "is", null)
        .gt("price", 0)
        .order("created_at", { ascending: false })
        .limit(6);
      return (data || []).map((p) => ({
        discount_percent: null,
        discount_label: "NEW",
        product: p,
      })) as SlideshowProduct[];
    },
    staleTime: 60_000,
    enabled: !slideshowItems || slideshowItems.length === 0,
  });

  // Static image for OO
  const ooImage = heroEyewear;

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const filterPlaceholders = (items: any[]) =>
    items.filter((item) => {
      const p = item.product || item;
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      return !name.includes('needs_research') && !name.includes('[needs') && !brand.includes('needs_research') && !brand.includes('[needs');
    });
  const hasCurated = (slideshowItems || []).length > 0;
  const flashDeals = filterPlaceholders(hasCurated ? slideshowItems! : (fallbackProducts || []));
  const stripLabel = hasCurated ? "Flash Deals" : "✨ New Arrivals";

  return (
    <section className="section-ink-grain relative overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background breathing glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] rounded-full bg-mh-gold/8 blur-[80px] sm:blur-[120px] transition-all duration-[2000ms] ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        />
        <div
          className={`absolute top-0 right-0 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] rounded-full bg-mh-gold/5 blur-[60px] sm:blur-[100px] animate-breathe transition-all duration-[2000ms] ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "2s", transitionDelay: "300ms" }}
        />
        <div
          className={`absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] rounded-full bg-flame/5 blur-[60px] sm:blur-[100px] animate-breathe transition-all duration-[2000ms] ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ animationDelay: "4s", transitionDelay: "600ms" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 pb-24 lg:pb-16 relative z-10 w-full">
        {/* Top tags */}
        <div
          className={`flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 transition-all duration-700 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="font-display font-bold text-[10px] sm:text-xs tracking-[0.3em] uppercase text-cream/30">/Eyewear</span>
          <span className="w-px h-4 bg-cream/15" />
          <span className="font-display font-bold text-[10px] sm:text-xs tracking-[0.3em] uppercase text-cream/30">/Eye Care</span>
        </div>

        {/* === Two-column grid: text left, product image right === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center mb-4 sm:mb-10">
          {/* Left column — headline + subtext + CTAs */}
          <div>
            {/* Reduced headline */}
            <div className="relative mb-6 sm:mb-8">
              <h1 className="font-display font-extrabold text-[clamp(2rem,6.5vw,5.5rem)] leading-[0.92] tracking-tight text-cream">
                {["A", "clearer"].map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden">
                    <span
                      className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                      style={{
                        transitionDelay: `${400 + i * 120}ms`,
                        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {word}{" "}
                    </span>
                  </span>
                ))}
                <div className="h-2 sm:h-4" />
                {["OUTLOOK", "   on", "life"].map((word, i) => (
                  <span key={`b-${i}`} className="inline-block overflow-hidden">
                    <span
                      className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                      style={{
                        transitionDelay: `${640 + i * 120}ms`,
                        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {word === "OUTLOOK" ? (
                        <span className="text-mh-gold">
                          outl
                          <GlassesOO
                            src={ooImage}
                            className="mx-0.5 sm:mx-1 w-[0.9em] sm:w-[1.1em] h-[0.55em] sm:h-[0.6em]"
                          />
                          k{" "}
                        </span>
                      ) : word === "life" ? (
                        <span className="italic font-semibold text-cream/60">{word}<span className="text-mh-gold">.</span></span>
                      ) : (
                        <>{word} </>
                      )}
                    </span>
                  </span>
                ))}
              </h1>
            </div>

            {/* Subtext */}
            <div
              className={`max-w-md space-y-4 sm:space-y-5 transition-all duration-[800ms] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: "1000ms" }}
            >
              <div className="relative pl-4 sm:pl-5 border-l-2 border-mh-gold/40">
                <p className="font-display font-bold text-base sm:text-lg leading-snug text-cream tracking-tight">
                  For those who see the future<br className="hidden sm:block" /> before it arrives.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-cream/[0.06] backdrop-blur-md border border-cream/10 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                <span className="w-1.5 h-1.5 rounded-full bg-mh-gold animate-pulse" />
                <span className="font-display font-semibold text-xs sm:text-sm text-cream/90 tracking-wide">
                  Clarity without compromise
                </span>
              </div>

              {/* Mobile/Tablet hero image — between pill and CTAs */}
              <div className="lg:hidden flex justify-center my-4">
                <div className="relative w-full max-w-[320px] md:max-w-[380px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-mh-gold/20 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
                  <img
                    src={heroEyewear}
                    alt="Featured eyewear"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Link
                  to="/eyewear"
                  className={`group inline-flex items-center justify-center gap-3 px-5 sm:px-7 py-3.5 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase whitespace-nowrap hover:scale-105 hover:shadow-glow-accent transition-all duration-300 shadow-gold w-full sm:w-auto ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  style={{ transitionDelay: "1300ms" }}
                >
                  Shop Collection
                  <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/booking"
                  className={`group inline-flex items-center justify-center gap-3 px-5 sm:px-7 py-3.5 rounded-full bg-flame text-cream font-display font-bold text-sm tracking-wide uppercase whitespace-nowrap hover:scale-105 transition-all duration-300 shadow-flame w-full sm:w-auto ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                  style={{ transitionDelay: "1450ms" }}
                >
                  Book Eye Exam
                  <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column — large hero product image (desktop only) */}
          <div
            className={`hidden lg:flex relative items-center justify-center transition-all duration-[1000ms] ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            style={{ transitionDelay: "800ms" }}
          >
            <div className="relative w-full lg:max-w-[420px] aspect-[4/3] rounded-3xl overflow-hidden border-2 border-mh-gold/20 shadow-[0_0_60px_rgba(212,175,55,0.15)] mx-auto">
              <img
                src={heroEyewear}
                alt="Featured eyewear"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* === Unified Promo + Products Strip === */}
        {flashDeals.length > 0 && (
          <div
            className={`transition-all duration-[900ms] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "1400ms" }}
          >
            {/* Header bar — banner info + countdown merged */}
            <div className="flex items-center justify-between bg-flame rounded-t-xl px-4 sm:px-6 py-2.5 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <Lightning weight="fill" className="w-5 h-5 text-cream animate-pulse" />
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-display font-extrabold text-cream text-sm sm:text-base uppercase tracking-wide">
                    {stripLabel}
                  </span>
                  {activeBanner.discount_value && (
                    <>
                      <span className="w-px h-4 bg-cream/30 hidden sm:block" />
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cream/15 backdrop-blur-sm rounded-full">
                        <Tag weight="fill" className="w-3 h-3 text-cream" />
                        <span className="font-display font-bold text-[10px] text-cream/90 uppercase tracking-wide">{activeBanner.discount_prefix}</span>
                        <span className="font-display font-extrabold text-sm text-cream">{activeBanner.discount_value}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {hasCurated && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-cream/80 text-xs font-display tracking-wide hidden sm:inline">Ends in:</span>
                    {[pad(countdown.hours), pad(countdown.minutes), pad(countdown.seconds)].map((val, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="bg-ink/60 text-cream font-display font-bold text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          {val}
                        </span>
                        {i < 2 && <span className="text-cream/60 font-bold text-xs">:</span>}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to="/eyewear"
                  className="text-cream/90 font-display font-bold text-xs sm:text-sm hover:text-cream transition-colors flex items-center gap-1"
                >
                  See All <ArrowRight weight="bold" className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Banner info row */}
            <div className="bg-ink-light border-x border-cream/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-mh-gold/30 rounded-lg flex-shrink-0">
                  <span className="font-display font-bold text-[10px] sm:text-xs text-mh-gold tracking-wider uppercase">{activeBanner.date_label}</span>
                </div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-cream uppercase tracking-tight truncate">
                  {activeBanner.title_line1} <span className="text-mh-gold">{activeBanner.title_line2}</span>
                </h3>
              </div>
              {/* Mobile discount pill */}
              {activeBanner.discount_value && (
                <div className="sm:hidden flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-cream/[0.06] rounded-full border border-cream/10">
                  <Tag weight="fill" className="w-3 h-3 text-flame" />
                  <span className="font-display font-extrabold text-xs text-flame">{activeBanner.discount_value}</span>
                </div>
              )}
            </div>

            {/* Full-width scrolling pun ticker */}
            <div className="overflow-hidden relative bg-ink-light/80 border-t border-b border-cream/5 py-2.5 sm:py-3">
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-light to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-light to-transparent z-10 pointer-events-none" />
              <div className="flex ticker-track whitespace-nowrap gap-8 sm:gap-10">
                {[
                  "Eye no dey lie — your frames speak first 👓",
                  "Na style wey dey see road ✨",
                  "Sharp eyes. Sharper style.",
                  "Frames as loud as your ambition, silent as true luxury.",
                  "Your outlook is your signature — sign boldly.",
                  "See the future before it arrives 🔮",
                  "Big vision. Bigger frames. Biggest energy.",
                  "Clarity is the new flex.",
                  "Soft life starts with sharp sight 🌿",
                  "No dull moment when the frames are right.",
                  "Who dey see pass you? Nobody. 💎",
                  "Glass na crown — wear am like king.",
                  "Them go adjust when clarity enter room.",
                  "Style no be noise, na frequency.",
                  "One frame, many compliments — that's the soft life.",
                  "Better vision, better decisions.",
                  "E no be every eye wey fit see levels.",
                  "Your face, your billboard — advertise well. 🏆",
                  "When you see clear, fear no fit hold you.",
                  "Na who dey look sharp dey collect sharp things.",
                  "Luxury wey your eyes deserve.",
                  "Outlook dey different when the lens dey right.",
                  "No be swag — na standard. 🔥",
                  "If your vision no clear, your moves go blur.",
                  "Wear your confidence — literally.",
                  "Good frames don't ask for attention, they command it.",
                  "Eye no dey lie — your frames speak first 👓",
                  "Na style wey dey see road ✨",
                  "Sharp eyes. Sharper style.",
                  "Frames as loud as your ambition, silent as true luxury.",
                  "Your outlook is your signature — sign boldly.",
                  "See the future before it arrives 🔮",
                  "Big vision. Bigger frames. Biggest energy.",
                  "Clarity is the new flex.",
                  "Soft life starts with sharp sight 🌿",
                  "No dull moment when the frames are right.",
                  "Who dey see pass you? Nobody. 💎",
                  "Glass na crown — wear am like king.",
                  "Them go adjust when clarity enter room.",
                  "Style no be noise, na frequency.",
                  "One frame, many compliments — that's the soft life.",
                  "Better vision, better decisions.",
                  "E no be every eye wey fit see levels.",
                  "Your face, your billboard — advertise well. 🏆",
                  "When you see clear, fear no fit hold you.",
                  "Na who dey look sharp dey collect sharp things.",
                  "Luxury wey your eyes deserve.",
                  "Outlook dey different when the lens dey right.",
                  "No be swag — na standard. 🔥",
                  "If your vision no clear, your moves go blur.",
                  "Wear your confidence — literally.",
                  "Good frames don't ask for attention, they command it.",
                ].map((quote, i) => (
                  <span key={i} className="text-cream/60 text-sm sm:text-base font-display tracking-wide flex-shrink-0">
                    {quote}
                    <span className="text-mh-gold/30 ml-8 sm:ml-10">✦</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Endless product row */}
            <div className="bg-ink-light border border-cream/5 border-t-0 rounded-b-xl overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink-light to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-light to-transparent z-10 pointer-events-none" />
              <div className="flex product-ticker gap-0">
                {[...flashDeals, ...flashDeals].map((item, idx) => {
                  const product = item.product;
                  const hasDiscount = item.discount_percent && item.discount_percent > 0;
                  const discountedPrice = hasDiscount
                    ? product.price * (1 - (item.discount_percent! / 100))
                    : product.price;

                  return (
                    <Link
                      key={`${product.id}-${idx}`}
                      to={`/eyewear/${product.id}`}
                      className="flex-shrink-0 w-[140px] sm:w-[170px] p-3 sm:p-4 border-r border-cream/5 last:border-r-0 hover:bg-cream/[0.03] transition-colors group"
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-cream/5" />
                        )}
                        {hasDiscount && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-flame rounded text-[10px] font-display font-bold text-cream">
                            -{item.discount_percent}%
                          </div>
                        )}
                        {item.discount_label && (
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-mh-gold/90 rounded text-[9px] font-display font-bold text-ink uppercase">
                            {item.discount_label}
                          </div>
                        )}
                      </div>
                      <p className="text-cream/80 text-xs font-display font-semibold truncate">{product.name}</p>
                      {product.brand && (
                        <p className="text-cream/40 text-[10px] font-display truncate">{product.brand}</p>
                      )}
                      <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-display font-extrabold text-sm text-flame">
                          {formatPrice(discountedPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="font-display text-[10px] text-cream/40 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "2200ms" }}
      >
        <span className="text-xs font-display tracking-[0.2em] uppercase text-cream/30">Scroll</span>
        <ArrowDown weight="bold" className="w-4 h-4 text-cream/30 animate-float-gentle" />
      </div>
    </section>
  );
};

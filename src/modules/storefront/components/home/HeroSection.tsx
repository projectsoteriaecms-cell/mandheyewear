import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Tag } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountUp } from "@/shared/hooks/useCountUp";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const staticFallbacks = [heroEyewear, frame1, frame2, frame3, frame4];

/** Inline SVG twin-lens "OO" glyph — two connected circles like spectacle lenses */
const TwinLensSVG = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 52 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block align-middle lens-shimmer ${className}`}
    style={{ width: "1.1em", height: "0.55em" }}
  >
    <circle cx="13" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
    <circle cx="39" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
    <path d="M23 12 Q26 7 29 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

/** Stable pill container with crossfading images — no container movement */
const FrameSlot = ({
  currentSrc,
  nextSrc,
  fading,
  className,
  alt,
}: {
  currentSrc: string;
  nextSrc: string;
  fading: boolean;
  className?: string;
  alt: string;
}) => (
  <span className={`relative inline-block align-middle overflow-hidden rounded-full border-2 border-mh-gold/20 shadow-lg ${className}`}>
    <img
      src={currentSrc}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
    />
    <img
      src={nextSrc}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${fading ? "opacity-100" : "opacity-0"}`}
    />
  </span>
);

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

export const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Fetch featured product images
  const { data: featuredImages } = useQuery({
    queryKey: ["promo-featured-images", activeBanner.featured_product_ids],
    queryFn: async () => {
      if (!activeBanner.featured_product_ids.length) return [];
      const { data } = await supabase
        .from("products")
        .select("id, image_url, name")
        .in("id", activeBanner.featured_product_ids);
      // Preserve the order from featured_product_ids
      const map = new Map((data || []).map((p) => [p.id, p]));
      return activeBanner.featured_product_ids
        .map((id) => map.get(id))
        .filter(Boolean) as { id: string; image_url: string | null; name: string }[];
    },
    enabled: activeBanner.featured_product_ids.length > 0,
    staleTime: 60_000,
  });

  // Build featured frame images for the promo card (static, non-rotating)
  const promoFrameImages = useMemo(() => {
    const dbImages = (featuredImages || [])
      .filter((p) => p.image_url)
      .map((p) => ({ src: p.image_url!, alt: p.name }));
    if (dbImages.length >= 3) return dbImages.slice(0, 4);
    // Fill with static fallbacks
    const fallbacks = [
      { src: frame2, alt: "Frame" },
      { src: frame3, alt: "Frame" },
      { src: frame4, alt: "Frame" },
    ];
    return [...dbImages, ...fallbacks].slice(0, 3);
  }, [featuredImages]);

  // Fetch real product images for hero carousel
  const { data: productImages } = useQuery({
    queryKey: ["hero-frame-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("image_url")
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .eq("item_type", "frames")
        .not("image_url", "is", null)
        .neq("image_url", "")
        .limit(20);
      return (data || []).map((p) => p.image_url).filter(Boolean) as string[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build the master frames array: DB images first, then static fallbacks (capped at 20)
  const allFrames = useMemo(() => {
    const dbImages = productImages || [];
    if (dbImages.length >= 4) return dbImages.slice(0, 20);
    const merged = [...dbImages, ...staticFallbacks];
    const unique = Array.from(new Set(merged));
    return unique.slice(0, 20);
  }, [productImages]);

  // Carousel state
  const [img1Index, setImg1Index] = useState(0);
  const [img2Index, setImg2Index] = useState(1);
  const [next1Index, setNext1Index] = useState(0);
  const [next2Index, setNext2Index] = useState(1);
  const [fading1, setFading1] = useState(false);
  const [fading2, setFading2] = useState(false);

  const img1Ref = useRef(img1Index);
  const img2Ref = useRef(img2Index);
  img1Ref.current = img1Index;
  img2Ref.current = img2Index;

  const getNextIndex = useCallback(
    (current: number, otherSlot: number) => {
      if (allFrames.length <= 2) return (current + 1) % allFrames.length;
      let next = (current + 1) % allFrames.length;
      if (next === otherSlot) next = (next + 1) % allFrames.length;
      return next;
    },
    [allFrames.length]
  );

  const stat1 = useCountUp({ end: 50, suffix: "K+" });
  const stat2 = useCountUp({ end: 5, suffix: "+" });
  const stat3 = useCountUp({ end: 2800, suffix: "+" });

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Slot 1 rotation
  useEffect(() => {
    if (!loaded || allFrames.length < 2) return;
    const interval = setInterval(() => {
      const nextIdx = getNextIndex(img1Ref.current, img2Ref.current);
      setNext1Index(nextIdx);
      setFading1(true);
      setTimeout(() => {
        setImg1Index(nextIdx);
        setFading1(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [loaded, allFrames.length, getNextIndex]);

  // Slot 2 rotation (offset by 2.5s)
  useEffect(() => {
    if (!loaded || allFrames.length < 2) return;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        const nextIdx = getNextIndex(img2Ref.current, img1Ref.current);
        setNext2Index(nextIdx);
        setFading2(true);
        setTimeout(() => {
          setImg2Index(nextIdx);
          setFading2(false);
        }, 500);
      }, 5000);
      return () => clearInterval(interval);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [loaded, allFrames.length, getNextIndex]);

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
          className={`flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10 transition-all duration-700 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className="font-display font-bold text-[10px] sm:text-xs tracking-[0.3em] uppercase text-cream/30">/Eyewear</span>
          <span className="w-px h-4 bg-cream/15" />
          <span className="font-display font-bold text-[10px] sm:text-xs tracking-[0.3em] uppercase text-cream/30">/Eye Care</span>
        </div>

        {/* Giant typographic headline */}
        <div className="relative mb-8 sm:mb-12">
          <h1 className="font-display font-extrabold text-[clamp(2.2rem,9vw,8rem)] leading-[0.88] tracking-tight text-cream">
            {["A", "clearer", "IMG1"].map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span
                  className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{
                    transitionDelay: `${400 + i * 120}ms`,
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {word === "IMG1" ? (
                    <FrameSlot
                      currentSrc={allFrames[img1Index] || staticFallbacks[0]}
                      nextSrc={allFrames[next1Index] || staticFallbacks[0]}
                      fading={fading1}
                      className="mx-1 sm:mx-2 w-[1.2em] sm:w-[1.6em] h-[0.6em] sm:h-[0.7em]"
                      alt="Eyewear frame"
                    />
                  ) : (
                    <>{word} </>
                  )}
                </span>
              </span>
            ))}
            <br />
            {["OUTLOOK", "IMG2", "on", "life"].map((word, i) => (
              <span key={`b-${i}`} className="inline-block overflow-hidden">
                <span
                  className={`inline-block transition-all duration-[800ms] ${loaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
                  style={{
                    transitionDelay: `${760 + i * 120}ms`,
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {word === "OUTLOOK" ? (
                    <span className="text-mh-gold">
                      outl<TwinLensSVG />k{" "}
                    </span>
                  ) : word === "IMG2" ? (
                    <FrameSlot
                      currentSrc={allFrames[img2Index] || staticFallbacks[1]}
                      nextSrc={allFrames[next2Index] || staticFallbacks[1]}
                      fading={fading2}
                      className="mx-1 sm:mx-2 w-[1.0em] sm:w-[1.4em] h-[0.6em] sm:h-[0.7em]"
                      alt="Eyewear frame"
                    />
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

        {/* Promo banner — dynamic from database */}
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-ink-light mb-8 sm:mb-12 border border-cream/5 transition-all duration-[900ms] ${loaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.95]"}`}
          style={{
            transitionDelay: "1200ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-cream/5 to-transparent" style={{ animationDelay: "1.8s" }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] items-center min-h-[180px] lg:min-h-[240px]">
            <div className="p-5 sm:p-8 lg:p-10 space-y-2 sm:space-y-3">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-5xl text-cream leading-[1.05] uppercase">
                {activeBanner.title_line1}<br />
                <span className="text-mh-gold">{activeBanner.title_line2}</span>
              </h2>
              <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 border-2 border-dashed border-mh-gold/50 rounded-lg">
                <span className="font-display font-bold text-xs sm:text-sm text-mh-gold tracking-wide">{activeBanner.date_label}</span>
              </div>
            </div>

            <div className="px-5 sm:px-8 lg:px-4 pb-5 sm:pb-6 lg:pb-0 space-y-2 sm:space-y-3">
              <p className="text-cream/70 text-base sm:text-lg font-body">{activeBanner.description}</p>
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-cream rounded-full">
                <Tag weight="fill" className="w-4 h-4 sm:w-5 sm:h-5 text-flame" />
                <span className="font-display font-extrabold text-ink text-xs sm:text-sm uppercase tracking-wider">{activeBanner.discount_prefix}</span>
                <span className="font-display font-extrabold text-flame text-2xl sm:text-3xl">{activeBanner.discount_value}</span>
              </div>
              <p className="text-cream/40 text-xs">{activeBanner.disclaimer}</p>
            </div>

            {/* Featured frames — desktop: staggered column, mobile: horizontal row */}
            <div className="flex lg:flex-col items-center justify-center gap-3 px-5 pb-5 lg:px-6 lg:pb-0 relative lg:h-full">
              <div className="flex lg:flex-col items-end justify-center gap-2 lg:gap-0 lg:relative lg:w-[260px] lg:h-[220px]">
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-mh-gold/20 to-transparent rounded-t-3xl" />
                {promoFrameImages.map((img, i) => {
                  const desktopPositions = [
                    "lg:absolute lg:bottom-0 lg:left-0 lg:rotate-[-6deg]",
                    "lg:absolute lg:bottom-4 lg:left-1/2 lg:-translate-x-1/2 lg:z-10",
                    "lg:absolute lg:bottom-0 lg:right-0 lg:rotate-[6deg]",
                    "lg:absolute lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 lg:z-20",
                  ];
                  return (
                    <img
                      key={i}
                      src={img.src}
                      alt={img.alt}
                      className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 object-cover rounded-xl shadow-lg border-2 border-mh-gold/15 ${
                        i === 1 ? "lg:w-32 lg:h-32 lg:shadow-xl" : ""
                      } ${desktopPositions[i] || desktopPositions[2]}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Subtext + Stats + CTAs */}
        <div
          className={`flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 sm:gap-10 transition-all duration-[800ms] ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          style={{
            transitionDelay: "1500ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            transform: loaded ? "perspective(1000px) rotateX(0deg)" : "perspective(1000px) rotateX(8deg)",
          }}
        >
          <div className="max-w-md space-y-5 sm:space-y-7">
            <div className="relative pl-4 sm:pl-5 border-l-2 border-mh-gold/40">
              <p className="font-display font-bold text-lg sm:text-xl leading-snug text-cream tracking-tight">
                For those who see the future<br className="hidden sm:block" /> before it arrives.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-cream/[0.06] backdrop-blur-md border border-cream/10 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
              <span className="w-1.5 h-1.5 rounded-full bg-mh-gold animate-pulse" />
              <span className="font-display font-semibold text-sm sm:text-base text-cream/90 tracking-wide">
                Clarity without compromise
              </span>
              <span className="text-cream/30 font-light">—</span>
              <span className="font-body text-sm sm:text-base text-cream/60 italic">
                your world, in HD
              </span>
            </div>

            <p className="text-cream/50 text-sm sm:text-base leading-relaxed font-body tracking-wide max-w-sm">
              A new <span className="font-display font-bold text-mh-gold italic">frame</span> of mind. Your outlook should be as loud as your ambition,<br className="hidden sm:block" />
              <span className="text-cream/70 font-display font-semibold">but as silent as true luxury.</span>
            </p>
            <div className="flex items-center gap-4 sm:gap-8" ref={statsRef}>
              <div>
                <p className="font-display font-extrabold text-xl sm:text-2xl text-cream" ref={stat1.ref as React.RefObject<HTMLParagraphElement>}>{stat1.displayValue}</p>
                <p className="text-[10px] sm:text-xs text-cream/40 uppercase tracking-wider font-display">Happy Customers</p>
              </div>
              <div className="w-px h-8 sm:h-10 bg-cream/10" />
              <div>
                <p className="font-display font-extrabold text-xl sm:text-2xl text-cream" ref={stat2.ref as React.RefObject<HTMLParagraphElement>}>{stat2.displayValue}</p>
                <p className="text-[10px] sm:text-xs text-cream/40 uppercase tracking-wider font-display">Locations</p>
              </div>
              <div className="w-px h-8 sm:h-10 bg-cream/10" />
              <div>
                <p className="font-display font-extrabold text-xl sm:text-2xl text-cream" ref={stat3.ref as React.RefObject<HTMLParagraphElement>}>{stat3.displayValue}</p>
                <p className="text-[10px] sm:text-xs text-cream/40 uppercase tracking-wider font-display">Frames</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              to="/eyewear"
              className={`group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase hover:scale-105 hover:shadow-glow-accent transition-all duration-300 shadow-gold w-full sm:w-auto ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                transitionDelay: "1800ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Shop Collection
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/booking"
              className={`group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-flame text-cream font-display font-bold text-sm tracking-wide uppercase hover:scale-105 transition-all duration-300 shadow-flame w-full sm:w-auto ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              style={{
                transitionDelay: "1950ms",
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              Book Eye Exam
              <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
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

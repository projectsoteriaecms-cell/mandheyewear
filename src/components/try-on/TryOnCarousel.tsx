import { useRef, useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  angle: string;
  label: string;
  url?: string;
  loading: boolean;
}

interface TryOnCarouselProps {
  slides: CarouselSlide[];
  className?: string;
  aspectRatio?: string;
}

export const TryOnCarousel = ({
  slides,
  className,
  aspectRatio = "aspect-[3/4]",
}: TryOnCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter to only slides that have content or are loading
  const visibleSlides = slides.filter((s) => s.url || s.loading);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const slideWidth = el.offsetWidth;
      el.scrollTo({ left: slideWidth * index, behavior: "smooth" });
      setActiveIndex(index);
    },
    []
  );

  // Track scroll position to update active dot
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const slideWidth = el.offsetWidth;
      if (slideWidth === 0) return;
      const idx = Math.round(el.scrollLeft / slideWidth);
      setActiveIndex(idx);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // When a new slide appears (loading→loaded), auto-stay on current
  const goLeft = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const goRight = () =>
    scrollToIndex(Math.min(visibleSlides.length - 1, activeIndex + 1));

  if (visibleSlides.length === 0) return null;

  return (
    <div className={cn("relative group", className)}>
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-lg",
          aspectRatio
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleSlides.map((slide, i) => (
          <div
            key={slide.angle}
            className="flex-none w-full h-full snap-center relative bg-secondary flex items-center justify-center"
          >
            {slide.loading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm font-medium">
                  Generating {slide.label}...
                </p>
              </div>
            ) : slide.url ? (
              <img
                src={slide.url}
                alt={`Try-on ${slide.label} view`}
                className="w-full h-full object-contain"
              />
            ) : null}

            {/* Angle label */}
            {(slide.url || slide.loading) && (
              <Badge
                variant="secondary"
                className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs"
              >
                {slide.label}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows (only when multiple slides) */}
      {visibleSlides.length > 1 && (
        <>
          <button
            onClick={goLeft}
            disabled={activeIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={goRight}
            disabled={activeIndex === visibleSlides.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {visibleSlides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {visibleSlides.map((slide, i) => (
            <button
              key={slide.angle}
              onClick={() => scrollToIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i === activeIndex
                  ? "bg-accent w-4"
                  : "bg-foreground/30 hover:bg-foreground/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

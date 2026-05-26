import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { getDisplayImages } from "@/modules/products/lib/image-utils";

interface ProductImageCarouselProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  /** "pdp" = full page, "quickview" = dialog/sheet */
  variant?: "pdp" | "quickview";
  className?: string;
}

export const ProductImageCarousel = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
  className,
}: ProductImageCarouselProps) => {
  const images = getDisplayImages({ image_url: mainImage, additional_images: additionalImages });
  const hasImages = images.length > 0;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const autoplayPlugin = useCallback(
    () => Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false },
    [autoplayPlugin()]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  // Desktop hover-zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  if (!hasImages) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="aspect-[4/5] rounded-lg overflow-hidden bg-secondary flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="h-16 w-16 mb-3 opacity-50" />
          <p className="text-sm font-medium">No images available</p>
        </div>
      </div>
    );
  }

  const isPdp = variant === "pdp";
  const aspectClass = "aspect-square";

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Main Carousel */}
        <div
          ref={imageRef}
          data-surface="pdp"
          className={cn(
            "product-surface relative overflow-hidden group rounded-lg w-full ring-1 ring-border/40",
            aspectClass,
            // Desktop: viewport-constrained
            isPdp && "md:max-h-[calc(100vh-180px)]"
          )}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <div ref={emblaRef} className="overflow-hidden h-full">
            <div className="flex h-full">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] min-w-0 h-full cursor-zoom-in"
                  onClick={() => setFullscreenOpen(true)}
                >
                  <img
                    src={src}
                    alt={`${productName} - View ${i + 1}`}
                    className={cn(
                      "w-full h-full object-contain transition-transform duration-300",
                      isZoomed && selectedIndex === i && "hidden md:block"
                    )}
                    draggable={false}
                  />
                  {/* Desktop zoom lens */}
                  {isZoomed && selectedIndex === i && (
                    <div
                      className="hidden md:block w-full h-full bg-no-repeat"
                      style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: "200%",
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next arrows — desktop only */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition hidden md:flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition hidden md:flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot indicators — mobile */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); scrollTo(i); }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === selectedIndex ? "bg-accent w-4" : "bg-background/60"
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
            {selectedIndex + 1}/{images.length}
          </div>
        </div>

        {/* Thumbnail strip — desktop only (PDP) */}
        {isPdp && images.length > 1 && (
          <div className="hidden md:flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                  i === selectedIndex
                    ? "border-accent ring-1 ring-accent/30"
                    : "border-transparent hover:border-muted-foreground/40"
                )}
              >
                <img
                  src={src}
                  alt={`${productName} thumbnail ${i + 1}`}
                  className="w-full h-full object-contain p-1"
                  style={{ background: "radial-gradient(ellipse at 50% 42%, #fdfcfa 0%, #f0ede6 55%, #e4e0d8 100%)" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay — mobile tap-to-zoom */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center md:hidden">
          <button
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/20 rounded-full p-2"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={images[selectedIndex]}
            alt={productName}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs">
            Pinch to zoom • Swipe to close
          </div>
        </div>
      )}
    </>
  );
};

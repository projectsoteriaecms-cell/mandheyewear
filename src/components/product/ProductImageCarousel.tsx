import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageOff, X, Box, Image as ImageIcon, Loader2 } from "lucide-react";
import { getDisplayImages } from "@/modules/products/lib/image-utils";

const ProductFrame3DViewer = lazy(() =>
  import("./ProductFrame3DViewer").then((m) => ({ default: m.ProductFrame3DViewer }))
);

export interface Frame3DAttributes {
  lensWidth?: number | null;
  bridgeSize?: number | null;
  templeLength?: number | null;
  frameShape?: string | null;
  color?: string | null;
}

interface ProductImageCarouselProps {
  mainImage: string | null;
  additionalImages: string[] | null;
  productName: string;
  /** "pdp" = full page, "quickview" = dialog/sheet */
  variant?: "pdp" | "quickview";
  className?: string;
  /** When provided, enables a "3D" toggle that swaps the main view for an interactive parametric model */
  frame3D?: Frame3DAttributes | null;
}

export const ProductImageCarousel = ({
  mainImage,
  additionalImages,
  productName,
  variant = "pdp",
  className,
  frame3D = null,
}: ProductImageCarouselProps) => {
  const images = getDisplayImages({ image_url: mainImage, additional_images: additionalImages });
  const hasImages = images.length > 0;
  const has3D = !!(frame3D && (frame3D.lensWidth || frame3D.frameShape));

  const [view, setView] = useState<"2d" | "3d">("2d");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const autoplayPlugin = useCallback(
    () => Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true }),
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
          onMouseEnter={() => view === "2d" && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={view === "2d" ? handleMouseMove : undefined}
        >
          {view === "3d" && has3D && (
            <Suspense
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              <ProductFrame3DViewer
                lensWidth={frame3D?.lensWidth ?? null}
                bridgeSize={frame3D?.bridgeSize ?? null}
                templeLength={frame3D?.templeLength ?? null}
                frameShape={frame3D?.frameShape ?? null}
                color={frame3D?.color ?? null}
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/80 pointer-events-none select-none bg-background/70 backdrop-blur-sm rounded-full px-3 py-1 border border-border/40">
                Drag to rotate • Scroll to zoom
              </div>
            </Suspense>
          )}
          {view === "2d" && (
          <>
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
          </>
          )}



          {/* Image counter — 2D only */}
          {view === "2d" && (
            <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
              {selectedIndex + 1}/{images.length}
            </div>
          )}

          {/* 2D / 3D toggle */}
          {has3D && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-background/85 backdrop-blur-md rounded-full p-1 border border-border/50 shadow-md"
              style={view === "2d" ? { top: "2.75rem" } : undefined}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setView("2d"); }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors",
                  view === "2d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Photo view"
              >
                <ImageIcon className="h-3 w-3" />
                Photo
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setView("3d"); }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors",
                  view === "3d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="3D view"
              >
                <Box className="h-3 w-3" />
                3D
              </button>
            </div>
          )}
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
                  style={{ background: "#FFFFFF" }}
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

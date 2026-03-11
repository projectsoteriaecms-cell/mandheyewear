import { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaretLeft, CaretRight, X, MagnifyingGlassPlus, MagnifyingGlassMinus } from "@phosphor-icons/react";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";

interface ImagePreviewLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

export const ImagePreviewLightbox = ({
  images,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ImagePreviewLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Reset zoom when navigating
  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      const next = currentIndex + dir;
      if (next >= 0 && next < images.length) {
        onIndexChange(next);
      }
    },
    [currentIndex, images.length, onIndexChange]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "+" || e.key === "=") setScale((s) => Math.min(4, s + 0.5));
      else if (e.key === "-") setScale((s) => Math.max(0.5, s - 0.5));
      else if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, navigate, resetZoom]);

  const handleImageClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      resetZoom();
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setScale((s) => {
        const next = Math.min(4, Math.max(0.5, s + delta));
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: posStart.current.x + (e.clientX - dragStart.current.x),
        y: posStart.current.y + (e.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!images.length) return null;

  const url = images[currentIndex];
  const label = IMAGE_POSITION_LABELS[currentIndex] || `Image ${currentIndex + 1}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 bg-black/95 border-none overflow-hidden [&>button]:hidden">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
              {label}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white/80 text-xs">
              {currentIndex + 1} / {images.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
              {Math.round(scale * 100)}%
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setScale((s) => Math.min(4, s + 0.5))}
            >
              <MagnifyingGlassPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => {
                const next = Math.max(0.5, scale - 0.5);
                setScale(next);
                if (next <= 1) setPosition({ x: 0, y: 0 });
              }}
            >
              <MagnifyingGlassMinus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" weight="bold" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm text-white hover:bg-background/50"
            onClick={() => navigate(-1)}
          >
            <CaretLeft className="h-6 w-6" weight="bold" />
          </Button>
        )}
        {currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/30 backdrop-blur-sm text-white hover:bg-background/50"
            onClick={() => navigate(1)}
          >
            <CaretRight className="h-6 w-6" weight="bold" />
          </Button>
        )}

        {/* Image */}
        <div
          className="flex items-center justify-center w-[90vw] h-[85vh] overflow-hidden select-none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
        >
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-full object-contain transition-transform duration-150"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            onClick={handleImageClick}
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

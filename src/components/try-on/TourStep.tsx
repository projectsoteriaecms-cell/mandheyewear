import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { TourStep as TourStepType } from "@/hooks/useTryOnTour";

interface TourStepProps {
  step: TourStepType;
  currentIndex: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

interface Position {
  top: number;
  left: number;
  arrowPosition: "top" | "bottom" | "left" | "right";
}

export function TourStep({
  step,
  currentIndex,
  totalSteps,
  isFirst,
  isLast,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: TourStepProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(`[data-tour-step="${step.target}"]`);
      
      if (!targetElement || !tooltipRef.current) {
        // Fallback to center if target not found
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 160,
          arrowPosition: "top",
        });
        setTargetRect(null);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);

      const tooltipWidth = 320;
      const tooltipHeight = tooltipRef.current.offsetHeight || 180;
      const padding = 16;
      const arrowOffset = 12;

      let top = 0;
      let left = 0;
      let arrowPosition: "top" | "bottom" | "left" | "right" = "top";

      // Calculate position based on preferred position
      switch (step.position) {
        case "top":
          top = rect.top - tooltipHeight - arrowOffset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = "bottom";
          break;
        case "bottom":
          top = rect.bottom + arrowOffset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowPosition = "top";
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - arrowOffset;
          arrowPosition = "right";
          break;
        case "right":
        default:
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + arrowOffset;
          arrowPosition = "left";
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < padding) left = padding;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipHeight > window.innerHeight - padding) {
        top = window.innerHeight - tooltipHeight - padding;
      }

      setPosition({ top, left, arrowPosition });
    };

    updatePosition();
    
    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step]);

  if (!position) return null;

  return (
    <>
      {/* Overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {targetRect && (
          <svg className="w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.6)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        )}
        {!targetRect && (
          <div className="w-full h-full bg-black/60" />
        )}
      </div>

      {/* Spotlight ring around target */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none rounded-lg ring-2 ring-accent ring-offset-2 ring-offset-transparent animate-pulse"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-80 pointer-events-auto animate-fade-in"
        style={{ top: position.top, left: position.left }}
      >
        <div className="relative bg-card/95 backdrop-blur-lg border border-accent/30 rounded-xl shadow-2xl p-4">
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-3 h-3 bg-card/95 border-accent/30 rotate-45",
              position.arrowPosition === "top" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-t",
              position.arrowPosition === "bottom" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b",
              position.arrowPosition === "left" && "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-b",
              position.arrowPosition === "right" && "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-r border-t"
            )}
          />

          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X weight="bold" className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="mb-4 pr-6">
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === currentIndex
                    ? "w-4 bg-accent"
                    : i < currentIndex
                    ? "w-1.5 bg-accent/50"
                    : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ArrowLeft weight="bold" className="h-4 w-4" />
                </Button>
              )}
              
              {isLast ? (
                <Button variant="gold" size="sm" onClick={onComplete}>
                  <Check weight="bold" className="h-4 w-4 mr-1" />
                  Done
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={onNext}>
                  Next
                  <ArrowRight weight="bold" className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

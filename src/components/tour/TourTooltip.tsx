import { createPortal } from "react-dom";
import { useTour } from "./TourProvider";
import { X, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_WIDTH = 288;
const TOOLTIP_EST_HEIGHT = 168;
const EDGE_MARGIN = 12;
const SPOTLIGHT_PADDING = 6;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTooltipPos(
  rect: DOMRect,
  placement: "top" | "bottom" | "left" | "right" = "bottom"
): { top: number; left: number; effectivePlacement: typeof placement } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try preferred placement, fall back intelligently
  let effectivePlacement = placement;
  if (placement === "bottom" && rect.bottom + TOOLTIP_EST_HEIGHT + 16 > vh) {
    effectivePlacement = "top";
  }
  if (placement === "top" && rect.top - TOOLTIP_EST_HEIGHT - 16 < 0) {
    effectivePlacement = "bottom";
  }

  let top = 0;
  let left = 0;

  switch (effectivePlacement) {
    case "bottom":
      top = rect.bottom + 12;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "top":
      top = rect.top - TOOLTIP_EST_HEIGHT - 12;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "left":
      top = rect.top + rect.height / 2 - TOOLTIP_EST_HEIGHT / 2;
      left = rect.left - TOOLTIP_WIDTH - 12;
      break;
    case "right":
      top = rect.top + rect.height / 2 - TOOLTIP_EST_HEIGHT / 2;
      left = rect.right + 12;
      break;
  }

  // Clamp within viewport
  left = Math.max(EDGE_MARGIN, Math.min(left, vw - TOOLTIP_WIDTH - EDGE_MARGIN));
  top = Math.max(EDGE_MARGIN, Math.min(top, vh - TOOLTIP_EST_HEIGHT - EDGE_MARGIN));

  return { top, left, effectivePlacement };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TourTooltip = () => {
  const { active, currentStep, targetRect, stepIndex, totalSteps, nextStep, prevStep, endTour, tourId, markSeen } = useTour();

  if (!active || !currentStep) return null;

  const handleEnd = () => {
    if (tourId) markSeen(tourId);
    endTour();
  };

  const handleNext = () => {
    const isLast = stepIndex === totalSteps - 1;
    if (isLast) {
      if (tourId) markSeen(tourId);
      endTour();
    } else {
      nextStep();
    }
  };

  const isLast = stepIndex === totalSteps - 1;

  // Spotlight rect (add padding)
  const spot = targetRect
    ? {
        top: targetRect.top - SPOTLIGHT_PADDING,
        left: targetRect.left - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  // Tooltip position
  const { top: tipTop, left: tipLeft } = targetRect
    ? calcTooltipPos(targetRect, currentStep.placement)
    : { top: window.innerHeight / 2 - TOOLTIP_EST_HEIGHT / 2, left: window.innerWidth / 2 - TOOLTIP_WIDTH / 2 };

  return createPortal(
    <>
      {/* Dark overlay with spotlight "hole" via box-shadow trick */}
      {spot && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: 6,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            zIndex: 9997,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Fallback full-screen dim when no target found */}
      {!spot && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9997,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Ring highlight on target */}
      {spot && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: 6,
            border: "2px solid #C9A84C",
            zIndex: 9998,
            pointerEvents: "none",
            animation: "tour-pulse 1.6s ease-in-out infinite",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        role="dialog"
        aria-label={currentStep.title}
        style={{
          position: "fixed",
          top: tipTop,
          left: tipLeft,
          width: TOOLTIP_WIDTH,
          zIndex: 9999,
        }}
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Top colour bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-3 pb-1">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <button
            onClick={handleEnd}
            className="text-muted-foreground hover:text-foreground transition-colors -mr-1 -mt-0.5"
            aria-label="Close guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-1">
          <h4 className="font-semibold text-foreground text-sm leading-tight mb-1">
            {currentStep.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentStep.body}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === stepIndex
                  ? "w-4 h-2 bg-amber-500"
                  : i < stepIndex
                  ? "w-2 h-2 bg-amber-300"
                  : "w-2 h-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {stepIndex > 0 && (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleEnd}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-md px-3 py-1.5 transition-colors"
          >
            {isLast ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Done
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pulse animation injected once */}
      <style>{`
        @keyframes tour-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>,
    document.body
  );
};

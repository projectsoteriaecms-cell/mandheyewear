/**
 * TourFloatingButton
 * A small persistent "?" button that lets testers re-launch the tour for the
 * current page. Appears bottom-left, above the WhatsApp button.
 * Pass `tourId` and `tourSteps` for the current page.
 */
import { useTour } from "./TourProvider";
import type { TourStep } from "./TourProvider";
import { HelpCircle } from "lucide-react";

interface TourFloatingButtonProps {
  tourId: string;
  tourSteps: TourStep[];
  /** Position variant — defaults to "bottom-left" */
  position?: "bottom-left" | "bottom-right";
}

export const TourFloatingButton = ({
  tourId,
  tourSteps,
  position = "bottom-left",
}: TourFloatingButtonProps) => {
  const { startTour, markSeen, active } = useTour();

  if (active) return null; // Don't show while a tour is running

  const positionClass =
    position === "bottom-left"
      ? "bottom-24 left-4 sm:bottom-8"
      : "bottom-24 right-4 sm:bottom-8";

  const handleClick = () => {
    // Reset seen state so the tour can auto-trigger again next time
    markSeen(tourId); // mark then immediately start (override)
    startTour(tourId, tourSteps);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed ${positionClass} z-50 flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-border text-muted-foreground hover:text-foreground hover:border-amber-400 text-xs font-medium rounded-full shadow-md px-3 py-1.5 transition-all hover:shadow-lg`}
      title="Take a guided tour of this page"
      aria-label="Take a tour"
    >
      <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
      Tour
    </button>
  );
};

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
  /** matches [data-tour="..."] attribute on the target element */
  target: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
  /** scroll the element into view before measuring — default true */
  scrollTo?: boolean;
}

interface TourContextValue {
  startTour: (tourId: string, steps: TourStep[]) => void;
  endTour: () => void;
  hasSeenTour: (tourId: string) => boolean;
  markSeen: (tourId: string) => void;
  active: boolean;
  tourId: string | null;
  stepIndex: number;
  totalSteps: number;
  currentStep: TourStep | null;
  targetRect: DOMRect | null;
  nextStep: () => void;
  prevStep: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TourContext = createContext<TourContextValue | null>(null);

export const useTour = (): TourContextValue => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be inside <TourProvider>");
  return ctx;
};

const STORAGE_PREFIX = "mh_tour_seen_v1_";

// ─── Provider ─────────────────────────────────────────────────────────────────

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [active, setActive] = useState(false);
  const [tourId, setTourId] = useState<string | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

  const currentStep = active && steps[stepIndex] ? steps[stepIndex] : null;

  // Measure the target element whenever the step changes
  useLayoutEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const measure = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${currentStep.target}"]`
      );

      if (!el) {
        setTargetRect(null);
        return;
      }

      if (currentStep.scrollTo !== false) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }

      // Slight delay so scroll animation settles before measuring
      rafRef.current = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setTargetRect(el.getBoundingClientRect());
        });
      });
    };

    measure();

    // Re-measure on resize
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep]);

  // ── Public API ──────────────────────────────────────────────────────────────

  const hasSeenTour = useCallback(
    (id: string) => localStorage.getItem(STORAGE_PREFIX + id) === "1",
    []
  );

  const markSeen = useCallback((id: string) => {
    localStorage.setItem(STORAGE_PREFIX + id, "1");
  }, []);

  const startTour = useCallback((id: string, tourSteps: TourStep[]) => {
    setTourId(id);
    setSteps(tourSteps);
    setStepIndex(0);
    setActive(true);
  }, []);

  const endTour = useCallback(() => {
    setActive(false);
    setTourId(null);
    setSteps([]);
    setStepIndex(0);
    setTargetRect(null);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= steps.length) {
        setActive(false);
        setSteps([]);
        setStepIndex(0);
        setTargetRect(null);
        return 0;
      }
      return next;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  return (
    <TourContext.Provider
      value={{
        startTour,
        endTour,
        hasSeenTour,
        markSeen,
        active,
        tourId,
        stepIndex,
        totalSteps: steps.length,
        currentStep,
        targetRect,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

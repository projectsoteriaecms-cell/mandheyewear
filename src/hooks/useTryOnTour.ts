import { useState, useEffect, useCallback } from "react";

const TOUR_STORAGE_KEY = "vto-tour-completed";

export interface TourStep {
  id: string;
  target: string; // data-tour-step attribute value
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const tourSteps: TourStep[] = [
  {
    id: "upload",
    target: "upload",
    title: "Upload Your Photo",
    description: "Start by uploading a clear, front-facing photo. This will be used for the AI try-on.",
    position: "right",
  },
  {
    id: "browse",
    target: "frames",
    title: "Browse Our Frames",
    description: "Scroll through our collection or use filters to find frames that match your style.",
    position: "top",
  },
  {
    id: "try",
    target: "try-button",
    title: "Try It On",
    description: "Click 'Try This Frame' to see the frame on your face using AI technology.",
    position: "top",
  },
  {
    id: "result",
    target: "result",
    title: "View Your Result",
    description: "See the realistic preview! Add to cart if you love it, or try another frame.",
    position: "left",
  },
  {
    id: "history",
    target: "history",
    title: "Your Try-On History",
    description: "All your try-ons are saved here for easy comparison. Click any to view again!",
    position: "top",
  },
];

export function useTryOnTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true to prevent flash

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    const seen = completed === "true";
    setHasSeenTour(seen);
    
    // Auto-start tour for first-time visitors after a short delay
    if (!seen) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const currentStep = tourSteps[currentStepIndex];
  const totalSteps = tourSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  }, [totalSteps]);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    hasSeenTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    restartTour,
    goToStep,
  };
}

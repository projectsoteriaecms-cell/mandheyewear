import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Question } from "@phosphor-icons/react";
import { TourStep } from "./TourStep";
import { useTryOnTour } from "@/hooks/useTryOnTour";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TryOnTourProps {
  className?: string;
}

export function TryOnTour({ className }: TryOnTourProps) {
  const {
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
  } = useTryOnTour();

  return (
    <>
      {/* Help button to restart tour */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={restartTour}
              className={className}
              aria-label="Show guided tour"
            >
              <Question weight="duotone" className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show guided tour</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Tour overlay - rendered in portal */}
      {isActive &&
        currentStep &&
        createPortal(
          <TourStep
            step={currentStep}
            currentIndex={currentStepIndex}
            totalSteps={totalSteps}
            isFirst={isFirstStep}
            isLast={isLastStep}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skipTour}
            onComplete={completeTour}
          />,
          document.body
        )}
    </>
  );
}

import type { Step } from "./types";

const STEPS: Step[] = ["upload", "mapping", "preview", "options", "importing", "summary"];

interface StepIndicatorProps {
  currentStep: Step;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === s
                ? "bg-primary text-primary-foreground"
                : currentIndex > i
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </div>
          {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-muted" />}
        </div>
      ))}
    </div>
  );
};

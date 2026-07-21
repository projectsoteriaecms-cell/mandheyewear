import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { WelcomeStep } from "./WelcomeStep";
import { StyleQuizStep } from "./StyleQuizStep";
import { CompleteStep } from "./CompleteStep";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/modules/auth";
import { useProfile } from "@/modules/personalization";

export type OnboardingStep = "welcome" | "style-quiz" | "complete";

const STEPS: OnboardingStep[] = ["welcome", "style-quiz", "complete"];

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleComplete = () => {
    toast({
      title: "🎉 Profile Complete!",
      description: "Your personalized recommendations are ready.",
    });
    navigate("/shop?from=onboarding");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            {currentStep === "style-quiz" && (
              <button
                onClick={handleComplete}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Step content */}
      <div className="pt-28 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {currentStep === "welcome" && (
            <WelcomeStep onNext={goNext} userName={profile?.full_name} />
          )}
          {currentStep === "style-quiz" && (
            <StyleQuizStep onNext={goNext} onBack={goBack} />
          )}
          {currentStep === "complete" && (
            <CompleteStep onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
};
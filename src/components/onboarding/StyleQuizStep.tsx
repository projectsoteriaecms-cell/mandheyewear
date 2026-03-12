import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/shared/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaceShapeIllustration, FrameStyleIllustration } from "./illustrations";
import {
  FACE_SHAPES,
  FRAME_SHAPES,
  MATERIALS,
  GENDER_OPTIONS,
  USAGE_OPTIONS,
  BUDGET_OPTIONS,
  type QuizPreferences,
} from "./quiz-constants";

const cardBaseStyles = "group relative cursor-pointer transition-all duration-300 ease-out";
const cardHoverStyles = "hover:shadow-xl hover:-translate-y-1 hover:border-accent/60";
const cardSelectedStyles = "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5";
const cardUnselectedStyles = "hover:bg-muted/40";

interface StyleQuizStepProps {
  onNext: () => void;
  onBack: () => void;
}

type QuizStep = "gender" | "face-shape" | "frame-shape" | "material" | "usage" | "budget";

const QUIZ_STEPS: QuizStep[] = ["gender", "face-shape", "frame-shape", "material", "usage", "budget"];

export const StyleQuizStep = ({ onNext, onBack }: StyleQuizStepProps) => {
  const [currentQuizStep, setCurrentQuizStep] = useState<QuizStep>("gender");
  const [answers, setAnswers] = useState<QuizPreferences>({
    frameShape: [],
    material: [],
    usage: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const currentStepIndex = QUIZ_STEPS.indexOf(currentQuizStep);

  const handleSingleSelect = (field: "faceShape" | "budget" | "gender", value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: "frameShape" | "material" | "usage", value: string) => {
    setAnswers((prev) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const canProceed = () => {
    switch (currentQuizStep) {
      case "gender":
        return !!answers.gender;
      case "face-shape":
        return !!answers.faceShape;
      case "frame-shape":
        return (answers.frameShape?.length ?? 0) > 0;
      case "material":
        return (answers.material?.length ?? 0) > 0;
      case "usage":
        return (answers.usage?.length ?? 0) > 0;
      case "budget":
        return !!answers.budget;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentQuizStep === "budget") {
      if (!user) return;

      setIsSaving(true);
      try {
        await updateProfile.mutateAsync({
          userId: user.id,
          updates: {
            frame_preferences: {
              faceShape: answers.faceShape,
              frameShape: answers.frameShape,
              material: answers.material,
              gender: answers.gender,
              usage: answers.usage,
              budget: answers.budget,
            },
          },
        });
        onNext();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save preferences. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < QUIZ_STEPS.length) {
        setCurrentQuizStep(QUIZ_STEPS[nextIndex]);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex === 0) {
      onBack();
    } else {
      setCurrentQuizStep(QUIZ_STEPS[currentStepIndex - 1]);
    }
  };

  const renderSelectionCard = (
    item: { id: string; label: string; description: string },
    isSelected: boolean,
    onClick: () => void,
    index: number,
    illustration?: React.ReactNode
  ) => (
    <Card
      key={item.id}
      className={cn(
        cardBaseStyles,
        cardHoverStyles,
        "p-4",
        isSelected ? cardSelectedStyles : cardUnselectedStyles
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {illustration && (
          <div
            className={cn(
              "w-full h-12 max-w-[140px] transition-all duration-300 ease-out",
              "group-hover:scale-110 group-hover:drop-shadow-md",
              isSelected && "text-accent scale-105 drop-shadow-lg"
            )}
          >
            {illustration}
          </div>
        )}
        <div className="transition-all duration-200">
          <p
            className={cn(
              "font-medium transition-colors duration-200",
              isSelected ? "text-accent" : "group-hover:text-accent/80"
            )}
          >
            {item.label}
          </p>
          <p
            className={cn(
              "text-xs text-muted-foreground mt-0.5 transition-colors duration-200",
              isSelected && "text-accent/70"
            )}
          >
            {item.description}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
          isSelected
            ? "bg-accent scale-100 opacity-100"
            : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 transition-colors duration-200",
            isSelected ? "text-accent-foreground" : "text-accent"
          )}
        />
      </div>
    </Card>
  );

  const renderQuizContent = () => {
    switch (currentQuizStep) {
      case "gender":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">Who are these for?</h3>
              <p className="text-sm text-muted-foreground">Help us narrow down the best options</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {GENDER_OPTIONS.map((option, index) =>
                renderSelectionCard(
                  option,
                  answers.gender === option.id,
                  () => handleSingleSelect("gender", option.id),
                  index
                )
              )}
            </div>
          </div>
        );

      case "face-shape":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What's your face shape?</h3>
              <p className="text-sm text-muted-foreground">This helps us recommend flattering frames</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {FACE_SHAPES.map((shape, index) => {
                const isSelected = answers.faceShape === shape.id;
                return renderSelectionCard(
                  shape,
                  isSelected,
                  () => handleSingleSelect("faceShape", shape.id),
                  index,
                  <FaceShapeIllustration
                    shape={shape.id as "oval" | "round" | "square" | "heart" | "oblong"}
                    selected={isSelected}
                  />
                );
              })}
            </div>
          </div>
        );

      case "frame-shape":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What frame shapes do you like?</h3>
              <p className="text-sm text-muted-foreground">Select all that appeal to you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAME_SHAPES.map((shape, index) => {
                const isSelected = answers.frameShape?.includes(shape.id) ?? false;
                return renderSelectionCard(
                  shape,
                  isSelected,
                  () => handleMultiSelect("frameShape", shape.id),
                  index,
                  <FrameStyleIllustration style={shape.id} selected={isSelected} />
                );
              })}
            </div>
          </div>
        );

      case "material":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">Preferred frame material?</h3>
              <p className="text-sm text-muted-foreground">Select all that interest you</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {MATERIALS.map((mat, index) =>
                renderSelectionCard(
                  mat,
                  answers.material?.includes(mat.id) ?? false,
                  () => handleMultiSelect("material", mat.id),
                  index
                )
              )}
            </div>
          </div>
        );

      case "usage":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">How will you use your glasses?</h3>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {USAGE_OPTIONS.map((use, index) =>
                renderSelectionCard(
                  use,
                  answers.usage?.includes(use.id) ?? false,
                  () => handleMultiSelect("usage", use.id),
                  index
                )
              )}
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What's your budget?</h3>
              <p className="text-sm text-muted-foreground">We'll prioritize frames in your range</p>
            </div>
            <div className="grid gap-3 max-w-md mx-auto">
              {BUDGET_OPTIONS.map((budget, index) => {
                const isSelected = answers.budget === budget.id;
                return (
                  <Card
                    key={budget.id}
                    className={cn(
                      cardBaseStyles,
                      "p-4 hover:shadow-lg hover:-translate-y-0.5",
                      isSelected
                        ? "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10"
                        : "hover:border-accent/50 hover:bg-muted/40"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onClick={() => handleSingleSelect("budget", budget.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="transition-all duration-200">
                        <p
                          className={cn(
                            "font-medium transition-colors duration-200",
                            isSelected ? "text-accent" : "group-hover:text-accent/80"
                          )}
                        >
                          {budget.label}
                        </p>
                        <p
                          className={cn(
                            "text-xs text-muted-foreground transition-colors duration-200",
                            isSelected && "text-accent/70"
                          )}
                        >
                          {budget.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? "bg-accent scale-100 opacity-100"
                            : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-40"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 transition-colors duration-200",
                            isSelected ? "text-accent-foreground" : "text-accent"
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-display font-bold">Style Preferences</h2>
        <div className="flex justify-center gap-1.5">
          {QUIZ_STEPS.map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-2 w-10 rounded-full transition-all duration-300",
                index <= currentStepIndex ? "bg-accent" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {QUIZ_STEPS.length}
        </p>
      </div>

      {renderQuizContent()}

      <div className="flex justify-between pt-6 border-t">
        <Button variant="ghost" onClick={handlePrev} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed() || isSaving} className="px-6">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {currentQuizStep === "budget" ? "Save & Continue" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

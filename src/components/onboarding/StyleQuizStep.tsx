import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleQuizStepProps {
  onNext: () => void;
  onBack: () => void;
}

type QuizStep = "face-shape" | "frame-style" | "colors" | "usage" | "budget";

const QUIZ_STEPS: QuizStep[] = ["face-shape", "frame-style", "colors", "usage", "budget"];

const FACE_SHAPES = [
  { id: "oval", label: "Oval", description: "Balanced proportions" },
  { id: "round", label: "Round", description: "Soft, curved features" },
  { id: "square", label: "Square", description: "Strong jawline" },
  { id: "heart", label: "Heart", description: "Wider forehead" },
  { id: "oblong", label: "Oblong", description: "Longer face shape" },
];

const FRAME_STYLES = [
  { id: "classic", label: "Classic", description: "Timeless designs" },
  { id: "modern", label: "Modern", description: "Contemporary lines" },
  { id: "bold", label: "Bold", description: "Statement pieces" },
  { id: "minimalist", label: "Minimalist", description: "Clean & simple" },
  { id: "vintage", label: "Vintage", description: "Retro inspired" },
];

const COLORS = [
  { id: "black", label: "Black", color: "bg-black" },
  { id: "tortoise", label: "Tortoise", color: "bg-amber-700" },
  { id: "gold", label: "Gold", color: "bg-yellow-500" },
  { id: "silver", label: "Silver", color: "bg-gray-400" },
  { id: "blue", label: "Blue", color: "bg-blue-600" },
  { id: "clear", label: "Clear", color: "bg-white border-2" },
];

const USAGE = [
  { id: "everyday", label: "Everyday", description: "All-day wear" },
  { id: "computer", label: "Computer", description: "Screen work" },
  { id: "reading", label: "Reading", description: "Close-up tasks" },
  { id: "outdoor", label: "Outdoor", description: "Sun protection" },
];

const BUDGETS = [
  { id: "under 50k", label: "Under ₦50,000", description: "Budget-friendly" },
  { id: "50-150k", label: "₦50,000 - ₦150,000", description: "Mid-range" },
  { id: "150-300k", label: "₦150,000 - ₦300,000", description: "Premium" },
  { id: "over 300k", label: "Over ₦300,000", description: "Luxury" },
];

export const StyleQuizStep = ({ onNext, onBack }: StyleQuizStepProps) => {
  const [currentQuizStep, setCurrentQuizStep] = useState<QuizStep>("face-shape");
  const [answers, setAnswers] = useState<{
    faceShape?: string;
    frameStyle: string[];
    colors: string[];
    usage: string[];
    budget?: string;
  }>({
    frameStyle: [],
    colors: [],
    usage: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const currentStepIndex = QUIZ_STEPS.indexOf(currentQuizStep);

  const handleSingleSelect = (field: "faceShape" | "budget", value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: "frameStyle" | "colors" | "usage", value: string) => {
    setAnswers((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const canProceed = () => {
    switch (currentQuizStep) {
      case "face-shape":
        return !!answers.faceShape;
      case "frame-style":
        return answers.frameStyle.length > 0;
      case "colors":
        return answers.colors.length > 0;
      case "usage":
        return answers.usage.length > 0;
      case "budget":
        return !!answers.budget;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentQuizStep === "budget") {
      // Save preferences and proceed
      if (!user) return;

      setIsSaving(true);
      try {
        await updateProfile.mutateAsync({
          userId: user.id,
          updates: {
            frame_preferences: {
              faceShape: answers.faceShape,
              frameStyle: answers.frameStyle,
              colors: answers.colors,
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

  const renderQuizContent = () => {
    switch (currentQuizStep) {
      case "face-shape":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">What's your face shape?</h3>
              <p className="text-sm text-muted-foreground">This helps us recommend flattering frames</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FACE_SHAPES.map((shape) => (
                <Card
                  key={shape.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all",
                    answers.faceShape === shape.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleSingleSelect("faceShape", shape.id)}
                >
                  <div className="text-center">
                    <p className="font-medium">{shape.label}</p>
                    <p className="text-xs text-muted-foreground">{shape.description}</p>
                  </div>
                  {answers.faceShape === shape.id && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case "frame-style":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">What styles do you prefer?</h3>
              <p className="text-sm text-muted-foreground">Select all that appeal to you</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FRAME_STYLES.map((style) => (
                <Card
                  key={style.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all relative",
                    answers.frameStyle.includes(style.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleMultiSelect("frameStyle", style.id)}
                >
                  <div className="text-center">
                    <p className="font-medium">{style.label}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>
                  {answers.frameStyle.includes(style.id) && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">What colors do you like?</h3>
              <p className="text-sm text-muted-foreground">Select your preferred frame colors</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <Card
                  key={color.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all relative",
                    answers.colors.includes(color.id)
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleMultiSelect("colors", color.id)}
                >
                  <div className="text-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full mx-auto mb-2",
                        color.color
                      )}
                    />
                    <p className="text-sm font-medium">{color.label}</p>
                  </div>
                  {answers.colors.includes(color.id) && (
                    <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case "usage":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">How will you use your glasses?</h3>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {USAGE.map((use) => (
                <Card
                  key={use.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all relative",
                    answers.usage.includes(use.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleMultiSelect("usage", use.id)}
                >
                  <div className="text-center">
                    <p className="font-medium">{use.label}</p>
                    <p className="text-xs text-muted-foreground">{use.description}</p>
                  </div>
                  {answers.usage.includes(use.id) && (
                    <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        );

      case "budget":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-1">What's your budget?</h3>
              <p className="text-sm text-muted-foreground">We'll prioritize frames in your range</p>
            </div>
            <div className="grid gap-3">
              {BUDGETS.map((budget) => (
                <Card
                  key={budget.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all relative",
                    answers.budget === budget.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleSingleSelect("budget", budget.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{budget.label}</p>
                      <p className="text-xs text-muted-foreground">{budget.description}</p>
                    </div>
                    {answers.budget === budget.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">Style Preferences</h2>
        <div className="flex justify-center gap-1">
          {QUIZ_STEPS.map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-1.5 w-8 rounded-full transition-colors",
                index <= currentStepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {renderQuizContent()}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={handlePrev} disabled={isSaving}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed() || isSaving}>
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

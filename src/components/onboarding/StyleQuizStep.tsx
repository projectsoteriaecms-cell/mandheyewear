import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaceShapeIllustration, FrameStyleIllustration } from "./illustrations";

// Premium card styles with micro-animations
const cardBaseStyles = "group relative cursor-pointer transition-all duration-300 ease-out";
const cardHoverStyles = "hover:shadow-xl hover:-translate-y-1 hover:border-accent/60";
const cardSelectedStyles = "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5";
const cardUnselectedStyles = "hover:bg-muted/40";

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
] as const;

const FRAME_STYLES = [
  { id: "classic", label: "Classic", description: "Timeless designs" },
  { id: "modern", label: "Modern", description: "Contemporary lines" },
  { id: "bold", label: "Bold", description: "Statement pieces" },
  { id: "minimalist", label: "Minimalist", description: "Clean & simple" },
  { id: "vintage", label: "Vintage", description: "Retro inspired" },
] as const;

const COLORS = [
  { id: "black", label: "Black", gradient: "bg-gradient-to-br from-zinc-900 to-black" },
  { id: "tortoise", label: "Tortoise", gradient: "bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950" },
  { id: "gold", label: "Gold", gradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600" },
  { id: "silver", label: "Silver", gradient: "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500" },
  { id: "blue", label: "Blue", gradient: "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900" },
  { id: "clear", label: "Clear", gradient: "bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-border" },
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What's your face shape?</h3>
              <p className="text-sm text-muted-foreground">This helps us recommend flattering frames</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {FACE_SHAPES.map((shape, index) => {
                const isSelected = answers.faceShape === shape.id;
                return (
                  <Card
                    key={shape.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      "p-4",
                      isSelected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSingleSelect("faceShape", shape.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={cn(
                        "w-16 h-20 transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:drop-shadow-md",
                        isSelected && "text-accent scale-105 drop-shadow-lg"
                      )}>
                        <FaceShapeIllustration 
                          shape={shape.id as "oval" | "round" | "square" | "heart" | "oblong"} 
                          selected={isSelected}
                        />
                      </div>
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium transition-colors duration-200",
                          isSelected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{shape.label}</p>
                        <p className={cn(
                          "text-xs text-muted-foreground mt-0.5 transition-colors duration-200",
                          isSelected && "text-accent/70"
                        )}>{shape.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        isSelected ? "text-accent-foreground" : "text-accent"
                      )} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case "frame-style":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What styles do you prefer?</h3>
              <p className="text-sm text-muted-foreground">Select all that appeal to you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAME_STYLES.map((style, index) => {
                const isSelected = answers.frameStyle.includes(style.id);
                return (
                  <Card
                    key={style.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      "p-5",
                      isSelected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleMultiSelect("frameStyle", style.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={cn(
                        "w-full h-12 max-w-[140px] transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:drop-shadow-md",
                        isSelected && "text-accent scale-105 drop-shadow-lg"
                      )}>
                        <FrameStyleIllustration 
                          style={style.id as "classic" | "modern" | "bold" | "minimalist" | "vintage"} 
                          selected={isSelected}
                        />
                      </div>
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium transition-colors duration-200",
                          isSelected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{style.label}</p>
                        <p className={cn(
                          "text-xs text-muted-foreground mt-0.5 transition-colors duration-200",
                          isSelected && "text-accent/70"
                        )}>{style.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        isSelected ? "text-accent-foreground" : "text-accent"
                      )} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-display font-semibold mb-2">What colors do you like?</h3>
              <p className="text-sm text-muted-foreground">Select your preferred frame colors</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {COLORS.map((color, index) => {
                const isSelected = answers.colors.includes(color.id);
                return (
                  <Card
                    key={color.id}
                    className={cn(
                      cardBaseStyles,
                      "p-4 hover:shadow-lg hover:-translate-y-1",
                      isSelected 
                        ? "border-accent ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5" 
                        : "hover:border-accent/50"
                    )}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleMultiSelect("colors", color.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full shadow-inner transition-all duration-300 ease-out",
                          "group-hover:scale-115 group-hover:shadow-lg",
                          isSelected && "scale-110 ring-2 ring-accent/50 ring-offset-2 ring-offset-background",
                          color.gradient
                        )}
                      />
                      <p className={cn(
                        "text-sm font-medium transition-colors duration-200",
                        isSelected ? "text-accent" : "group-hover:text-accent/80"
                      )}>{color.label}</p>
                    </div>
                    <div className={cn(
                      "absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-2.5 w-2.5 transition-colors duration-200",
                        isSelected ? "text-accent-foreground" : "text-accent"
                      )} />
                    </div>
                  </Card>
                );
              })}
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
              {USAGE.map((use, index) => {
                const isSelected = answers.usage.includes(use.id);
                return (
                  <Card
                    key={use.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      "p-5",
                      isSelected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleMultiSelect("usage", use.id)}
                  >
                    <div className="text-center transition-all duration-200">
                      <p className={cn(
                        "font-medium transition-colors duration-200",
                        isSelected ? "text-accent" : "group-hover:text-accent/80"
                      )}>{use.label}</p>
                      <p className={cn(
                        "text-xs text-muted-foreground mt-1 transition-colors duration-200",
                        isSelected && "text-accent/70"
                      )}>{use.description}</p>
                    </div>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      isSelected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        isSelected ? "text-accent-foreground" : "text-accent"
                      )} />
                    </div>
                  </Card>
                );
              })}
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
              {BUDGETS.map((budget, index) => {
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
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSingleSelect("budget", budget.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium transition-colors duration-200",
                          isSelected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{budget.label}</p>
                        <p className={cn(
                          "text-xs text-muted-foreground transition-colors duration-200",
                          isSelected && "text-accent/70"
                        )}>{budget.description}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                        isSelected 
                          ? "bg-accent scale-100 opacity-100" 
                          : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-40"
                      )}>
                        <Check className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          isSelected ? "text-accent-foreground" : "text-accent"
                        )} />
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

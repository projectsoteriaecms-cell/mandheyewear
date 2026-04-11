import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUpdateProfile } from "@/modules/personalization/hooks/useProfile";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Loader2, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrameStyleIllustration } from "./illustrations";
import {
  FRAME_SHAPES,
  GENDER_OPTIONS,
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

export const StyleQuizStep = ({ onNext, onBack }: StyleQuizStepProps) => {
  const [answers, setAnswers] = useState<QuizPreferences>({
    frameShape: [],
    material: [],
    usage: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const handleSingleSelect = (field: "gender", value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: prev[field] === value ? undefined : value }));
  };

  const handleMultiSelect = (field: "frameShape", value: string) => {
    setAnswers((prev) => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const hasAnySelection = !!answers.gender || (answers.frameShape?.length ?? 0) > 0;

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          frame_preferences: {
            frameShape: answers.frameShape,
            gender: answers.gender,
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
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold">Quick Style Picks</h2>
        <p className="text-sm text-muted-foreground">
          Tell us what you like — or skip entirely. It's all optional!
        </p>
      </div>

      {/* Gender Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-display font-semibold text-center">Who are these for?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto">
          {GENDER_OPTIONS.map((option, index) => (
            <Card
              key={option.id}
              className={cn(
                cardBaseStyles,
                cardHoverStyles,
                "p-3",
                answers.gender === option.id ? cardSelectedStyles : cardUnselectedStyles
              )}
              style={{ animationDelay: `${index * 50}ms`, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
              onClick={() => handleSingleSelect("gender", option.id)}
            >
              <div className="flex flex-col items-center text-center space-y-1">
                <p className={cn("font-medium text-sm", answers.gender === option.id ? "text-accent" : "group-hover:text-accent/80")}>
                  {option.label}
                </p>
              </div>
              <div className={cn(
                "absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                answers.gender === option.id ? "bg-accent scale-100 opacity-100" : "bg-accent/20 scale-0 opacity-0"
              )}>
                <Check className="h-2.5 w-2.5 text-accent-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Frame Shape Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-display font-semibold text-center">Frame shapes you like</h3>
        <p className="text-xs text-muted-foreground text-center">Select all that appeal to you</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {FRAME_SHAPES.map((shape, index) => {
            const isSelected = answers.frameShape?.includes(shape.id) ?? false;
            return (
              <Card
                key={shape.id}
                className={cn(
                  cardBaseStyles,
                  cardHoverStyles,
                  "p-3",
                  isSelected ? cardSelectedStyles : cardUnselectedStyles
                )}
                style={{ animationDelay: `${index * 50}ms`, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onClick={() => handleMultiSelect("frameShape", shape.id)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-full h-10 max-w-[120px] transition-all duration-300 ease-out",
                    "group-hover:scale-110",
                    isSelected && "text-accent scale-105"
                  )}>
                    <FrameStyleIllustration style={shape.id} selected={isSelected} />
                  </div>
                  <p className={cn("font-medium text-sm", isSelected ? "text-accent" : "group-hover:text-accent/80")}>
                    {shape.label}
                  </p>
                </div>
                <div className={cn(
                  "absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                  isSelected ? "bg-accent scale-100 opacity-100" : "bg-accent/20 scale-0 opacity-0"
                )}>
                  <Check className="h-2.5 w-2.5 text-accent-foreground" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 sm:pt-6 border-t gap-2">
        <Button variant="ghost" onClick={onBack} disabled={isSaving} size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={isSaving} size="sm" className="text-muted-foreground">
            <SkipForward className="mr-1 h-4 w-4" />
            Skip
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="px-4 sm:px-6">
            {isSaving ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {hasAnySelection ? "Save & Continue" : "Continue"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

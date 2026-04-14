import { useState } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { useUpdateProfile } from "@/modules/personalization/hooks/useProfile";
import { usePersonalizedProducts } from "@/modules/personalization/hooks/usePersonalizedProducts";
import {
  Sparkle,
  ArrowRight,
  ArrowLeft,
  Eyeglasses,
  Check,
} from "@phosphor-icons/react";
import { SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaceShapeIllustration, FrameStyleIllustration } from "@/components/onboarding/illustrations";
import {
  FACE_SHAPES,
  FRAME_SHAPES,
  MATERIALS,
  GENDER_OPTIONS,
  type QuizPreferences,
} from "@/components/onboarding/quiz-constants";

const cardBaseStyles = "group relative cursor-pointer transition-all duration-300 ease-out";
const cardHoverStyles = "hover:shadow-xl hover:-translate-y-1 hover:border-accent/60";
const cardSelectedStyles = "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5";
const cardUnselectedStyles = "hover:bg-muted/40";

type QuizStep = "welcome" | "basics" | "details" | "results";

const StyleQuiz = () => {
  useSEO({
    title: "Style Quiz – Find Your Perfect Frames | M&H Eyewear",
    description: "Take our quick style quiz to discover frames that match your face shape and personal style. Personalized eyewear recommendations.",
  });

  const [currentStep, setCurrentStep] = useState<QuizStep>("welcome");
  const [answers, setAnswers] = useState<QuizPreferences>({
    frameShape: [],
    material: [],
    usage: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();
  const { topPicks } = usePersonalizedProducts();

  const steps: QuizStep[] = ["welcome", "basics", "details", "results"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = currentStep === "welcome" || currentStep === "results" ? 0 : ((currentIndex) / (steps.length - 2)) * 100;

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSingleSelect = (key: keyof QuizPreferences, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };

  const handleMultiSelect = (key: "frameShape" | "material" | "usage", value: string) => {
    const current = answers[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [key]: updated });
  };

  const isSelected = (key: keyof QuizPreferences, value: string) => {
    const answer = answers[key];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const savePreferences = async () => {
    if (!user) {
      toast({ title: "Sign in to save", description: "Create an account to save your style preferences." });
      navigate("/shop");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          frame_preferences: {
            faceShape: answers.faceShape,
            frameShape: answers.frameShape,
            material: answers.material,
            gender: answers.gender,
          },
        },
      });
      toast({ title: "Preferences saved!", description: "We'll show you personalized recommendations." });
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSubmitting(false);
      navigate("/shop?from=quiz");
    }
  };

  const renderSelectionCard = (
    item: { id: string; label: string; description: string },
    selected: boolean,
    onClick: () => void,
    index: number,
    illustration?: React.ReactNode
  ) => (
    <Card
      key={item.id}
      className={cn(cardBaseStyles, cardHoverStyles, "p-3 sm:p-4", selected ? cardSelectedStyles : cardUnselectedStyles)}
      style={{ animationDelay: `${index * 50}ms`, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {illustration && (
          <div className={cn("w-full h-10 sm:h-12 max-w-[120px] sm:max-w-[140px] transition-all duration-300 ease-out", "group-hover:scale-110", selected && "text-accent scale-105")}>
            {illustration}
          </div>
        )}
        <div>
          <p className={cn("font-medium text-sm sm:text-base", selected ? "text-accent" : "group-hover:text-accent/80")}>{item.label}</p>
          <p className={cn("text-xs text-muted-foreground", selected && "text-accent/70")}>{item.description}</p>
        </div>
      </div>
      <div className={cn(
        "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
        selected ? "bg-accent scale-100 opacity-100" : "bg-accent/20 scale-0 opacity-0"
      )}>
        <Check className={cn("h-3 w-3", selected ? "text-accent-foreground" : "text-accent")} weight="bold" />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="h-16 lg:h-[104px]" />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Progress Bar */}
        {currentStep !== "welcome" && currentStep !== "results" && (
          <div className="mb-6 sm:mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentIndex} of {steps.length - 2}
            </p>
          </div>
        )}

        {/* Welcome */}
        {currentStep === "welcome" && (
          <div className="text-center py-8 sm:py-12 space-y-6 sm:space-y-8">
            <div className="inline-flex p-4 sm:p-6 rounded-full bg-accent/10">
              <Sparkle weight="duotone" className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-foreground">
              Let's find your perfect frames
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Just 2 quick steps — all optional! Tell us what you like and we'll curate your experience.
            </p>
            <Button size="lg" onClick={goNext} className="px-6 sm:px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 1: Basics (Gender + Frame Shape) */}
        {currentStep === "basics" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Gender */}
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1">Who are these for?</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Optional — tap to select</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto">
                {GENDER_OPTIONS.map((option, index) =>
                  renderSelectionCard(option, isSelected("gender", option.id), () => handleSingleSelect("gender", option.id), index)
                )}
              </div>
            </div>

            {/* Frame Shape */}
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1">Frame shapes you like</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Select all that appeal to you</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {FRAME_SHAPES.map((shape, index) => {
                  const selected = isSelected("frameShape", shape.id);
                  return renderSelectionCard(shape, selected, () => handleMultiSelect("frameShape", shape.id), index, <FrameStyleIllustration style={shape.id} selected={selected} />);
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 sm:pt-6 border-t">
              <Button variant="ghost" onClick={goBack} size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={goNext} size="sm" className="text-muted-foreground">
                  <SkipForward className="mr-1 h-4 w-4" />
                  Skip
                </Button>
                <Button onClick={goNext} size="sm" className="px-4 sm:px-6">
                  Continue
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details (Face Shape + Material) */}
        {currentStep === "details" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Face Shape */}
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1">What's your face shape?</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Optional — don't worry if you're unsure</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
                {FACE_SHAPES.map((shape, index) => {
                  const selected = isSelected("faceShape", shape.id);
                  return renderSelectionCard(shape, selected, () => handleSingleSelect("faceShape", shape.id), index, <FaceShapeIllustration shape={shape.id} selected={selected} />);
                })}
              </div>
            </div>

            {/* Material */}
            <div className="space-y-3">
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-display font-bold text-foreground mb-1">Preferred material?</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Select all that interest you</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-lg mx-auto">
                {MATERIALS.map((mat, index) =>
                  renderSelectionCard(mat, isSelected("material", mat.id), () => handleMultiSelect("material", mat.id), index)
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 sm:pt-6 border-t">
              <Button variant="ghost" onClick={goBack} size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={goNext} size="sm" className="text-muted-foreground">
                  <SkipForward className="mr-1 h-4 w-4" />
                  Skip
                </Button>
                <Button onClick={goNext} size="sm" className="px-4 sm:px-6">
                  See Results
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {currentStep === "results" && (
          <div className="text-center py-8 sm:py-12 space-y-6 sm:space-y-8">
            <div className="inline-flex p-4 sm:p-6 rounded-full bg-accent/10">
              <Sparkle weight="duotone" className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Your style profile is ready!
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
              We'll use your preferences to show you the most relevant frames.
            </p>

            {/* Summary */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4 sm:p-6 text-left space-y-2 sm:space-y-3">
                <h3 className="font-display font-semibold text-foreground text-sm sm:text-base">Your Preferences:</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
                  {answers.gender && (
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">For:</span>
                      <span className="capitalize">{answers.gender}</span>
                    </li>
                  )}
                  {answers.faceShape && (
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Face Shape:</span>
                      <span className="capitalize">{answers.faceShape}</span>
                    </li>
                  )}
                  {answers.frameShape?.length ? (
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Frame Shapes:</span>
                      <span className="capitalize">{answers.frameShape.join(", ")}</span>
                    </li>
                  ) : null}
                  {answers.material?.length ? (
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">Materials:</span>
                      <span className="capitalize">{answers.material.join(", ")}</span>
                    </li>
                  ) : null}
                </ul>
                {!answers.gender && !answers.faceShape && !answers.frameShape?.length && !answers.material?.length && (
                  <p className="text-xs text-muted-foreground italic">No preferences set — we'll show you everything!</p>
                )}
              </CardContent>
            </Card>

            {/* Top Picks Preview */}
            {topPicks.length > 0 && (
              <div className="max-w-2xl mx-auto space-y-4">
                <h3 className="font-display font-semibold text-foreground text-sm sm:text-base">
                  Top Picks for You ({topPicks.length} matches)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {topPicks.slice(0, 4).map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Eyeglasses className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-accent">{product.matchScore}% match</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button size="lg" onClick={savePreferences} disabled={isSubmitting} className="px-6 sm:px-8">
                {isSubmitting ? "Saving..." : "Shop My Recommendations"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={goBack}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StyleQuiz;

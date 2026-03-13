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
  Sun,
  Monitor,
  BookOpen,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FaceShapeIllustration, FrameStyleIllustration } from "@/components/onboarding/illustrations";
import {
  FACE_SHAPES,
  FRAME_SHAPES,
  MATERIALS,
  GENDER_OPTIONS,
  USAGE_OPTIONS,
  BUDGET_OPTIONS,
  type QuizPreferences,
} from "@/components/onboarding/quiz-constants";

const cardBaseStyles = "group relative cursor-pointer transition-all duration-300 ease-out";
const cardHoverStyles = "hover:shadow-xl hover:-translate-y-1 hover:border-accent/60";
const cardSelectedStyles = "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5";
const cardUnselectedStyles = "hover:bg-muted/40";

type QuizStep = "welcome" | "gender" | "face-shape" | "frame-shape" | "material" | "usage" | "budget" | "results";

const USAGE_ICONS: Record<string, typeof Eyeglasses> = {
  everyday: Eyeglasses,
  computer: Monitor,
  reading: BookOpen,
  outdoor: Sun,
};

const StyleQuiz = () => {
  useSEO({
    title: "Style Quiz – Find Your Perfect Frames | M&H Eyewear",
    description: "Take our style quiz to discover frames that match your face shape, lifestyle, and personal style. Personalized eyewear recommendations.",
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

  const steps: QuizStep[] = ["welcome", "gender", "face-shape", "frame-shape", "material", "usage", "budget", "results"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = (currentIndex / (steps.length - 1)) * 100;

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
    setAnswers({ ...answers, [key]: value });
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
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const savePreferences = async () => {
    if (!user) {
      toast({
        title: "Sign in to save",
        description: "Create an account to save your style preferences.",
      });
      navigate("/eyewear");
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
            usage: answers.usage,
            budget: answers.budget,
          },
        },
      });

      toast({
        title: "Preferences saved!",
        description: "We'll show you personalized recommendations.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSubmitting(false);
      navigate("/eyewear?from=quiz");
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
      className={cn(
        cardBaseStyles,
        cardHoverStyles,
        "p-4",
        selected ? cardSelectedStyles : cardUnselectedStyles
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
              selected && "text-accent scale-105 drop-shadow-lg"
            )}
          >
            {illustration}
          </div>
        )}
        <div className="transition-all duration-200">
          <p
            className={cn(
              "font-medium text-foreground transition-colors duration-200",
              selected ? "text-accent" : "group-hover:text-accent/80"
            )}
          >
            {item.label}
          </p>
          <p
            className={cn(
              "text-xs text-muted-foreground transition-colors duration-200",
              selected && "text-accent/70"
            )}
          >
            {item.description}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
          selected
            ? "bg-accent scale-100 opacity-100"
            : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
        )}
      >
        <Check
          className={cn(
            "h-3 w-3 transition-colors duration-200",
            selected ? "text-accent-foreground" : "text-accent"
          )}
          weight="bold"
        />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="h-16 lg:h-[104px]" />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        {currentStep !== "welcome" && currentStep !== "results" && (
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentIndex} of {steps.length - 2}
            </p>
          </div>
        )}

        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <div className="text-center py-12 space-y-8">
            <div className="inline-flex p-6 rounded-full bg-accent/10">
              <Sparkle weight="duotone" className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground">
              Let's find your perfect frames
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Answer a few quick questions about your style preferences, and we'll recommend
              frames that match your unique look.
            </p>
            <Button size="lg" onClick={goNext} className="px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Gender Step */}
        {currentStep === "gender" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Who are these for?</h2>
              <p className="text-muted-foreground">Help us narrow down the best options</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {GENDER_OPTIONS.map((option, index) =>
                renderSelectionCard(
                  option,
                  isSelected("gender", option.id),
                  () => handleSingleSelect("gender", option.id),
                  index
                )
              )}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.gender} className="px-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Face Shape Step */}
        {currentStep === "face-shape" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">What's your face shape?</h2>
              <p className="text-muted-foreground">Don't worry if you're unsure – you can change this later</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {FACE_SHAPES.map((shape, index) => {
                const selected = isSelected("faceShape", shape.id);
                return renderSelectionCard(
                  shape,
                  selected,
                  () => handleSingleSelect("faceShape", shape.id),
                  index,
                  <FaceShapeIllustration shape={shape.id} selected={selected} />
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.faceShape} className="px-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Frame Shape Step */}
        {currentStep === "frame-shape" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">What frame shapes do you like?</h2>
              <p className="text-muted-foreground">Select all that appeal to you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRAME_SHAPES.map((shape, index) => {
                const selected = isSelected("frameShape", shape.id);
                return renderSelectionCard(
                  shape,
                  selected,
                  () => handleMultiSelect("frameShape", shape.id),
                  index,
                  <FrameStyleIllustration style={shape.id} selected={selected} />
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.frameShape?.length} className="px-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Material Step */}
        {currentStep === "material" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Preferred frame material?</h2>
              <p className="text-muted-foreground">Select all that interest you</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {MATERIALS.map((mat, index) =>
                renderSelectionCard(
                  mat,
                  isSelected("material", mat.id),
                  () => handleMultiSelect("material", mat.id),
                  index
                )
              )}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.material?.length} className="px-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Usage Step */}
        {currentStep === "usage" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">How will you use these frames?</h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {USAGE_OPTIONS.map((option, index) => {
                const Icon = USAGE_ICONS[option.id] || Eyeglasses;
                const selected = isSelected("usage", option.id);
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      selected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onClick={() => handleMultiSelect("usage", option.id)}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-full transition-all duration-300",
                          selected ? "bg-accent/20 scale-110" : "bg-muted group-hover:bg-accent/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 transition-all duration-300",
                            selected ? "text-accent" : "text-foreground group-hover:text-accent/80"
                          )}
                          weight={selected ? "fill" : "light"}
                        />
                      </div>
                      <div className="transition-all duration-200">
                        <p
                          className={cn(
                            "font-medium text-foreground transition-colors duration-200",
                            selected ? "text-accent" : "group-hover:text-accent/80"
                          )}
                        >
                          {option.label}
                        </p>
                        <p
                          className={cn(
                            "text-sm text-muted-foreground transition-colors duration-200",
                            selected && "text-accent/70"
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                    </CardContent>
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                        selected
                          ? "bg-accent scale-100 opacity-100"
                          : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 transition-colors duration-200",
                          selected ? "text-accent-foreground" : "text-accent"
                        )}
                        weight="bold"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.usage?.length} className="px-6">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Budget Step */}
        {currentStep === "budget" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">What's your budget?</h2>
              <p className="text-muted-foreground">We'll find the best options in your range</p>
            </div>
            <div className="grid gap-3 max-w-md mx-auto">
              {BUDGET_OPTIONS.map((option, index) => {
                const selected = isSelected("budget", option.id);
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      cardBaseStyles,
                      "hover:shadow-lg hover:-translate-y-0.5",
                      selected
                        ? "ring-2 ring-accent border-accent bg-accent/5 shadow-lg shadow-accent/10"
                        : "hover:border-accent/50 hover:bg-muted/40"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onClick={() => handleSingleSelect("budget", option.id)}
                  >
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="transition-all duration-200">
                        <p
                          className={cn(
                            "font-medium text-foreground transition-colors duration-200",
                            selected ? "text-accent" : "group-hover:text-accent/80"
                          )}
                        >
                          {option.label}
                        </p>
                        <p
                          className={cn(
                            "text-sm text-muted-foreground transition-colors duration-200",
                            selected && "text-accent/70"
                          )}
                        >
                          {option.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                          selected
                            ? "bg-accent scale-100 opacity-100"
                            : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-40"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 transition-colors duration-200",
                            selected ? "text-accent-foreground" : "text-accent"
                          )}
                          weight="bold"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between pt-6 border-t">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.budget} className="px-6">
                See Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === "results" && (
          <div className="text-center py-12 space-y-8">
            <div className="inline-flex p-6 rounded-full bg-accent/10">
              <Sparkle weight="duotone" className="h-12 w-12 text-accent" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Your style profile is ready!
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Based on your preferences, we've identified frames that will suit you best.
            </p>

            {/* Summary */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-left space-y-3">
                <h3 className="font-display font-semibold text-foreground">Your Preferences:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {answers.gender && (
                    <li className="flex items-center gap-2">
                      <span className="font-medium text-foreground">For:</span>
                      <span className="capitalize">{answers.gender}</span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Face Shape:</span>
                    <span className="capitalize">{answers.faceShape}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Frame Shapes:</span>
                    <span className="capitalize">{answers.frameShape?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Materials:</span>
                    <span className="capitalize">{answers.material?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Usage:</span>
                    <span className="capitalize">{answers.usage?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Budget:</span>
                    <span>{BUDGET_OPTIONS.find((b) => b.id === answers.budget)?.label}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Top Picks Preview */}
            {topPicks.length > 0 && (
              <div className="max-w-2xl mx-auto space-y-4">
                <h3 className="font-display font-semibold text-foreground">
                  Top Picks for You ({topPicks.length} matches)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {topPicks.slice(0, 4).map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={savePreferences} disabled={isSubmitting} className="px-8">
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

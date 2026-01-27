import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkle, 
  ArrowRight, 
  ArrowLeft,
  Circle,
  Square,
  Hexagon,
  Diamond,
  Eyeglasses,
  Sun,
  Monitor,
  BookOpen,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type QuizStep = "welcome" | "face-shape" | "frame-style" | "colors" | "usage" | "budget" | "results";

interface QuizAnswers {
  faceShape?: string;
  frameStyle?: string[];
  colors?: string[];
  usage?: string[];
  budget?: string;
}

const faceShapes = [
  { id: "oval", name: "Oval", icon: Circle, description: "Balanced proportions" },
  { id: "round", name: "Round", icon: Circle, description: "Soft, curved features" },
  { id: "square", name: "Square", icon: Square, description: "Strong jawline" },
  { id: "heart", name: "Heart", icon: Diamond, description: "Wider forehead" },
  { id: "oblong", name: "Oblong", icon: Hexagon, description: "Longer face shape" },
];

const frameStyles = [
  { id: "classic", name: "Classic", description: "Timeless and elegant" },
  { id: "modern", name: "Modern", description: "Sleek and contemporary" },
  { id: "bold", name: "Bold", description: "Statement-making frames" },
  { id: "minimalist", name: "Minimalist", description: "Clean and simple" },
  { id: "vintage", name: "Vintage", description: "Retro-inspired looks" },
];

const colorOptions = [
  { id: "black", name: "Black", color: "#1a1a1a" },
  { id: "tortoise", name: "Tortoise", color: "#8B4513" },
  { id: "gold", name: "Gold", color: "#D4AF37" },
  { id: "silver", name: "Silver", color: "#C0C0C0" },
  { id: "blue", name: "Blue", color: "#1e3a5f" },
  { id: "transparent", name: "Clear", color: "#E8E8E8" },
];

const usageOptions = [
  { id: "everyday", name: "Everyday Wear", icon: Eyeglasses, description: "All-day comfort" },
  { id: "computer", name: "Computer/Screen", icon: Monitor, description: "Blue light blocking" },
  { id: "reading", name: "Reading", icon: BookOpen, description: "Close-up work" },
  { id: "outdoor", name: "Outdoor/Sun", icon: Sun, description: "UV protection" },
];

const budgetOptions = [
  { id: "budget", name: "Under ₦50,000", description: "Great value options" },
  { id: "standard", name: "₦50,000 - ₦150,000", description: "Popular choices" },
  { id: "premium", name: "₦150,000 - ₦300,000", description: "Premium quality" },
  { id: "luxury", name: "Over ₦300,000", description: "Designer collections" },
];

const StyleQuiz = () => {
  const [currentStep, setCurrentStep] = useState<QuizStep>("welcome");
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const steps: QuizStep[] = ["welcome", "face-shape", "frame-style", "colors", "usage", "budget", "results"];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

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

  const handleSelect = (key: keyof QuizAnswers, value: string, multiSelect = false) => {
    if (multiSelect) {
      const current = (answers[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [key]: updated });
    } else {
      setAnswers({ ...answers, [key]: value });
    }
  };

  const isSelected = (key: keyof QuizAnswers, value: string) => {
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
      const preferencesJson = JSON.parse(JSON.stringify(answers));
      const { error } = await supabase
        .from("profiles")
        .update({
          frame_preferences: preferencesJson,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "We'll show you personalized recommendations.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSubmitting(false);
      navigate("/eyewear");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Spacer for fixed navigation */}
      <div className="h-16 lg:h-[104px]" />

      <div className="max-w-3xl mx-auto px-4 py-12">
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

        {/* Face Shape Step */}
        {currentStep === "face-shape" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What's your face shape?
              </h2>
              <p className="text-muted-foreground">
                Don't worry if you're unsure – you can change this later
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {faceShapes.map((shape) => {
                const Icon = shape.icon;
                return (
                  <Card
                    key={shape.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected("faceShape", shape.id) && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => handleSelect("faceShape", shape.id)}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-muted">
                        <Icon className="h-8 w-8 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{shape.name}</p>
                        <p className="text-xs text-muted-foreground">{shape.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.faceShape}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Frame Style Step */}
        {currentStep === "frame-style" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What styles do you like?
              </h2>
              <p className="text-muted-foreground">Select all that appeal to you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {frameStyles.map((style) => (
                <Card
                  key={style.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected("frameStyle", style.id) && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => handleSelect("frameStyle", style.id, true)}
                >
                  <CardContent className="p-6">
                    <p className="font-medium text-foreground">{style.name}</p>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.frameStyle?.length}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Colors Step */}
        {currentStep === "colors" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Preferred frame colors?
              </h2>
              <p className="text-muted-foreground">Select your favorite colors</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isSelected("colors", color.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => handleSelect("colors", color.id, true)}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-border"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs font-medium text-foreground">{color.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.colors?.length}>
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
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                How will you use these frames?
              </h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {usageOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isSelected("usage", option.id) && "ring-2 ring-primary border-primary"
                    )}
                    onClick={() => handleSelect("usage", option.id, true)}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-full bg-muted">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.usage?.length}>
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
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                What's your budget?
              </h2>
              <p className="text-muted-foreground">We'll find the best options in your range</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgetOptions.map((option) => (
                <Card
                  key={option.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected("budget", option.id) && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => handleSelect("budget", option.id)}
                >
                  <CardContent className="p-6">
                    <p className="font-medium text-foreground">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={goNext} disabled={!answers.budget}>
                See Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === "results" && (
          <div className="text-center py-12 space-y-8">
            <div className="inline-flex p-6 rounded-full bg-primary/10">
              <Sparkle weight="duotone" className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Your style profile is ready!
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Based on your preferences, we've identified frames that will suit you best. 
              Browse our collection to see your personalized recommendations.
            </p>

            {/* Summary */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-left space-y-3">
                <h3 className="font-medium text-foreground">Your Preferences:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Face Shape: {answers.faceShape}</li>
                  <li>Styles: {answers.frameStyle?.join(", ")}</li>
                  <li>Colors: {answers.colors?.join(", ")}</li>
                  <li>Usage: {answers.usage?.join(", ")}</li>
                  <li>Budget: {budgetOptions.find(b => b.id === answers.budget)?.name}</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={savePreferences} disabled={isSubmitting}>
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

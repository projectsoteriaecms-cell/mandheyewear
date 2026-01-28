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
  Eyeglasses,
  Sun,
  Monitor,
  BookOpen,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FaceShapeIllustration, FrameStyleIllustration } from "@/components/onboarding/illustrations";

// Premium card styles with micro-animations
const cardBaseStyles = "group relative cursor-pointer transition-all duration-300 ease-out";
const cardHoverStyles = "hover:shadow-xl hover:-translate-y-1 hover:border-accent/60";
const cardSelectedStyles = "border-accent bg-accent/5 ring-2 ring-accent shadow-lg shadow-accent/10 -translate-y-0.5";
const cardUnselectedStyles = "hover:bg-muted/40";

type QuizStep = "welcome" | "face-shape" | "frame-style" | "colors" | "usage" | "budget" | "results";

interface QuizAnswers {
  faceShape?: string;
  frameStyle?: string[];
  colors?: string[];
  usage?: string[];
  budget?: string;
}

const faceShapes = [
  { id: "oval", name: "Oval", description: "Balanced proportions" },
  { id: "round", name: "Round", description: "Soft, curved features" },
  { id: "square", name: "Square", description: "Strong jawline" },
  { id: "heart", name: "Heart", description: "Wider forehead" },
  { id: "oblong", name: "Oblong", description: "Longer face shape" },
] as const;

const frameStyles = [
  { id: "classic", name: "Classic", description: "Timeless and elegant" },
  { id: "modern", name: "Modern", description: "Sleek and contemporary" },
  { id: "bold", name: "Bold", description: "Statement-making frames" },
  { id: "minimalist", name: "Minimalist", description: "Clean and simple" },
  { id: "vintage", name: "Vintage", description: "Retro-inspired looks" },
] as const;

const colorOptions = [
  { id: "black", name: "Black", gradient: "bg-gradient-to-br from-zinc-900 to-black" },
  { id: "tortoise", name: "Tortoise", gradient: "bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950" },
  { id: "gold", name: "Gold", gradient: "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600" },
  { id: "silver", name: "Silver", gradient: "bg-gradient-to-br from-gray-200 via-gray-400 to-gray-500" },
  { id: "blue", name: "Blue", gradient: "bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900" },
  { id: "transparent", name: "Clear", gradient: "bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-border" },
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

        {/* Face Shape Step */}
        {currentStep === "face-shape" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                What's your face shape?
              </h2>
              <p className="text-muted-foreground">
                Don't worry if you're unsure – you can change this later
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {faceShapes.map((shape, index) => {
                const selected = isSelected("faceShape", shape.id);
                return (
                  <Card
                    key={shape.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      selected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSelect("faceShape", shape.id)}
                  >
                    <CardContent className="p-5 text-center space-y-3">
                      <div className={cn(
                        "w-16 h-20 mx-auto transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:drop-shadow-md",
                        selected && "text-accent scale-105 drop-shadow-lg"
                      )}>
                        <FaceShapeIllustration 
                          shape={shape.id} 
                          selected={selected}
                        />
                      </div>
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium text-foreground transition-colors duration-200",
                          selected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{shape.name}</p>
                        <p className={cn(
                          "text-xs text-muted-foreground transition-colors duration-200",
                          selected && "text-accent/70"
                        )}>{shape.description}</p>
                      </div>
                    </CardContent>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      selected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        selected ? "text-accent-foreground" : "text-accent"
                      )} weight="bold" />
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
              <Button onClick={goNext} disabled={!answers.faceShape} className="px-6">
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
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                What styles do you like?
              </h2>
              <p className="text-muted-foreground">Select all that appeal to you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameStyles.map((style, index) => {
                const selected = isSelected("frameStyle", style.id);
                return (
                  <Card
                    key={style.id}
                    className={cn(
                      cardBaseStyles,
                      cardHoverStyles,
                      selected ? cardSelectedStyles : cardUnselectedStyles
                    )}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSelect("frameStyle", style.id, true)}
                  >
                    <CardContent className="p-5 text-center space-y-4">
                      <div className={cn(
                        "w-full h-12 max-w-[160px] mx-auto transition-all duration-300 ease-out",
                        "group-hover:scale-110 group-hover:drop-shadow-md",
                        selected && "text-accent scale-105 drop-shadow-lg"
                      )}>
                        <FrameStyleIllustration 
                          style={style.id} 
                          selected={selected}
                        />
                      </div>
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium text-foreground transition-colors duration-200",
                          selected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{style.name}</p>
                        <p className={cn(
                          "text-sm text-muted-foreground transition-colors duration-200",
                          selected && "text-accent/70"
                        )}>{style.description}</p>
                      </div>
                    </CardContent>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      selected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        selected ? "text-accent-foreground" : "text-accent"
                      )} weight="bold" />
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
              <Button onClick={goNext} disabled={!answers.frameStyle?.length} className="px-6">
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
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                Preferred frame colors?
              </h2>
              <p className="text-muted-foreground">Select your favorite colors</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {colorOptions.map((color, index) => {
                const selected = isSelected("colors", color.id);
                return (
                  <Card
                    key={color.id}
                    className={cn(
                      cardBaseStyles,
                      "p-4 hover:shadow-lg hover:-translate-y-1",
                      selected 
                        ? "ring-2 ring-accent border-accent shadow-lg shadow-accent/10 -translate-y-0.5" 
                        : "hover:border-accent/50"
                    )}
                    style={{ 
                      animationDelay: `${index * 30}ms`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSelect("colors", color.id, true)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full shadow-inner transition-all duration-300 ease-out",
                          "group-hover:scale-115 group-hover:shadow-lg",
                          selected && "scale-110 ring-2 ring-accent/50 ring-offset-2 ring-offset-background",
                          color.gradient
                        )}
                      />
                      <span className={cn(
                        "text-sm font-medium text-foreground transition-colors duration-200",
                        selected ? "text-accent" : "group-hover:text-accent/80"
                      )}>{color.name}</span>
                    </div>
                    <div className={cn(
                      "absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                      selected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-2.5 w-2.5 transition-colors duration-200",
                        selected ? "text-accent-foreground" : "text-accent"
                      )} weight="bold" />
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
              <Button onClick={goNext} disabled={!answers.colors?.length} className="px-6">
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
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                How will you use these frames?
              </h2>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {usageOptions.map((option, index) => {
                const Icon = option.icon;
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
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSelect("usage", option.id, true)}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        selected ? "bg-accent/20 scale-110" : "bg-muted group-hover:bg-accent/10"
                      )}>
                        <Icon className={cn(
                          "h-6 w-6 transition-all duration-300",
                          selected ? "text-accent" : "text-foreground group-hover:text-accent/80"
                        )} weight={selected ? "fill" : "light"} />
                      </div>
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium text-foreground transition-colors duration-200",
                          selected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{option.name}</p>
                        <p className={cn(
                          "text-sm text-muted-foreground transition-colors duration-200",
                          selected && "text-accent/70"
                        )}>{option.description}</p>
                      </div>
                    </CardContent>
                    <div className={cn(
                      "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      selected 
                        ? "bg-accent scale-100 opacity-100" 
                        : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50"
                    )}>
                      <Check className={cn(
                        "h-3 w-3 transition-colors duration-200",
                        selected ? "text-accent-foreground" : "text-accent"
                      )} weight="bold" />
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
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                What's your budget?
              </h2>
              <p className="text-muted-foreground">We'll find the best options in your range</p>
            </div>

            <div className="grid gap-3 max-w-md mx-auto">
              {budgetOptions.map((option, index) => {
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
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => handleSelect("budget", option.id)}
                  >
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="transition-all duration-200">
                        <p className={cn(
                          "font-medium text-foreground transition-colors duration-200",
                          selected ? "text-accent" : "group-hover:text-accent/80"
                        )}>{option.name}</p>
                        <p className={cn(
                          "text-sm text-muted-foreground transition-colors duration-200",
                          selected && "text-accent/70"
                        )}>{option.description}</p>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                        selected 
                          ? "bg-accent scale-100 opacity-100" 
                          : "bg-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-40"
                      )}>
                        <Check className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          selected ? "text-accent-foreground" : "text-accent"
                        )} weight="bold" />
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
              Browse our collection to see your personalized recommendations.
            </p>

            {/* Summary */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-left space-y-4">
                <h3 className="font-display font-semibold text-foreground">Your Preferences:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Face Shape:</span> 
                    <span className="capitalize">{answers.faceShape}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Styles:</span> 
                    <span className="capitalize">{answers.frameStyle?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Colors:</span> 
                    <span className="capitalize">{answers.colors?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Usage:</span> 
                    <span className="capitalize">{answers.usage?.join(", ")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Budget:</span> 
                    <span>{budgetOptions.find(b => b.id === answers.budget)?.name}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

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

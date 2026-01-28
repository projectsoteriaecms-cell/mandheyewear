import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Scan, Palette, Target } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  userName?: string | null;
}

export const WelcomeStep = ({ onNext, userName }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Let's personalize your eyewear experience. In just a few minutes, we'll find your perfect frames.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 max-w-xl mx-auto">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Scan className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-sm">Face Scan</h3>
            <p className="text-xs text-muted-foreground">Get precise measurements</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Palette className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="font-medium text-sm">Style Quiz</h3>
            <p className="text-xs text-muted-foreground">Discover your style</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium text-sm">Personalized</h3>
            <p className="text-xs text-muted-foreground">Perfect matches for you</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button onClick={onNext} size="lg" variant="hero" className="px-8">
          Let's Get Started
          <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

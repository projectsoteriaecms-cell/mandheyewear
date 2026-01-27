import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkle, ArrowRight, CheckCircle } from "@phosphor-icons/react";

const benefits = [
  "Personalized frame recommendations",
  "Find your perfect fit in 60 seconds",
  "Based on your face shape & style",
];

export const QuizPromo = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-sm font-medium">
              <Sparkle weight="duotone" className="h-4 w-4" />
              AI-Powered Recommendations
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold">
              Find your perfect frame in 60 seconds
            </h2>
            
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              Answer a few questions about your style preferences, face shape, and lifestyle. 
              We'll recommend frames that fit you perfectly.
            </p>

            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-primary-foreground/90">
                  <CheckCircle weight="duotone" className="h-5 w-5 text-accent" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Button 
              size="lg" 
              variant="secondary"
              asChild 
              className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/style-quiz" className="flex items-center gap-2">
                Start the Style Quiz
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Visual element - Frame style previews */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-4xl mb-3">🔲</div>
                  <h4 className="font-semibold mb-1">Square</h4>
                  <p className="text-sm text-primary-foreground/70">Bold & Angular</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-4xl mb-3">⭕</div>
                  <h4 className="font-semibold mb-1">Round</h4>
                  <p className="text-sm text-primary-foreground/70">Soft & Classic</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-4xl mb-3">😺</div>
                  <h4 className="font-semibold mb-1">Cat-eye</h4>
                  <p className="text-sm text-primary-foreground/70">Retro Chic</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm border border-primary-foreground/10">
                  <div className="text-4xl mb-3">✈️</div>
                  <h4 className="font-semibold mb-1">Aviator</h4>
                  <p className="text-sm text-primary-foreground/70">Timeless Cool</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

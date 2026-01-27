import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkle, ArrowRight, CheckCircle } from "@phosphor-icons/react";

const benefits = [
  "Personalized frame recommendations",
  "Find your perfect fit in 60 seconds",
  "Based on your face shape & style",
];

const frameStyles = [
  { emoji: "🔲", name: "Square", desc: "Bold & Angular" },
  { emoji: "⭕", name: "Round", desc: "Soft & Classic" },
  { emoji: "🐱", name: "Cat-eye", desc: "Retro Chic" },
  { emoji: "✈️", name: "Aviator", desc: "Timeless Cool" },
];

export const QuizPromo = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle accent gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-fade-in-up">
              <Sparkle weight="duotone" className="h-4 w-4" />
              AI-Powered Style Quiz
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight animate-fade-in-up stagger-delay-1">
              Find your perfect frame in{" "}
              <span className="text-primary">60 seconds</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in-up stagger-delay-2">
              Answer a few questions about your style preferences, face shape, and lifestyle. 
              We'll recommend frames that fit you perfectly.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li 
                  key={benefit} 
                  className={`flex items-center gap-4 animate-fade-in-left stagger-delay-${index + 1}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle weight="fill" className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button 
              size="lg" 
              asChild 
              className="group h-14 px-8 text-base shadow-float hover:shadow-card-hover transition-all relative overflow-hidden animate-fade-in-up stagger-delay-4"
            >
              <Link to="/style-quiz" className="flex items-center gap-3">
                <span className="absolute inset-0 shimmer-bg" />
                <span className="relative z-10">Start the Style Quiz</span>
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
              </Link>
            </Button>
          </div>

          {/* Visual element - Frame style grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-5">
              {frameStyles.map((style, index) => (
                <div 
                  key={style.name}
                  className={`bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover-lift cursor-pointer animate-fade-in-up stagger-delay-${index + 1} ${
                    index === 1 || index === 2 ? 'mt-8' : ''
                  }`}
                >
                  <div className="text-5xl mb-4">{style.emoji}</div>
                  <h4 className="font-display font-semibold text-foreground text-lg">{style.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{style.desc}</p>
                </div>
              ))}
            </div>

            {/* Floating accent element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl animate-float-slow" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

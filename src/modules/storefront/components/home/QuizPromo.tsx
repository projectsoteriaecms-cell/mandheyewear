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
      {/* Animated background orbs */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-accent/10 blur-2xl animate-orbit-slow" />
      <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-primary/5 blur-3xl animate-orbit-reverse" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-fade-in-up">
              <Sparkle weight="duotone" className="h-4 w-4 animate-glow-pulse" />
              AI-Powered Style Quiz
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight animate-fade-in-up stagger-delay-1">
              Find your perfect frame in{" "}
               <span className="text-flame relative">
                 60 seconds
                 <span className="absolute -bottom-1 left-0 w-full h-1 bg-flame/20 rounded-full" />
               </span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in-up stagger-delay-2">
              Answer a few questions about your style preferences, face shape, and lifestyle. 
              We'll recommend frames that fit you perfectly.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li 
                  key={benefit} 
                  className="flex items-center gap-4 animate-fade-in-left"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle weight="fill" className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button 
              size="lg" 
              asChild 
              className="group h-14 px-8 text-base shadow-float hover:shadow-card-hover transition-all relative overflow-hidden animate-fade-in-up hover:scale-105 bg-flame hover:bg-flame/90 text-white"
              style={{ animationDelay: '0.5s' }}
            >
              <Link to="/style-quiz" className="flex items-center gap-3">
                <span className="absolute inset-0 shimmer-bg" />
                <span className="relative z-10">Start the Style Quiz</span>
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
              </Link>
            </Button>
          </div>

          {/* Visual element - Frame style grid with 3D hover */}
          <div className="relative hidden lg:block perspective-1500">
            <div className="grid grid-cols-2 gap-5">
              {frameStyles.map((style, index) => (
                <div 
                  key={style.name}
                  className={`bg-card rounded-2xl p-6 border border-border hover:border-primary/30 card-3d-hover cursor-pointer animate-cascade ${
                    index === 1 || index === 2 ? 'mt-8' : ''
                  }`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">{style.emoji}</div>
                  <h4 className="font-display font-semibold text-foreground text-lg">{style.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{style.desc}</p>
                </div>
              ))}
            </div>

            {/* Floating accent elements with orbit animation */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/20 blur-2xl animate-float-slow" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            
            {/* Decorative sparkle */}
            <div className="absolute top-1/2 right-0 transform translate-x-1/2">
              <Sparkle weight="fill" className="h-8 w-8 text-accent animate-pulse-soft" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

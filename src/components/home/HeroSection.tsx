import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag } from "lucide-react";
import heroEyewear from "@/assets/hero-eyewear.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroEyewear} 
          alt="Person wearing stylish eyewear" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
          Your perfect pair is waiting
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Take the Style Quiz and get personalized frame recommendations based on your face shape and preferences.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8" asChild>
            <Link to="/style-quiz">
              <Sparkles className="mr-2 h-5 w-5" />
              Take the Style Quiz
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 bg-background/50 backdrop-blur-sm" asChild>
            <Link to="/eyewear">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Eyeglasses
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

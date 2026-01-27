import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import heroEyewear from "@/assets/hero-eyewear.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                Precision Eyecare • Premium Eyewear
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Your path to{" "}
                <span className="text-primary">clearer vision</span>{" "}
                begins with us
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience the perfect blend of medical expertise and fashion-forward eyewear. 
                Find frames that fit your style and vision needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group">
                <Link to="/style-quiz" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Take the Style Quiz
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/eyewear" className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shop Eyeglasses
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Free Eye Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Virtual Try-On</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Free Shipping</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroEyewear}
                alt="Person wearing stylish eyeglasses"
                className="w-full h-[350px] sm:h-[400px] lg:h-[500px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👓</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">50K+ Happy Customers</p>
                  <p className="text-sm text-muted-foreground">Trusted across Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

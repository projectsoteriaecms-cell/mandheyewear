import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkle, Bag, ArrowRight, Eye } from "@phosphor-icons/react";
import heroEyewear from "@/assets/hero-eyewear.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-20 lg:py-28">
          {/* Content */}
          <div className="space-y-10 order-2 lg:order-1">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-primary animate-fade-in-up">
              <Eye weight="duotone" className="h-4 w-4" />
              Precision Eyecare • Premium Eyewear
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-semibold text-foreground leading-[1.1] tracking-tight animate-fade-in-up stagger-delay-1">
                Transforming vision with{" "}
                <span className="text-primary relative">
                  clarity
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0 9c50-6 100-6 200 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>{" "}
                & confidence
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up stagger-delay-2">
                Not just eyewear — a unique blend of elegance, cutting-edge tech, and affordability that defines your style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-delay-3">
              <Button size="lg" asChild className="group h-14 px-8 text-base shadow-float hover:shadow-card-hover transition-all relative overflow-hidden">
                <Link to="/style-quiz" className="flex items-center gap-3">
                  <span className="absolute inset-0 shimmer-bg" />
                  <Sparkle weight="duotone" className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Find Your Frame</span>
                  <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base border-2 hover:bg-primary/5 hover-glow">
                <Link to="/eyewear" className="flex items-center gap-3">
                  <Bag weight="light" className="h-5 w-5" />
                  Shop Collection
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-border/50 animate-fade-in-up stagger-delay-4">
              <div className="flex items-center gap-3 hover-lift cursor-default">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Free Eye Exams</p>
                  <p className="text-xs text-muted-foreground">At all locations</p>
                </div>
              </div>
              <div className="flex items-center gap-3 hover-lift cursor-default">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">📷</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Virtual Try-On</p>
                  <p className="text-xs text-muted-foreground">AI-powered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 hover-lift cursor-default">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-lg">🚚</span>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">Orders over ₦50k</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image with floating elements */}
          <div className="relative order-1 lg:order-2">
            {/* Main image container */}
            <div className="relative rounded-3xl overflow-hidden shadow-float animate-scale-in">
              <img
                src={heroEyewear}
                alt="Person wearing stylish eyeglasses"
                className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
              />
              {/* Elegant overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating testimonial card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-5 rounded-2xl shadow-float border border-border/50 hidden lg:block backdrop-blur-sm max-w-[280px] animate-float">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                  50K+
                </div>
                <div>
                  <p className="font-semibold text-foreground">Happy Customers</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Trusted across Nigeria for quality eyecare</p>
                </div>
              </div>
            </div>

            {/* Floating product card - top right */}
            <div className="absolute -top-4 -right-4 bg-card p-4 rounded-2xl shadow-float border border-border/50 hidden lg:block backdrop-blur-sm animate-float-slow" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  👓
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">New Arrival</p>
                  <p className="font-semibold text-foreground">Classic Aviator</p>
                  <p className="text-sm font-bold text-accent">₦45,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

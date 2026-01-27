import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Ruler, ArrowRight } from "@phosphor-icons/react";
import frame3 from "@/assets/frame-3.jpg";

const features = [
  { 
    icon: Camera, 
    title: "Live Camera", 
    description: "Real-time frame preview" 
  },
  { 
    icon: Scan, 
    title: "Face Analysis", 
    description: "AI maps your features" 
  },
  { 
    icon: Ruler, 
    title: "Perfect Fit", 
    description: "Precise measurements" 
  },
];

export const VirtualTryOn = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image with floating UI elements */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-float animate-scale-in">
              <img
                src={frame3}
                alt="Virtual try-on experience"
                className="w-full h-[450px] lg:h-[500px] object-cover"
              />
              
              {/* Elegant dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Floating detection badge */}
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-float border border-white/50 animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Scan weight="duotone" className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Face detected</p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
                      <p className="text-xs text-muted-foreground">AI analysis ready</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating product card */}
              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-float border border-white/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Now Trying</p>
                    <p className="font-display font-semibold text-foreground text-lg">Classic Aviator</p>
                    <p className="text-accent font-bold">₦45,000</p>
                  </div>
                  <Button size="sm" className="shadow-sm hover:scale-105 transition-transform">Add to Cart</Button>
                </div>
              </div>
            </div>

            {/* Floating measurements card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-float border border-border hidden lg:block animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ruler weight="duotone" className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Frame Width</p>
                  <p className="font-semibold text-foreground">138mm - Perfect Fit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in-up">
              <Camera weight="duotone" className="h-4 w-4" />
              Virtual Try-On Technology
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight animate-fade-in-up stagger-delay-1">
              See how frames look{" "}
              <span className="text-primary">before you buy</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-lg animate-fade-in-up stagger-delay-2">
              Use your camera or upload a photo to see how frames look on you. 
              Our AI technology calculates your face measurements for a perfect fit.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.title} 
                    className={`flex items-center gap-3 bg-card rounded-full pl-2 pr-5 py-2 border border-border hover:border-primary/30 hover-lift animate-fade-in-up stagger-delay-${index + 1}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon weight="duotone" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button 
              size="lg" 
              asChild 
              className="group h-14 px-8 text-base shadow-float hover:shadow-card-hover transition-all relative overflow-hidden animate-fade-in-up stagger-delay-4"
            >
              <Link to="/try-on" className="flex items-center gap-3">
                <span className="absolute inset-0 shimmer-bg" />
                <span className="relative z-10">Try It Now — It's Free</span>
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1 relative z-10" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

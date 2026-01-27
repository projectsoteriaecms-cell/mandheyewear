import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Ruler, ArrowRight } from "@phosphor-icons/react";
import frame3 from "@/assets/frame-3.jpg";

const features = [
  { icon: Camera, title: "Live Camera", description: "Real-time frame preview on your face" },
  { icon: Scan, title: "Face Analysis", description: "AI maps your facial features precisely" },
  { icon: Ruler, title: "Perfect Fit", description: "Get measurements for ideal frame size" },
];

export const VirtualTryOn = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={frame3}
                alt="Virtual try-on experience"
                className="w-full h-[400px] object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Scan weight="duotone" className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Face detected</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Classic Aviator</p>
                    <p className="text-sm text-muted-foreground">₦45,000</p>
                  </div>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Camera weight="duotone" className="h-4 w-4" />
              Virtual Try-On Technology
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Try frames on virtually before you buy
            </h2>
            
            <p className="text-lg text-muted-foreground">
              Use your camera or upload a photo to see how frames look on you. 
              Our AI technology calculates your face measurements for a perfect fit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="bg-card rounded-xl p-4 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Icon weight="duotone" className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button size="lg" asChild className="group">
              <Link to="/try-on" className="flex items-center gap-2">
                Try It Now
                <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

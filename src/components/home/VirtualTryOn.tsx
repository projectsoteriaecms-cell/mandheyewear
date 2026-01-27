import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Scan, Ruler } from "lucide-react";

const features = [
  { icon: Camera, title: "Upload a photo", description: "Use your camera or upload an existing selfie" },
  { icon: Scan, title: "AI analysis", description: "Our technology maps your facial features" },
  { icon: Ruler, title: "Perfect fit", description: "Get measurements for the ideal frame size" },
];

export const VirtualTryOn = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Try frames on virtually
            </h2>
            <p className="text-lg text-muted-foreground">
              Use your camera or upload a photo to see how frames look on you. 
              Our AI technology calculates your face measurements for a perfect fit.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button size="lg" variant="hero" asChild>
              <Link to="/try-on">
                <Camera className="mr-2 h-5 w-5" />
                Try It Now
              </Link>
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-muted flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="inline-flex p-6 rounded-full bg-muted">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Upload your selfie and virtually try on hundreds of frames
                </p>
                <div className="flex justify-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
                  <div className="w-12 h-12 rounded-lg bg-muted animate-pulse delay-100" />
                  <div className="w-12 h-12 rounded-lg bg-muted animate-pulse delay-200" />
                  <div className="w-12 h-12 rounded-lg bg-muted animate-pulse delay-300" />
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

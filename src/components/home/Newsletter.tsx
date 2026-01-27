import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Envelope, PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Welcome to the family!",
      description: "You've been added to our newsletter.",
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="py-24 feature-navy relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <Envelope weight="duotone" className="h-8 w-8 text-accent" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-5">
            Stay in the loop
          </h2>
          
          {/* Description */}
          <p className="text-white/60 mb-10 max-w-lg mx-auto text-lg">
            Get exclusive offers, new arrivals, and eye care tips delivered straight to your inbox.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-5 pr-5 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-accent focus:ring-accent/20 rounded-xl"
                required
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting} 
              className="h-14 px-8 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-semibold shadow-float"
            >
              {isSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe
                  <PaperPlaneTilt weight="bold" className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Privacy Note with perks */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/50 text-sm">
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="h-4 w-4 text-accent" />
              <span>Exclusive offers</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="h-4 w-4 text-accent" />
              <span>Early access</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="h-4 w-4 text-accent" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

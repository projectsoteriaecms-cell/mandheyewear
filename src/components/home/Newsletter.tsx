import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

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
      title: "Welcome!",
      description: "You've been added to our newsletter.",
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Join our newsletter
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Stay up to date on new styles, exclusive promotions, and all things eyewear and eye care.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12"
              required
            />
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-12">
              {isSubmitting ? (
                "Subscribing..."
              ) : (
                <>
                  Subscribe
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

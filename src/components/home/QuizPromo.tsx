import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Target, Heart } from "lucide-react";

const benefits = [
  { icon: Clock, text: "Takes only 60 seconds" },
  { icon: Target, text: "Personalized results" },
  { icon: Heart, text: "Find your perfect fit" },
];

export const QuizPromo = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex p-4 rounded-full bg-accent/10 mb-6">
          <Sparkles className="h-8 w-8 text-accent" />
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
          Find your perfect frame in 60 seconds
        </h2>
        
        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Answer a few questions about your style preferences, face shape, and lifestyle. 
          We'll recommend frames that fit you perfectly.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.text} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{benefit.text}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <Button size="lg" className="text-base px-8" asChild>
          <Link to="/style-quiz">
            <Sparkles className="mr-2 h-5 w-5" />
            Start the Style Quiz
          </Link>
        </Button>
      </div>
    </section>
  );
};

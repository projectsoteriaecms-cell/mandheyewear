import { Eye, Camera, Truck, ArrowCounterClockwise } from "@phosphor-icons/react";

const badges = [
  {
    icon: Eye,
    title: "Free Eye Exams",
    description: "Comprehensive tests at all locations",
    highlight: "Save ₦15,000",
  },
  {
    icon: Camera,
    title: "Virtual Try-On",
    description: "See frames on your face instantly",
    highlight: "AI-Powered",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over ₦50,000",
    highlight: "2-3 Days",
  },
  {
    icon: ArrowCounterClockwise,
    title: "Easy Returns",
    description: "Hassle-free return policy",
    highlight: "30 Days",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3 animate-fade-in-up">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground animate-fade-in-up stagger-delay-1">
            The Soteria & M&H Difference
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.title} 
                className={`group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover-lift text-center animate-fade-in-up stagger-delay-${index + 1}`}
              >
                {/* Highlight badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold shadow-sm animate-float-slow" style={{ animationDelay: `${index * 0.2}s` }}>
                    {badge.highlight}
                  </span>
                </div>

                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <Icon weight="duotone" className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

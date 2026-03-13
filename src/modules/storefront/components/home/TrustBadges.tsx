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
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3 animate-fade-in-up">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-foreground animate-fade-in-up stagger-delay-1">
            The Soteria & M&H Difference
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 perspective-1500">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.title} 
                className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 card-3d-hover text-center animate-pop-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Highlight badge with shimmer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold shadow-gold animate-float-gentle relative overflow-hidden">
                    <span className="relative z-10">{badge.highlight}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </span>
                </div>

                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-500">
                  <Icon weight="duotone" className="h-8 w-8 text-primary group-hover:animate-pulse-soft" />
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

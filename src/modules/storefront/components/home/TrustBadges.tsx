import { Eye, Camera, Truck, ArrowCounterClockwise } from "@phosphor-icons/react";

const badges = [
  {
    icon: Eye,
    title: "Free Eye Exams",
    description: "Comprehensive tests at all locations",
    highlight: "Save ₦15,000",
    isUrgent: true,
  },
  {
    icon: Camera,
    title: "Virtual Try-On",
    description: "See frames on your face instantly",
    highlight: "AI-Powered",
    isUrgent: false,
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over ₦50,000",
    highlight: "2-3 Days",
    isUrgent: false,
  },
  {
    icon: ArrowCounterClockwise,
    title: "Easy Returns",
    description: "Hassle-free return policy",
    highlight: "30 Days",
    isUrgent: false,
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-20 feature-navy relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-mh-gold/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-mh-gold/3 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-mh-gold font-medium uppercase tracking-widest text-sm mb-3 animate-fade-in-up">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white animate-fade-in-up stagger-delay-1">
            The M&H Difference
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 perspective-1500">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.title} 
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-mh-gold/30 card-3d-hover text-center animate-pop-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                {/* Highlight badge with shimmer */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-float-gentle relative overflow-hidden ${
                    badge.isUrgent 
                      ? "bg-flame text-white" 
                      : "bg-mh-gold text-ink"
                  }`}>
                    <span className="relative z-10">{badge.highlight}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </span>
                </div>

                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-mh-gold/10 flex items-center justify-center group-hover:bg-mh-gold/15 group-hover:scale-110 transition-all duration-500">
                  <Icon weight="duotone" className="h-8 w-8 text-mh-gold group-hover:animate-pulse-soft" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
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

import { Eye, Camera, Truck, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

const badges = [
  { icon: Eye, title: "Free Eye Exams", highlight: "Save ₦15K" },
  { icon: Camera, title: "Virtual Try-On", highlight: "AI-Powered" },
  { icon: Truck, title: "Free Shipping", highlight: "2-3 Days" },
  { icon: ArrowCounterClockwise, title: "Easy Returns", highlight: "30 Days" },
];

export const TrustBadges = () => {
  const { ref, inView } = useScrollReveal({ threshold: 0.3 });

  return (
    <section className="section-ink py-6 sm:py-8 pb-20 lg:pb-8 border-t border-cream/5">
      <div ref={ref as React.RefObject<HTMLDivElement>} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:flex lg:items-center lg:justify-between">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className={`flex items-center gap-3 ${inView ? "animate-pop-in" : "opacity-0"}`}
                style={{ animationDelay: inView ? `${index * 100}ms` : "0ms" }}
              >
                {index > 0 && <div className="hidden lg:block w-px h-8 bg-cream/10 -ml-5 mr-5" />}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-mh-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon weight="duotone" className={`h-4 w-4 sm:h-5 sm:w-5 text-mh-gold ${inView ? "animate-orbit-slow" : ""}`} style={{ animationDuration: "30s" }} />
                </div>
                <div>
                  <p className="font-display font-semibold text-cream text-xs sm:text-sm">{badge.title}</p>
                  <p className="text-[10px] sm:text-xs text-mh-gold/70 font-display font-bold">{badge.highlight}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import { Eye, Camera, Truck, ArrowCounterClockwise } from "@phosphor-icons/react";

const badges = [
  { icon: Eye, title: "Free Eye Exams", highlight: "Save ₦15K" },
  { icon: Camera, title: "Virtual Try-On", highlight: "AI-Powered" },
  { icon: Truck, title: "Free Shipping", highlight: "2-3 Days" },
  { icon: ArrowCounterClockwise, title: "Easy Returns", highlight: "30 Days" },
];

export const TrustBadges = () => {
  return (
    <section className="section-ink py-8 border-t border-cream/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:justify-between">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex items-center gap-3">
                {index > 0 && (
                  <div className="hidden lg:block w-px h-8 bg-cream/10 -ml-5 mr-5" />
                )}
                <div className="w-10 h-10 rounded-xl bg-mh-gold/10 flex items-center justify-center">
                  <Icon weight="duotone" className="h-5 w-5 text-mh-gold" />
                </div>
                <div>
                  <p className="font-display font-semibold text-cream text-sm">
                    {badge.title}
                  </p>
                  <p className="text-xs text-mh-gold/70 font-display font-bold">
                    {badge.highlight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

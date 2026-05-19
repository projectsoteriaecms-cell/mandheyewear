import { ShieldCheck, MapPin, Heart, Coins } from "@phosphor-icons/react";

const differentiators = [
  {
    icon: Coins,
    stat: "Transparent",
    label: "Accessible Eye Care for All",
    description: "Affordable rates with no hidden charges — quality care for everyone",
  },
  {
    icon: ShieldCheck,
    stat: "Certified",
    label: "Optometrists & Specialists",
    description: "Highly trained, board-certified professionals you can trust",
  },
  {
    icon: MapPin,
    stat: "3",
    label: "Strategic Locations",
    description: "Conveniently located in Lagos, Delta, and Uyo",
  },
  {
    icon: Heart,
    stat: "Personal",
    label: "Personalized Eye Care",
    description: "Tailored services delivered with empathy and precision",
  },
];

export const WhyChooseSoteria = () => {
  return (
    <section className="py-20 feature-navy relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-primary font-medium uppercase tracking-widest text-sm mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white mb-4">
            The Soteria Difference
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            We combine advanced diagnostic technology with compassionate, patient-first care — serving families across Nigeria for over 15 years
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="text-center p-6 rounded-2xl feature-card border hover-lift animate-pop-in"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon weight="duotone" className="h-8 w-8 text-primary" />
                </div>
                <p className="text-3xl font-display font-bold text-white mb-1">{item.stat}</p>
                <p className="font-medium text-white/90 text-sm mb-2">{item.label}</p>
                <p className="text-white/50 text-xs">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
import { Eye, Camera, Truck, RotateCcw } from "lucide-react";

const badges = [
  {
    icon: Eye,
    title: "Free Eye Exams",
    description: "Comprehensive vision tests at all locations",
  },
  {
    icon: Camera,
    title: "Virtual Try-On",
    description: "See frames on your face before you buy",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over ₦50,000",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
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

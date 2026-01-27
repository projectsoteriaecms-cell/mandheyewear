import { Link } from "react-router-dom";
import { ArrowRight, Glasses, Sun, Eye } from "lucide-react";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const categories = [
  {
    name: "Eyeglasses",
    description: "Prescription frames for every style",
    path: "/eyewear?category=eyeglasses",
    image: frame1,
    icon: Glasses,
  },
  {
    name: "Sunglasses",
    description: "UV protection meets fashion",
    path: "/eyewear?category=sunglasses",
    image: frame2,
    icon: Sun,
  },
  {
    name: "Eye Exams",
    description: "Comprehensive vision care",
    path: "/booking",
    image: heroEyeCare,
    icon: Eye,
  },
];

export const CategoryCards = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Shop by Category
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collection of eyewear and professional eye care services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] block bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-white/90">
                        <Icon className="h-5 w-5" />
                        <h3 className="text-xl font-display font-semibold">{category.name}</h3>
                      </div>
                      <p className="text-white/70 text-sm">{category.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

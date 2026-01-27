import { Link } from "react-router-dom";
import { Glasses, Sun, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] block"
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="text-xl font-display font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-white/80 text-sm">{category.description}</p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
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

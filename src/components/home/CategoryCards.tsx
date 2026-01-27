import { Link } from "react-router-dom";
import { ArrowRight, Eyeglasses, Sun, Eye } from "@phosphor-icons/react";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const categories = [
  {
    name: "Eyeglasses",
    description: "Prescription frames for every style",
    path: "/eyewear?category=eyeglasses",
    image: frame1,
    icon: Eyeglasses,
    count: "500+ Frames",
  },
  {
    name: "Sunglasses",
    description: "UV protection meets fashion",
    path: "/eyewear?category=sunglasses",
    image: frame2,
    icon: Sun,
    count: "300+ Styles",
  },
  {
    name: "Eye Exams",
    description: "Comprehensive vision care",
    path: "/booking",
    image: heroEyeCare,
    icon: Eye,
    count: "Free Service",
  },
];

export const CategoryCards = () => {
  return (
    <section className="py-24 feature-navy relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-accent font-medium uppercase tracking-widest text-sm mb-4 animate-fade-in-up">
            Explore Our Collection
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white animate-fade-in-up stagger-delay-1">
            Shop by Category
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg animate-fade-in-up stagger-delay-2">
            Curated eyewear collection and professional eye care services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className={`group relative overflow-hidden rounded-3xl aspect-[4/5] block bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-float hover:-translate-y-2 animate-fade-in-up stagger-delay-${index + 1}`}
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                
                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                
                {/* Top badge */}
                <div className="absolute top-5 left-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium group-hover:bg-white/15 transition-colors">
                    <Icon weight="bold" className="h-3.5 w-3.5" />
                    {category.count}
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="flex items-end justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl lg:text-3xl font-display font-semibold text-white">
                        {category.name}
                      </h3>
                      <p className="text-white/70 text-sm lg:text-base">
                        {category.description}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300 shrink-0 ml-4">
                      <ArrowRight weight="bold" className="h-5 w-5 text-foreground group-hover:text-accent-foreground transition-colors" />
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

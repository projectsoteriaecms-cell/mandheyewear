import { Link } from "react-router-dom";
import { ArrowRight, Eyeglasses, Sun, Eye, Drop, Package, FirstAid } from "@phosphor-icons/react";
import { useRef } from "react";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const mainCategories = [
  {
    name: "Eyeglasses",
    description: "Prescription frames for every style",
    path: "/eyewear?category=eyeglasses",
    image: frame1,
    icon: Eyeglasses,
    count: "2,800+ Frames",
  },
  {
    name: "Sunglasses",
    description: "UV protection meets fashion",
    path: "/eyewear?category=sunglasses",
    image: frame2,
    icon: Sun,
    count: "80+ Styles",
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

const secondaryCategories = [
  {
    name: "Lenses",
    description: "Prescription & replacement lenses",
    path: "/eyewear?category=lenses",
    icon: Eye,
    count: "400+",
  },
  {
    name: "Contact Lenses",
    description: "Daily, weekly & monthly contacts",
    path: "/eyewear?category=contact_lenses",
    icon: Drop,
    count: "10+",
  },
  {
    name: "Accessories",
    description: "Cases, cloths & eye patches",
    path: "/eyewear?category=accessories",
    icon: Package,
    count: "20+",
  },
  {
    name: "Solutions & Care",
    description: "Lens solutions & cleansers",
    path: "/eyewear?category=solutions",
    icon: Drop,
    count: "8+",
  },
  {
    name: "Medications",
    description: "Eye drops & treatments",
    path: "/eyewear?category=medications",
    icon: FirstAid,
    count: "10+",
  },
];

export const CategoryCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 feature-navy relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={containerRef}>
        <div className="text-center mb-16">
          <p className="text-accent font-medium uppercase tracking-widest text-sm mb-4 animate-fade-in-up">
            Explore Our Collection
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white animate-fade-in-up stagger-delay-1">
            Shop by Category
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-lg animate-fade-in-up stagger-delay-2">
            Eyewear, lenses, contacts, accessories and professional eye care
          </p>
        </div>

        {/* Main Categories with Images */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1500 mb-10">
          {mainCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] block bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/30 transition-all duration-700 card-3d-hover animate-cascade"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                <div className="absolute top-5 left-5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-accent text-white text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Icon weight="bold" className="h-4 w-4 text-accent" />
                    <span className="text-shadow-sm">{category.count}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="flex items-end justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl lg:text-3xl font-display font-semibold text-white text-shadow-md">
                        {category.name}
                      </h3>
                      <p className="text-white/80 text-sm lg:text-base text-shadow-sm">
                        {category.description}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full arrow-button-accent flex items-center justify-center shrink-0 ml-4">
                      <ArrowRight weight="bold" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </Link>
            );
          })}
        </div>

        {/* Secondary Categories - Compact Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {secondaryCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-2xl p-5 block bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/30 hover:bg-white/10 transition-all duration-500 animate-cascade"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Icon weight="duotone" className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/50 text-xs leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <span className="text-xs text-accent/70 font-medium">{category.count} items</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

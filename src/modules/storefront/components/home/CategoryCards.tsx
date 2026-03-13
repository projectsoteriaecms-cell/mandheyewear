import { Link } from "react-router-dom";
import { ArrowRight, Eyeglasses, Sun, Eye, Bag } from "@phosphor-icons/react";
import { useRef } from "react";
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
    name: "Accessories & More",
    description: "Lenses, contacts, solutions & care",
    path: "/eyewear?category=accessories",
    image: heroEyeCare,
    icon: Bag,
    count: "400+ Items",
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
            Curated eyewear collection and professional eye care services
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1500">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-3xl aspect-[4/5] block bg-white/5 backdrop-blur-sm border border-white/10 hover:border-accent/30 transition-all duration-700 card-3d-hover animate-cascade"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                {/* Image with blur-sharp entrance */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay - darkens more on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 group-hover:via-black/60 transition-all duration-500" />
                
                {/* Shimmer sweep effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* Top badge with enhanced contrast */}
                <div className="absolute top-5 left-5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-accent text-white text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Icon weight="bold" className="h-4 w-4 text-accent" />
                    <span className="text-shadow-sm">{category.count}</span>
                  </div>
                </div>
                
                {/* Content with text shadows */}
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
                    {/* Gold accent arrow button */}
                    <div className="w-12 h-12 rounded-full arrow-button-accent flex items-center justify-center shrink-0 ml-4">
                      <ArrowRight weight="bold" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                {/* Corner accent glow on hover */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

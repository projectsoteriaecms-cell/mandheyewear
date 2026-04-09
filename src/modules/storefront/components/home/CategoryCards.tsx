import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const categories = [
  { name: "Eyeglasses", description: "Prescription frames for every style", path: "/eyewear?category=eyeglasses", image: frame1, count: "2,800+" },
  { name: "Sunglasses", description: "UV protection meets fashion", path: "/eyewear?category=sunglasses", image: frame2, count: "80+" },
  { name: "Accessories", description: "Lenses, contacts & care", path: "/eyewear?category=accessories", image: heroEyeCare, count: "400+" },
];

export const CategoryCards = () => {
  const headerReveal = useScrollReveal({ threshold: 0.2 });
  const { ref: cardsRef, inView } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="section-ink py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={headerReveal.ref as React.RefObject<HTMLDivElement>}
          className={`flex items-end justify-between mb-10 sm:mb-16 transition-all duration-700 ${headerReveal.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div>
            <p className="text-xs sm:text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-2 sm:mb-3">Collections</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-cream leading-[0.95]">
              Shop by category<span className="text-mh-gold">.</span>
            </h2>
          </div>
        </div>

        {/* Cards */}
        <div ref={cardsRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 perspective-1000">
          {/* Large hero card */}
          <Link
            to={categories[0].path}
            className={`group relative overflow-hidden rounded-2xl min-h-[280px] sm:min-h-[400px] lg:min-h-[540px] hover-tilt transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          >
            <img src={categories[0].image} alt={categories[0].name} className="absolute inset-0 w-full h-full object-cover animate-ken-burns" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-mh-gold/5 to-transparent" style={{ animationDuration: "4s" }} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent group-hover:from-ink/95 transition-all duration-500" />
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
              <span className="inline-block px-3 py-1.5 rounded-full bg-mh-gold/10 backdrop-blur-sm border border-mh-gold/20 text-cream text-xs font-display font-bold tracking-wider animate-pulse-soft">
                {categories[0].count} Frames
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-cream mb-1 sm:mb-2">{categories[0].name}</h3>
              <p className="text-cream/60 text-sm mb-4 sm:mb-5">{categories[0].description}</p>
              <span className="inline-flex items-center gap-2 text-mh-gold text-sm font-display font-semibold tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                Explore <ArrowRight weight="bold" className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Two stacked cards */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
            {categories.slice(1).map((cat, i) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`group relative overflow-hidden rounded-2xl min-h-[180px] sm:min-h-[200px] lg:flex-1 hover-tilt transition-all duration-700 ${inView ? "opacity-100" : "opacity-0"}`}
                style={{
                  transitionDelay: inView ? `${(i + 1) * 150}ms` : "0ms",
                  transform: inView
                    ? "perspective(1000px) rotateY(0deg)"
                    : "perspective(1000px) rotateY(-30deg)",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent group-hover:from-ink/95 transition-all duration-500" />
                <div className="absolute top-4 sm:top-5 left-4 sm:left-5">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-mh-gold/10 backdrop-blur-sm border border-mh-gold/20 text-cream text-xs font-display font-bold tracking-wider">
                    {cat.count} Styles
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-cream mb-1">{cat.name}</h3>
                  <p className="text-cream/60 text-sm mb-3 sm:mb-4">{cat.description}</p>
                  <span className="inline-flex items-center gap-2 text-mh-gold text-sm font-display font-semibold tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                    Explore <ArrowRight weight="bold" className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

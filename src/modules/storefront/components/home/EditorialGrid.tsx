import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";
import heroEyewear from "@/assets/hero-eyewear.jpg";

const blocks = [
  { number: "01", title: "Sharp Eyes", description: "For those who see the future before it arrives. Certified optometrists. Advanced diagnostics.", image: heroEyeCare, link: "/booking", linkText: "Book Exam" },
  { number: "02", title: "Sharper Style", description: "A new frame of mind. Designer frames as loud as your ambition, as silent as true luxury.", image: frame1, link: "/shop", linkText: "Shop Frames" },
  { number: "03", title: "Virtual Try-On", description: "See am. Believe am. AI face mapping lets you try every frame before you commit.", image: frame3, link: "/try-on", linkText: "Try Now" },
  { number: "04", title: "Style Quiz", description: "Your face. Your canvas. We match frames to your shape, vibe, and personality.", image: frame2, link: "/style-quiz", linkText: "Take Quiz" },
  { number: "05", title: "Precision Lenses", description: "Single vision to progressives — anti-glare, blue-light filter, no dull moment for your eyes.", image: frame4, link: "/shop?category=lenses", linkText: "Explore" },
  { number: "06", title: "The M&H Experience", description: "Where soft life meets sharp vision — na style wey dey see road.", image: heroEyewear, link: "/about", linkText: "Our Story" },
];

export const EditorialGrid = () => {
  const headerReveal = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="section-cream py-16 sm:py-24 lg:py-32 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerReveal.ref as React.RefObject<HTMLDivElement>}
          className={`flex items-end justify-between mb-10 sm:mb-16 transition-all duration-700 ${headerReveal.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div>
            <p className="text-xs sm:text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-2 sm:mb-3">The Visionary Standard</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-ink leading-[0.95]">
              Stay sharp<span className="inline-block w-[0.25em] h-[0.25em] rounded-full bg-mh-gold align-middle mx-0.5 relative -top-[0.05em] shadow-[0_0_8px_hsl(45_100%_45%/0.5)]" /> In every sense<span className="text-mh-gold">.</span>
            </h2>
          </div>
          <span className="hidden sm:block text-sm font-display tracking-widest text-ink/30 uppercase">©26</span>
        </div>

        {/* Grid */}
        <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 perspective-1000">
          {blocks.map((block, i) => (
            <Link
              key={block.number}
              to={block.link}
              className={`group relative overflow-hidden rounded-2xl scan-line-hover min-h-[220px] sm:min-h-[260px] bg-ink transition-all duration-700 ${gridInView ? "opacity-100" : "opacity-0"}`}
              style={{
                transitionDelay: gridInView ? `${i * 100}ms` : "0ms",
                transform: gridInView
                  ? "perspective(1000px) rotateX(0deg) translateY(0)"
                  : "perspective(1000px) rotateX(12deg) translateY(40px)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <img src={block.image} alt={block.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent group-hover:from-ink/95 transition-all duration-500" />

              <div className="absolute top-4 sm:top-5 left-4 sm:left-5">
                <span
                  className={`font-display font-bold text-xs tracking-[0.3em] text-cream/40 uppercase ${gridInView ? "animate-elastic-in" : "opacity-0"}`}
                  style={{ animationDelay: `${i * 100 + 300}ms` }}
                >
                  {block.number}/06
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <h3 className="font-display font-bold text-lg sm:text-xl lg:text-2xl text-cream mb-1 sm:mb-2">{block.title}</h3>
                <p className="text-cream/60 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 max-w-xs">{block.description}</p>
                <span className="inline-flex items-center gap-2 text-mh-gold text-sm font-display font-semibold tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                  {block.linkText}
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

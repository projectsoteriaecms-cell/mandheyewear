import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useScrollReveal, useStaggerReveal } from "@/shared/hooks/useScrollReveal";
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";
import heroEyewear from "@/assets/hero-eyewear.jpg";

const blocks = [
  { number: "01", title: "Precision Eye Care", description: "Comprehensive eye exams and advanced diagnostics by certified optometrists across Nigeria.", image: heroEyeCare, link: "/booking", linkText: "Book Exam", span: "col-span-1 row-span-1" },
  { number: "02", title: "Designer Frames", description: "Curated collections from world-renowned eyewear houses — crafted for distinction.", image: frame1, link: "/eyewear", linkText: "Shop Frames", span: "col-span-1 row-span-2", large: true },
  { number: "03", title: "Virtual Try-On", description: "AI-powered face mapping lets you see every frame on your face before you buy.", image: frame3, link: "/try-on", linkText: "Try Now", span: "col-span-1 row-span-1" },
  { number: "04", title: "Style Quiz", description: "Answer a few questions. We'll match you with frames that suit your face shape and personality.", image: frame2, link: "/style-quiz", linkText: "Take Quiz", span: "col-span-1 row-span-1" },
  { number: "05", title: "Prescription Lenses", description: "From single vision to progressives — precision-cut lenses with anti-glare and blue-light coatings.", image: frame4, link: "/eyewear?category=lenses", linkText: "Explore", span: "col-span-1 row-span-1" },
  { number: "06", title: "The M&H Experience", description: "Where clinical precision meets luxury fashion. One brand, two worlds, your vision.", image: heroEyewear, link: "/about", linkText: "Our Story", span: "col-span-1 row-span-1" },
];

export const EditorialGrid = () => {
  const headerReveal = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, inView: gridInView } = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="section-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={headerReveal.ref as React.RefObject<HTMLDivElement>}
          className={`flex items-end justify-between mb-16 transition-all duration-700 ${headerReveal.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div>
            <p className="text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-3">All About Vision</p>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink leading-[0.95] ${headerReveal.inView ? "animate-text-reveal" : ""}`} style={{ clipPath: headerReveal.inView ? undefined : "inset(0 100% 0 0)" }}>
              See differently<span className="text-mh-gold">.</span>
            </h2>
          </div>
          <span className="hidden sm:block text-sm font-display tracking-widest text-ink/30 uppercase">©26</span>
        </div>

        {/* Grid */}
        <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {blocks.map((block, i) => (
            <Link
              key={block.number}
              to={block.link}
              className={`group relative overflow-hidden rounded-2xl ${block.large ? "md:row-span-2 min-h-[500px]" : "min-h-[260px]"} bg-ink transition-all duration-700 ${gridInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: gridInView ? `${i * 100}ms` : "0ms" }}
            >
              <img src={block.image} alt={block.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent group-hover:from-ink/95 transition-all duration-500" />

              <div className="absolute top-5 left-5">
                <span className={`font-display font-bold text-xs tracking-[0.3em] text-cream/40 uppercase ${gridInView ? "animate-scale-spring" : ""}`} style={{ animationDelay: `${i * 100 + 300}ms` }}>
                  {block.number}/06
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display font-bold text-xl lg:text-2xl text-cream mb-2">{block.title}</h3>
                <p className="text-cream/60 text-sm leading-relaxed mb-4 max-w-xs">{block.description}</p>
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

import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const panels = [
  { tag: "/EYEWEAR", title: "Sharper Style", subtitle: "A new frame of mind. Frames as loud as your ambition, as silent as true luxury.", image: heroEyewear, link: "/shop", cta: "Shop Collection" },
  { tag: "/EYE CARE", title: "Sharp Eyes", subtitle: "For those who see the future before it arrives. Stay sharp, in every sense.", image: heroEyeCare, link: "/booking", cta: "Book Eye Exam" },
];

export const DualCtaSection = () => {
  const headerReveal = useScrollReveal({ threshold: 0.2 });
  const { ref: panelsRef, inView } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="section-cream py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerReveal.ref as React.RefObject<HTMLDivElement>}
          className={`text-center mb-10 sm:mb-16 transition-all duration-700 ${headerReveal.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-xs sm:text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-2 sm:mb-3">Your Outlook. Your Power.</p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-ink leading-[0.95]">
            Choose your path<span className="text-mh-gold">.</span>
          </h2>
        </div>

        {/* Panels */}
        <div ref={panelsRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 relative perspective-1000">
          {/* Gold divider line */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-mh-gold/30 to-transparent z-10" />

          {panels.map((panel, i) => (
            <Link
              key={panel.tag}
              to={panel.link}
              className={`group relative overflow-hidden rounded-2xl min-h-[300px] sm:min-h-[400px] lg:min-h-[520px] bg-ink scan-line-hover transition-all duration-700 ${
                inView ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transitionDelay: inView ? `${i * 200}ms` : "0ms",
                transform: inView
                  ? "perspective(1000px) rotateY(0deg)"
                  : i === 0
                  ? "perspective(1000px) rotateY(20deg)"
                  : "perspective(1000px) rotateY(-20deg)",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <img src={panel.image} alt={panel.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20 group-hover:from-ink/95 transition-all duration-500" />

              <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                <span className="font-display font-bold text-xs tracking-[0.3em] text-cream/50 uppercase">{panel.tag}</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-cream mb-2">{panel.title}</h3>
                <p className="text-cream/60 text-sm sm:text-base mb-4 sm:mb-6 max-w-sm">{panel.subtitle}</p>
                <span className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                  {panel.cta}
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </span>
              </div>

              <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-mh-gold/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

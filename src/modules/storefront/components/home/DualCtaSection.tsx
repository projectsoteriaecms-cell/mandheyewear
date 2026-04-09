import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import heroEyewear from "@/assets/hero-eyewear.jpg";
import heroEyeCare from "@/assets/hero-eye-care.jpg";

const panels = [
  {
    tag: "/EYEWEAR",
    title: "Fashion Eyewear",
    subtitle: "Designer frames that define your style",
    image: heroEyewear,
    link: "/eyewear",
    cta: "Shop Collection",
  },
  {
    tag: "/EYE CARE",
    title: "Clinical Eye Care",
    subtitle: "Precision diagnostics & comprehensive exams",
    image: heroEyeCare,
    link: "/booking",
    cta: "Book Eye Exam",
  },
];

export const DualCtaSection = () => {
  return (
    <section className="section-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-display font-bold tracking-[0.3em] uppercase text-mh-gold mb-3">
            Two Worlds, One Vision
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink leading-[0.95]">
            Choose your path<span className="text-mh-gold">.</span>
          </h2>
        </div>

        {/* Dual panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {panels.map((panel) => (
            <Link
              key={panel.tag}
              to={panel.link}
              className="group relative overflow-hidden rounded-2xl min-h-[400px] lg:min-h-[520px] bg-ink"
            >
              {/* Image */}
              <img
                src={panel.image}
                alt={panel.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/50 to-ink/20 group-hover:from-ink/95 transition-all duration-500" />

              {/* Tag */}
              <div className="absolute top-6 left-6">
                <span className="font-display font-bold text-xs tracking-[0.3em] text-cream/50 uppercase">
                  {panel.tag}
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                <h3 className="font-display font-bold text-3xl lg:text-4xl text-cream mb-2">
                  {panel.title}
                </h3>
                <p className="text-cream/60 text-base mb-6 max-w-sm">
                  {panel.subtitle}
                </p>
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase group-hover:gap-3 transition-all duration-300">
                  {panel.cta}
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </span>
              </div>

              {/* Corner glow */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-mh-gold/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

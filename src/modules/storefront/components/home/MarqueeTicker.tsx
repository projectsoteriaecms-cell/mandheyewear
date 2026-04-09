const topItems = [
  "PREMIUM FRAMES",
  "VIRTUAL TRY-ON",
  "FREE EYE EXAMS",
  "AI STYLING",
  "DESIGNER EYEWEAR",
  "CLINICAL EYE CARE",
  "PRECISION LENSES",
  "SAME DAY SERVICE",
];

const bottomItems = [
  "LUXURY FASHION",
  "CERTIFIED OPTOMETRISTS",
  "FACE MAPPING",
  "ANTI-GLARE COATING",
  "PROGRESSIVE LENSES",
  "STYLE QUIZ",
  "HOME DELIVERY",
  "BLUE-LIGHT FILTER",
];

export const MarqueeTicker = () => {
  return (
    <section className="section-ink py-5 overflow-hidden border-y border-mh-gold/10 relative">
      {/* Gold glow line between rows */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-mh-gold/20 to-transparent" />

      {/* Row 1 — scrolls left */}
      <div className="marquee-track flex whitespace-nowrap mb-3">
        {[...topItems, ...topItems].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 mx-6">
            <span className="font-display font-bold text-base sm:text-lg tracking-[0.2em] uppercase text-cream/80">
              {item}
            </span>
            <span className="text-mh-gold text-xs font-bold">✦</span>
          </span>
        ))}
      </div>

      {/* Row 2 — scrolls right (reverse) */}
      <div className="marquee-reverse flex whitespace-nowrap">
        {[...bottomItems, ...bottomItems].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 mx-6">
            <span className="font-display font-bold text-base sm:text-lg tracking-[0.2em] uppercase text-cream/40">
              {item}
            </span>
            <span className="text-flame/60 text-xs font-bold">+</span>
          </span>
        ))}
      </div>
    </section>
  );
};

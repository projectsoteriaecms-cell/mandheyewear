const topItems = [
  "SHARP EYES",
  "DESIGNER FRAMES",
  "CLARITY WITHOUT COMPROMISE",
  "AI STYLING",
  "FREE EYE EXAMS",
  "STAY SHARP IN EVERY SENSE",
  "A NEW FRAME OF MIND",
  "SOFT LIFE CERTIFIED",
];

const bottomItems = [
  "EYE NO DEY LIE",
  "YOUR FACE YOUR CANVAS",
  "VIRTUAL TRY-ON",
  "BIG VISION",
  "SAME DAY SERVICE",
  "YOUR OUTLOOK YOUR POWER",
  "LOOKING MONEY",
  "SHAKARA NO BE SIN",
];

const ghostItems = [
  "PRECISION LENSES",
  "HIGH DEFINITION",
  "NO DULL MOMENT",
  "SHARPER STYLE",
  "SEE AM BELIEVE AM",
  "NA STYLE WEY DEY SEE ROAD",
];

export const MarqueeTicker = () => {
  return (
    <section className="section-ink py-5 overflow-hidden border-y border-mh-gold/10 relative">
      {/* Gold glow line between rows */}
      <div className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-mh-gold/20 to-transparent" />
      <div className="absolute left-0 right-0 top-2/3 h-px bg-gradient-to-r from-transparent via-mh-gold/10 to-transparent" />

      {/* Row 1 — scrolls left (25s) */}
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

      {/* Row 2 — scrolls right (35s) */}
      <div className="marquee-reverse flex whitespace-nowrap mb-3">
        {[...bottomItems, ...bottomItems].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 mx-6">
            <span className="font-display font-bold text-base sm:text-lg tracking-[0.2em] uppercase text-cream/40">
              {item}
            </span>
            <span className="text-flame/60 text-xs font-bold">+</span>
          </span>
        ))}
      </div>

      {/* Row 3 — ghost row, fastest (18s), very faint */}
      <div className="marquee-ghost flex whitespace-nowrap">
        {[...ghostItems, ...ghostItems].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 mx-6">
            <span className="font-display font-bold text-sm tracking-[0.2em] uppercase text-cream/15">
              {item}
            </span>
            <span className="text-mh-gold/20 text-xs font-bold">·</span>
          </span>
        ))}
      </div>
    </section>
  );
};

const items = [
  "PREMIUM FRAMES",
  "VIRTUAL TRY-ON",
  "FREE EYE EXAMS",
  "AI STYLING",
  "DESIGNER EYEWEAR",
  "CLINICAL EYE CARE",
  "PRECISION LENSES",
  "SAME DAY SERVICE",
];

export const MarqueeTicker = () => {
  return (
    <section className="section-ink py-4 overflow-hidden border-y border-mh-gold/10">
      <div className="marquee-track flex whitespace-nowrap">
        {[...items, ...items].map((item, index) => (
          <span key={index} className="inline-flex items-center gap-6 mx-6">
            <span className="font-display font-bold text-sm tracking-[0.2em] uppercase text-cream/80">
              {item}
            </span>
            <span className="text-flame text-xs font-bold">+</span>
          </span>
        ))}
      </div>
    </section>
  );
};

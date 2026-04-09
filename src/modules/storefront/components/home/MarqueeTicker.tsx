import { useRef, useState, useCallback, useEffect } from "react";

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

interface MarqueeRowProps {
  items: string[];
  separator: string;
  separatorClass: string;
  textClass: string;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

const MarqueeRow = ({
  items,
  separator,
  separatorClass,
  textClass,
  speed = 25,
  reverse = false,
  className = "",
}: MarqueeRowProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const animRef = useRef<string>(reverse ? "marquee-scroll-reverse" : "marquee-scroll");

  // Duplicate items 4x for seamless loop
  const repeated = [...items, ...items, ...items, ...items];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    const track = trackRef.current;
    if (track) {
      // Grab current computed translateX to freeze position
      const style = getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      setScrollOffset(matrix.m41);
      track.style.animationPlayState = "paused";
      track.style.transform = `translateX(${matrix.m41}px)`;
      track.style.animation = "none";
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      const delta = e.clientX - dragStartX;
      trackRef.current.style.transform = `translateX(${scrollOffset + delta}px)`;
    },
    [isDragging, dragStartX, scrollOffset]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !trackRef.current) return;
    setIsDragging(false);
    const track = trackRef.current;
    // Resume CSS animation from current position
    track.style.animation = "";
    track.style.animationPlayState = "running";
    track.style.transform = "";
  }, [isDragging]);

  const animClass = reverse ? "marquee-reverse" : "marquee-track";
  const speedStyle = { animationDuration: `${speed}s` };

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        ref={trackRef}
        className={`${animClass} flex whitespace-nowrap will-change-transform`}
        style={speedStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {repeated.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-3 sm:gap-6 mx-3 sm:mx-6 shrink-0"
          >
            <span className={`font-display font-bold tracking-[0.2em] uppercase ${textClass}`}>
              {item}
            </span>
            <span className={`font-bold ${separatorClass}`}>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export const MarqueeTicker = () => {
  return (
    <section className="section-ink py-3 sm:py-5 overflow-hidden border-y border-mh-gold/10 relative">
      {/* Gold glow lines between rows */}
      <div className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-mh-gold/20 to-transparent" />
      <div className="absolute left-0 right-0 top-2/3 h-px bg-gradient-to-r from-transparent via-mh-gold/10 to-transparent" />

      {/* Row 1 — scrolls left */}
      <MarqueeRow
        items={topItems}
        separator="✦"
        separatorClass="text-mh-gold text-[10px] sm:text-xs"
        textClass="text-xs sm:text-lg text-cream/80"
        speed={25}
        className="mb-2 sm:mb-3"
      />

      {/* Row 2 — scrolls right (reverse) */}
      <MarqueeRow
        items={bottomItems}
        separator="+"
        separatorClass="text-flame/60 text-[10px] sm:text-xs"
        textClass="text-xs sm:text-lg text-cream/40"
        speed={35}
        reverse
        className="mb-2 sm:mb-3"
      />

      {/* Row 3 — fastest, subliminal, hidden on mobile */}
      <MarqueeRow
        items={ghostItems}
        separator="·"
        separatorClass="text-mh-gold/20 text-xs"
        textClass="text-sm text-cream/15"
        speed={18}
        className="hidden sm:block"
      />
    </section>
  );
};

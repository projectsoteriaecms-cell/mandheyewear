import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ArrowRight,
  ShoppingBag,
  MapPin,
} from "@phosphor-icons/react";
import heroPhoto1 from "@/assets/soteria/hero-bg-1.webp";
import heroPhoto2 from "@/assets/soteria/hero-bg-2.webp";
import heroPhoto3 from "@/assets/soteria/about-clinic-photo.jpg";
import heroPhoto4 from "@/assets/soteria/service-1.jpg";

type Phase = {
  top: string;
  tail: string;
  sub: string;
  cta: { label: string; to: string; Icon: typeof Calendar };
  image: { src: string; alt: string };
};

const PHASES: Phase[] = [
  {
    top: "Sharper",
    tail: "for every day.",
    sub: "Clinical eye exams, done the right way.",
    cta: { label: "Book Eye Exam", to: "/booking", Icon: Calendar },
    image: { src: heroPhoto2, alt: "Soteria Eye Clinic interior" },
  },
  {
    top: "Brighter",
    tail: "for every face.",
    sub: "Designer frames fitted to your prescription.",
    cta: { label: "Shop Eyewear", to: "/eyewear", Icon: ShoppingBag },
    image: { src: heroPhoto1, alt: "Soteria optometrist with patient" },
  },
  {
    top: "Total",
    tail: "for everyone.",
    sub: "Trusted eye care for families, professionals, and elders — at home and abroad.",
    cta: { label: "Find a Clinic", to: "/branches", Icon: MapPin },
    image: { src: heroPhoto3, alt: "Modern clinic environment" },
  },
];

const HOLD_MS = 3500;

export const HeroSection = () => {
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [blinkKey, setBlinkKey] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  // Trigger one blink each time the phase changes.
  useEffect(() => {
    setBlinkKey((k) => k + 1);
  }, [phase]);

  const active = PHASES[phase];

  return (
    <section
      className="relative overflow-hidden bg-[hsl(var(--feature-bg))] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Iris radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center py-20 lg:py-28">
          {/* Left: Editorial copy */}
          <div className="lg:col-span-7 space-y-9">
            <h1 className="font-display font-semibold leading-[0.92] tracking-tight text-[clamp(3rem,8vw,6.5rem)]">
              {/* Top word — morphs */}
              <span className="block h-[1.05em] overflow-hidden">
                <MorphWord
                  word={active.top}
                  phase={phase}
                  className="block text-white"
                />
              </span>

              {/* Anchor word — pinned */}
              <span className="block relative text-accent">
                <span className="inline-flex items-baseline">
                  VISI
                  <IrisO blinkKey={blinkKey} />
                  N
                </span>
                <svg
                  className="absolute -bottom-3 left-0 w-[5.4em] h-3 text-accent/70"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 C 80 2, 180 12, 298 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* Tail line — morphs */}
              <span className="block min-h-[1.15em] whitespace-normal lg:whitespace-nowrap">
                <MorphWord
                  word={active.tail}
                  phase={phase}
                  className="block text-white/85 italic font-light"
                />
              </span>
            </h1>

            <div
              className="flex gap-5 max-w-xl"
              key={`sub-${phase}`}
            >
              <span className="block w-[2px] bg-accent/70 shrink-0" />
              <p className="text-base sm:text-lg text-white/70 leading-relaxed animate-fade-in">
                {active.sub}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                asChild
                size="lg"
                className="group h-14 px-8 rounded-full text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold hover:shadow-glow-accent transition-all"
              >
                <Link
                  to={active.cta.to}
                  key={`cta-${phase}`}
                  className="flex items-center gap-3 animate-fade-in"
                >
                  <active.cta.Icon weight="fill" className="h-5 w-5" />
                  {active.cta.label}
                  <ArrowRight
                    weight="bold"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Button>

              {/* Phase dots */}
              <div className="flex items-center gap-2 sm:ml-4" role="tablist" aria-label="Vision story">
                {PHASES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === phase}
                    aria-label={`Show ${PHASES[i].top.toLowerCase()} vision`}
                    onClick={() => setPhase(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === phase
                        ? "w-8 bg-accent"
                        : "w-1.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-8 border-t border-white/10 animate-fade-in">
              <Stat value="3K+" label="Patients cared for" />
              <span className="hidden sm:block h-8 w-px bg-white/15" />
              <Stat value="15+" label="Years of practice" />
              <span className="hidden sm:block h-8 w-px bg-white/15" />
              <Stat value="Global" label="Care & shipping reach" />
            </div>
          </div>

          {/* Right: Asymmetric photo carousel synced to phase */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div
              className="relative overflow-hidden shadow-float animate-pop-in"
              style={{
                borderTopLeftRadius: "180px",
                borderTopRightRadius: "32px",
                borderBottomRightRadius: "180px",
                borderBottomLeftRadius: "32px",
              }}
            >
              <div className="relative w-full h-[560px]">
                {[...PHASES.map((p) => p.image), { src: heroPhoto4, alt: "Comprehensive eye examination" }].slice(0, PHASES.length).map((img, i) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      opacity: i === phase ? 1 : 0,
                      transform: i === phase ? "scale(1)" : "scale(1.04)",
                      transition:
                        "opacity 900ms ease-out, transform 4500ms ease-out",
                    }}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--feature-bg))]/70 via-transparent to-transparent" />
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur text-foreground px-5 py-4 rounded-2xl shadow-float border border-white/40 max-w-[230px] animate-float">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                  3K+
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">
                    Trusted patients
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across Nigeria
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute -top-5 -right-4 bg-accent text-accent-foreground px-4 py-3 rounded-2xl shadow-gold animate-float-slow"
              style={{ animationDelay: "0.6s" }}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold opacity-80">
                Since 2010
              </p>
              <p className="font-display text-2xl font-bold leading-none mt-1">
                15+ yrs
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-baseline gap-2">
    <span className="font-display text-2xl font-semibold text-accent">
      {value}
    </span>
    <span className="text-sm text-white/60">{label}</span>
  </div>
);

/**
 * Word that slides up & fades when its content changes.
 * Uses key={word} so React remounts and the CSS animation re-fires.
 */
const MorphWord = ({
  word,
  phase,
  className,
}: {
  word: string;
  phase: number;
  className?: string;
}) => (
  <span
    key={`${phase}-${word}`}
    className={`${className ?? ""} animate-slide-up-spring`}
    style={{ willChange: "transform, opacity" }}
  >
    {word}
  </span>
);

/**
 * The "O" in VISION rendered as a minimal iris mark.
 * Reads as a perfect O at any distance; rewards a closer look with a pupil and catch-light.
 * Blinks once each time blinkKey changes (i.e. on phase change).
 */
const IrisO = ({ blinkKey }: { blinkKey: number }) => (
  <span
    className="relative inline-block align-baseline mx-[0.02em]"
    style={{ width: "0.78em", height: "0.78em" }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
      <defs>
        <radialGradient id="irisO-grad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="hsl(45 100% 72%)" />
          <stop offset="60%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--mh-gold-dark))" />
        </radialGradient>
        <clipPath id="irisO-clip">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      {/* Iris ring — the O silhouette */}
      <circle cx="50" cy="50" r="46" fill="url(#irisO-grad)" />
      <circle cx="50" cy="50" r="28" fill="hsl(var(--feature-bg))" />

      {/* Pupil with slow dilate */}
      <circle
        cx="50"
        cy="50"
        r="14"
        fill="hsl(220 50% 6%)"
        className="motion-safe:animate-pupil-dilate"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      />
      {/* Catch-light */}
      <circle cx="44" cy="44" r="4.5" fill="white" />
      <circle cx="56" cy="56" r="1.6" fill="white" opacity="0.55" />

      {/* Eyelid sweep — covers the entire O for one blink */}
      <g clipPath="url(#irisO-clip)">
        <rect
          key={blinkKey}
          x="-5"
          y="-100"
          width="110"
          height="100"
          fill="hsl(var(--feature-bg))"
          style={{
            animation:
              "lid-sweep 320ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />
      </g>
    </svg>
    <style>{`
      @keyframes lid-sweep {
        0%   { transform: translateY(0); }
        45%  { transform: translateY(105px); }
        100% { transform: translateY(210px); }
      }
    `}</style>
  </span>
);

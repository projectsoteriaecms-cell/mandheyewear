import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Heartbeat, MapPin } from "@phosphor-icons/react";
import heroPhoto from "@/assets/soteria/hero-bg-2.webp";
import clinicPhoto from "@/assets/soteria/about-clinic-photo.jpg";
import branchesPhoto from "@/assets/soteria/gallery-about.jpg";

type Card = {
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  href: string;
  cta: string;
  Icon: React.ComponentType<any>;
};

const cards: Card[] = [
  {
    index: "01",
    eyebrow: "Comprehensive Care",
    title: "Eye exams that see the whole picture.",
    body: "Computerised refraction, intraocular pressure and detailed ocular health checks — calibrated for every age group.",
    image: heroPhoto,
    href: "/booking",
    cta: "Book an exam",
    Icon: Eye,
  },
  {
    index: "02",
    eyebrow: "Specialist Treatment",
    title: "Glaucoma, diabetic retinopathy & paediatric care.",
    body: "Modern equipment, evidence-based protocols and consultants who explain every step in plain language.",
    image: clinicPhoto,
    href: "/eye-care",
    cta: "See our services",
    Icon: Heartbeat,
  },
  {
    index: "03",
    eyebrow: "Across Nigeria",
    title: "Lagos · Delta · Uyo.",
    body: "Three clinics, one standard. Find the location closest to you and book a visit in under a minute.",
    image: branchesPhoto,
    href: "/branches",
    cta: "Find a clinic",
    Icon: MapPin,
  },
];

export const StackedReveal = () => {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the scroll progress so motion never feels jittery.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });

  // Mobile / reduced-motion: simple stacked render
  if (reduce) {
    return (
      <section className="bg-[hsl(var(--feature-bg))] text-white py-20">
        <SectionHeading />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
          {cards.map((c) => (
            <CardShell key={c.index} card={c} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Mobile fallback (no pin) */}
      <section className="lg:hidden bg-[hsl(var(--feature-bg))] text-white pt-28 pb-20">
        <SectionHeading />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-28 md:mt-32 space-y-8">
          {cards.map((c) => (
            <CardShell key={c.index} card={c} />
          ))}
        </div>
      </section>

      {/* Desktop pinned reveal */}
      <section
        ref={containerRef}
        className="hidden lg:block relative bg-[hsl(var(--feature-bg))] text-white"
        style={{ height: `${(cards.length + 1) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Subtle ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[140px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px]" />
          </div>

          {/* Pinned heading — clears the fixed top nav (104px on lg) */}
          <div className="relative z-[5] pt-[7.5rem] pb-2">
            <SectionHeading />
          </div>

          {/* Card stage */}
          <div
            className="absolute left-0 right-0 z-10 px-6"
            style={{ top: "42vh", bottom: "6vh" }}
          >
            <div className="relative w-full max-w-6xl mx-auto h-full">
              {cards.map((c, i) => (
                <PinnedCard
                  key={c.index}
                  card={c}
                  index={i}
                  total={cards.length}
                  progress={smooth}
                />
              ))}
            </div>
          </div>

          {/* Progress rail */}
          <ProgressRail progress={smooth} total={cards.length} />
        </div>
      </section>
    </>
  );
};

const SectionHeading = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
      <div className="overflow-visible">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">
          / The Soteria Standard
        </p>
        <h2 className="mt-4 font-display font-semibold tracking-tight text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.2] pb-2 max-w-2xl">
          Built around your eyes.
        </h2>
      </div>
      <p className="hidden md:block text-sm text-white/55 max-w-xs">
        Three pillars. One promise — your total eye care, our responsibility.
      </p>
    </div>
  </div>
);

const PinnedCard = ({
  card,
  index,
  total,
  progress,
}: {
  card: Card;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) => {
  // Distribute card windows across [0, 1] of scroll progress, with overlap.
  // total=3 → segment ≈ 0.33. Each card has an enter window then sits.
  const segment = 1 / (total + 0.5);
  const enterStart = Math.max(0, index * segment - 0.05);
  const enterEnd = index * segment + segment * 0.55;
  const exitStart = (index + 1) * segment;
  const exitEnd = Math.min(1, (index + 1) * segment + segment * 0.6);

  const isLast = index === total - 1;
  const isFirst = index === 0;

  // y: incoming slides up from below; settles; on exit drifts up slightly
  const y = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    isFirst
      ? ["0%", "0%", "0%", isLast ? "0%" : "-5%"]
      : ["110%", "0%", "0%", isLast ? "0%" : "-5%"],
  );

  // scale: incoming pops in slightly; recedes after handoff
  const scale = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    isFirst ? [1, 1, 1, isLast ? 1 : 0.94] : [0.96, 1, 1, isLast ? 1 : 0.94],
  );

  // opacity: stays full through its window, fades only after the next card is well in
  const opacity = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    isFirst ? [1, 1, 1, isLast ? 1 : 0.25] : [0, 1, 1, isLast ? 1 : 0.25],
  );

  // blur: outgoing card blurs to suggest depth
  const blurPx = useTransform(
    progress,
    [exitStart, exitEnd],
    [0, isLast ? 0 : 6],
  );
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        filter,
        zIndex: 10 + index,
      }}
      className="absolute inset-0 will-change-transform"
    >
      <CardShell card={card} />
    </motion.div>
  );
};

const ProgressRail = ({
  progress,
  total,
}: {
  progress: MotionValue<number>;
  total: number;
}) => {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <ProgressDot key={i} index={i} total={total} progress={progress} />
      ))}
    </div>
  );
};

const ProgressDot = ({
  index,
  total,
  progress,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
}) => {
  const segment = 1 / (total + 0.5);
  const start = index * segment;
  const end = start + segment;
  const fill = useTransform(progress, [start, end], [0.25, 1]);
  const scale = useTransform(progress, [start, end], [1, 1.25]);
  return (
    <motion.span
      style={{ opacity: fill, scale }}
      className="block w-2 h-2 rounded-full bg-accent"
    />
  );
};

const CardShell = ({ card }: { card: Card }) => {
  const Icon = card.Icon;
  return (
    <article className="relative grid lg:grid-cols-2 gap-0 rounded-[36px] overflow-hidden bg-card/95 backdrop-blur-sm text-card-foreground border border-white/10 shadow-float h-full">
      {/* Copy */}
      <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 min-h-[420px]">
        <div className="flex items-start justify-between gap-6">
          <span className="font-mono text-sm tracking-widest text-accent">
            {card.index}
          </span>
          <span className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Icon weight="duotone" className="h-6 w-6" />
          </span>
        </div>

        <div className="space-y-5">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            {card.eyebrow}
          </p>
          <h3 className="font-display font-semibold tracking-tight text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05]">
            {card.title}
          </h3>
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            {card.body}
          </p>
        </div>

        <div>
          <Button
            asChild
            variant="ghost"
            className="group h-auto px-0 text-base font-semibold text-foreground hover:bg-transparent hover:text-accent"
          >
            <Link to={card.href} className="inline-flex items-center gap-2">
              {card.cta}
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-64 lg:h-auto min-h-[420px] overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--feature-bg))]/30 via-transparent to-transparent" />
      </div>
    </article>
  );
};

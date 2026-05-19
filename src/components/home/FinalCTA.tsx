import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ArrowRight } from "@phosphor-icons/react";

export const FinalCTA = () => {
  return (
    <section className="relative py-28 bg-[hsl(var(--feature-bg))] overflow-hidden">
      {/* Concentric iris rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.18]">
        <svg
          viewBox="0 0 600 600"
          className="w-[820px] h-[820px] text-accent"
          fill="none"
        >
          {[280, 220, 160, 100, 50].map((r) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
          <circle cx="300" cy="300" r="30" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent mb-6">
          / Your Next Step
        </p>
        <h2 className="font-display font-semibold tracking-tight text-white leading-[1.02] text-[clamp(2.25rem,6vw,4.5rem)]">
          Let&apos;s protect <br />
          your <span className="text-accent italic">vision.</span>
        </h2>
        <p className="text-white/65 text-lg mt-8 max-w-xl mx-auto">
          One short visit. A lifetime of clearer days. Book an appointment with
          a Soteria specialist today.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="group h-14 px-9 rounded-full text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold hover:shadow-glow-accent transition-all"
          >
            <Link to="/booking" className="inline-flex items-center gap-3">
              <CalendarCheck weight="fill" className="h-5 w-5" />
              Book an appointment
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 px-9 rounded-full text-base border-white/25 bg-transparent text-white hover:bg-white/5 hover:text-white"
          >
            <Link to="/branches">Find a clinic</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

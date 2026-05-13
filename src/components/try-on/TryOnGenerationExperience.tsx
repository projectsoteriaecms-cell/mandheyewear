import { useEffect, useMemo, useRef, useState } from "react";
import { ScanFace, Glasses, Sparkles, Wand2, Check, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TryOnGenerationExperienceProps {
  userPhoto?: string | null;
  frameName?: string;
  className?: string;
  /** target seconds for full pseudo-progress arc */
  targetSeconds?: number;
  variant?: "full" | "compact";
}

const STEPS = [
  { key: "detect", label: "Detecting your face", icon: ScanFace, until: 25 },
  { key: "map", label: "Mapping frame to your features", icon: Glasses, until: 55 },
  { key: "fit", label: "Adjusting fit & proportions", icon: Wand2, until: 80 },
  { key: "polish", label: "Polishing the final look", icon: Sparkles, until: 100 },
];

const TIPS = [
  "Pro tip: Round faces shine in angular frames — and vice versa.",
  "Did you know? Acetate frames are hand-polished for that signature gloss.",
  "Style note: Gold accents pair beautifully with warm undertones.",
  "Fit tip: Frames should sit comfortably without sliding down your nose.",
  "Try multiple frames side-by-side — your favorite is usually the third one 😉",
  "Pupillary distance matters — we factor it in for a true-to-life preview.",
  "Save your top picks to your wishlist and compare later.",
  "Bookings: combine your try-on with an in-store fitting at any M&H branch.",
];

export const TryOnGenerationExperience = ({
  userPhoto,
  frameName,
  className,
  targetSeconds = 12,
  variant = "full",
}: TryOnGenerationExperienceProps) => {
  const [progress, setProgress] = useState(2);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const startRef = useRef<number>(Date.now());

  // Smooth pseudo-progress with easing — caps at 95% until real result arrives
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // ease-out: approach 95% over targetSeconds
      const ratio = 1 - Math.exp(-elapsed / (targetSeconds / 2.5));
      setProgress(Math.min(95, Math.round(ratio * 95)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetSeconds]);

  // Rotate tips every 3.5s
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const activeStepIdx = useMemo(
    () => STEPS.findIndex((s) => progress < s.until),
    [progress]
  );
  const currentStep = activeStepIdx === -1 ? STEPS.length - 1 : activeStepIdx;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-secondary/40",
        variant === "full" ? "p-5" : "p-4",
        className
      )}
    >
      {/* Photo with scanning shimmer */}
      <div className="relative mx-auto mb-4 aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-lg bg-muted">
        {userPhoto ? (
          <img
            src={userPhoto}
            alt="Your photo"
            className="h-full w-full object-cover"
            style={{ imageOrientation: "from-image" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ScanFace className="h-10 w-10" />
          </div>
        )}
        {/* Scan line */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 right-0 h-1/3 bg-gradient-to-b from-transparent via-primary/30 to-transparent animate-scan-line" />
        </div>
        {/* Subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>

      {/* Headline */}
      <div className="text-center mb-3">
        <p className="text-sm font-semibold text-foreground">
          Crafting your look{frameName ? ` with ${frameName}` : ""}…
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Usually ready in {targetSeconds}–{targetSeconds + 6} seconds
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{progress}%</span>
          <span>{progress >= 95 ? "Finalizing…" : "AI rendering"}</span>
        </div>
      </div>

      {/* Steps */}
      <ul className="mt-4 space-y-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-2.5 text-xs transition-opacity",
                isDone || isActive ? "opacity-100" : "opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  isDone
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "border-primary text-primary animate-pulse"
                    : "border-border text-muted-foreground"
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              </span>
              <span className={cn(isActive && "font-medium text-foreground")}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Rotating tip */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent/10 p-3">
        <Lightbulb className="h-4 w-4 shrink-0 text-accent mt-0.5" />
        <p
          key={tipIndex}
          className="text-xs text-foreground/80 leading-relaxed animate-fade-in-up"
        >
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};

export default TryOnGenerationExperience;

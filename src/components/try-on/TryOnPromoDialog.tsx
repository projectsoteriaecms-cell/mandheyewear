import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, ArrowRight, X } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { track } from "@/shared/lib/telemetry";

/**
 * Landing-page nudge toward Virtual Try-On, for visitors who never notice the
 * feature exists (bottom-nav button and hamburger-menu entry both require
 * already knowing to look). Shows once, after a delay so it doesn't fight the
 * hero section for attention, and never again once someone has actually
 * visited /try-on -- see the mh_tryon_visited flag TryOn.tsx sets on mount.
 * A dismiss without visiting re-offers after a cooldown rather than a hard
 * one-time suppression, since "not now" isn't "never".
 */
const SHOW_DELAY_MS = 4500;
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const VISITED_KEY = "mh_tryon_visited";
const DISMISSED_KEY = "mh_tryon_promo_dismissed_at";

const shouldOffer = (): boolean => {
  try {
    if (localStorage.getItem(VISITED_KEY)) return false; // already knows about it
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS) return false;
    return true;
  } catch {
    return false; // private mode / storage disabled -- skip rather than risk a loop
  }
};

export const TryOnPromoDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldOffer()) return;
    const timer = setTimeout(() => {
      setOpen(true);
      void track("tryon.landing_promo_shown");
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    } catch {
      // ignore -- worst case it reappears next visit
    }
    void track("tryon.landing_promo_dismissed");
    setOpen(false);
  };

  const handleCtaClick = () => {
    void track("tryon.landing_promo_clicked");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0 border-mh-gold/20">
        <DialogTitle className="sr-only">Try our frames on your own face</DialogTitle>

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-ink px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-mh-gold/15 border border-mh-gold/30 mb-4">
            <Camera weight="fill" className="h-7 w-7 text-mh-gold" />
          </div>
          <h2 className="font-display font-extrabold text-xl text-cream leading-tight">
            See it on your face<br />before you buy
          </h2>
          <p className="text-sm text-cream/60 mt-2 leading-relaxed">
            Snap a photo and our AI shows you exactly how any frame looks —
            free, no app, takes seconds.
          </p>
        </div>

        <div className="p-4 space-y-2 bg-background">
          <Link
            to="/try-on"
            onClick={handleCtaClick}
            className="group flex items-center justify-center gap-2 w-full py-3 rounded-full bg-mh-gold text-ink font-display font-bold text-sm tracking-wide uppercase shadow-gold hover:scale-[1.02] transition-all"
          >
            Try It On Free
            <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={dismiss}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

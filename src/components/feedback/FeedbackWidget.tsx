/**
 * FeedbackWidget
 * Floating QA feedback button — visible to all authenticated users.
 * Opens a compact modal to capture: type, star rating, free text, name.
 * Submits to the qa_feedback table in Supabase.
 */
import { useState } from "react";
import { MessageSquarePlus, X, Send, Star, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useProfile } from "@/modules/personalization";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackType = "bug" | "suggestion" | "confused" | "praise";

interface FeedbackTypeOption {
  value: FeedbackType;
  emoji: string;
  label: string;
  color: string;
}

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  { value: "bug",        emoji: "🐛", label: "Bug",        color: "border-red-400   bg-red-50   dark:bg-red-950/30   text-red-700   dark:text-red-400"  },
  { value: "confused",   emoji: "❓", label: "Confused",   color: "border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
  { value: "suggestion", emoji: "💡", label: "Idea",       color: "border-blue-400  bg-blue-50  dark:bg-blue-950/30  text-blue-700  dark:text-blue-400"  },
  { value: "praise",     emoji: "🎉", label: "Love it",    color: "border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const FeedbackWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [text, setText] = useState("");
  const [testerName, setTesterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) return null;

  const handleOpen = () => {
    setTesterName(profile?.full_name || "");
    setOpen(true);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after close animation
    setTimeout(() => {
      setFeedbackType(null);
      setStars(0);
      setHoverStars(0);
      setText("");
      setSuccess(false);
    }, 200);
  };

  const handleSubmit = async () => {
    if (!feedbackType || !text.trim()) return;
    setSubmitting(true);

    try {
      await supabase.from("qa_feedback").insert({
        tester_name: testerName || profile?.full_name || "Anonymous",
        tester_email: profile?.email || user?.email || null,
        page_url: window.location.pathname + window.location.search,
        page_title: document.title,
        feedback_type: feedbackType,
        star_rating: stars || null,
        feedback_text: text.trim(),
        user_id: user?.id || null,
      });
      setSuccess(true);
      setTimeout(handleClose, 1800);
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!feedbackType && text.trim().length > 3 && !submitting;

  return (
    <>
      {/* Floating pill button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 sm:bottom-6 z-40 flex items-center gap-2 bg-white dark:bg-zinc-800 border border-border text-foreground hover:border-amber-400 hover:shadow-gold text-xs font-semibold rounded-full shadow-md px-3.5 py-2 transition-all hover:scale-105"
          title="Give feedback on this page"
          aria-label="Open feedback form"
        >
          <MessageSquarePlus className="h-3.5 w-3.5 text-amber-500" />
          Feedback
        </button>
      )}

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end sm:pr-6 sm:pb-6">
          {/* Backdrop — close on click */}
          <div
            className="absolute inset-0 bg-black/30 sm:bg-transparent"
            onClick={handleClose}
          />

          {/* Card */}
          <div
            className="relative w-full sm:w-96 bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colour bar */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-yellow-500" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Leave Feedback</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {window.location.pathname}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close feedback"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {success ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
                <p className="font-semibold text-foreground">Thanks for the feedback!</p>
                <p className="text-xs text-muted-foreground text-center">
                  It's been saved and the team will review it shortly.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Type selector */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">What type of feedback?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {FEEDBACK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setFeedbackType(t.value)}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 py-2 text-xs font-medium transition-all ${
                          feedbackType === t.value
                            ? t.color + " border-2"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted"
                        }`}
                      >
                        <span className="text-base leading-none">{t.emoji}</span>
                        <span className="leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Rate this section <span className="text-muted-foreground/60">(optional)</span>
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onMouseEnter={() => setHoverStars(n)}
                        onMouseLeave={() => setHoverStars(0)}
                        onClick={() => setStars(n === stars ? 0 : n)}
                        aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            n <= (hoverStars || stars)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free text */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Describe what you noticed <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. The filter button wasn't working on mobile, or the checkout form was confusing..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* Tester name */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Your name</p>
                  <input
                    type="text"
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    placeholder="Your name or initials"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-2.5 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
  useProductReviews,
  useReviewStats,
  useUserReview,
  useSubmitReview,
  useDeleteReview,
  type ProductReview,
} from "./hooks/useProductReviews";

interface ProductReviewsProps {
  productId: string;
}

/* ── Star Rating Input ─────────────────────────────── */
function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              (hover || value) >= s
                ? "fill-accent text-accent"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

/* ── Stars (read-only) ──────────────────────────────── */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            cls,
            s <= Math.round(rating)
              ? "fill-accent text-accent"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

/* ── Review Card ────────────────────────────────────── */
function ReviewCard({ review, isOwn, onDelete }: { review: ProductReview; isOwn: boolean; onDelete: () => void }) {
  const date = new Date(review.created_at).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">
              {(review.profiles as any)?.full_name || "Customer"}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars rating={review.rating} size="xs" />
              <span className="text-[11px] text-muted-foreground">{date}</span>
            </div>
          </div>
        </div>
        {review.is_verified_purchase && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 flex-shrink-0">
            <CheckCircle className="h-3 w-3" /> Verified Purchase
          </span>
        )}
      </div>

      {review.title && (
        <p className="mt-2 text-sm font-semibold">{review.title}</p>
      )}
      {review.body && (
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
      )}

      {isOwn && (
        <Button variant="ghost" size="sm" className="mt-2 text-xs text-destructive" onClick={onDelete}>
          Delete my review
        </Button>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data: reviews, isLoading } = useProductReviews(productId);
  const stats = useReviewStats(productId);
  const { isAuthenticated, user } = useAuth();
  const { data: userReview } = useUserReview(productId);
  const submitReview = useSubmitReview();
  const deleteReview = useDeleteReview();

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    submitReview.mutate(
      { productId, rating, title, body },
      { onSuccess: () => { setShowForm(false); setRating(0); setTitle(""); setBody(""); } }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-foreground">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Average */}
        <div className="text-center sm:text-left flex-shrink-0">
          <p className="text-4xl font-bold text-foreground">
            {stats.total > 0 ? stats.average.toFixed(1) : "—"}
          </p>
          <Stars rating={stats.average} />
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total} {stats.total === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-right text-muted-foreground">{star}</span>
                <Star className="h-3 w-3 fill-accent text-accent" />
                <Progress value={pct} className="flex-1 h-2" />
                <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review CTA */}
      {isAuthenticated && !userReview && !showForm && (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Write a Review
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <p className="font-semibold text-sm">Your Rating</p>
          <StarRatingInput value={rating} onChange={setRating} />
          <Input
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <Textarea
            placeholder="Tell others about your experience…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="hero"
              size="sm"
              onClick={handleSubmit}
              disabled={rating === 0 || submitReview.isPending}
            >
              {submitReview.isPending ? "Submitting…" : "Submit Review"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Existing user review notice */}
      {userReview && (
        <p className="text-sm text-muted-foreground italic">You've already reviewed this product.</p>
      )}

      {/* Review List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews && reviews.length > 0 ? (
        <div className="divide-y-0">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              isOwn={r.user_id === user?.id}
              onDelete={() => deleteReview.mutate({ reviewId: r.id, productId })}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4">
          No reviews yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
};

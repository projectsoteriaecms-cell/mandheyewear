import { cn } from "@/lib/utils";
import { Sparkles, Check } from "lucide-react";

interface MatchBadgeProps {
  score: number;
  reasons?: string[];
  size?: "sm" | "md";
  showScore?: boolean;
}

export const MatchBadge = ({
  score,
  reasons = [],
  size = "sm",
  showScore = true,
}: MatchBadgeProps) => {
  if (score < 40) return null;

  const isGreatMatch = score >= 70;
  const isGoodMatch = score >= 40 && score < 70;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        isGreatMatch
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-primary/10 text-primary"
      )}
    >
      {isGreatMatch ? (
        <Sparkles className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <Check className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      <span>
        {isGreatMatch ? "Great Match" : "Good Match"}
        {showScore && ` ${score}%`}
      </span>
    </div>
  );
};

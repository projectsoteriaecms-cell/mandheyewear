import { Badge } from "@/components/ui/badge";
import { RANK_LABELS } from "../hooks/useCustomerRanks";
import { cn } from "@/shared/lib/utils";
import { Crown, Zap, User, Mail, Sparkles } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const RANK_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Mail,
  2: Sparkles,
  3: User,
  4: Zap,
  5: Crown,
};

export function RankBadge({ rank, size = "md", showIcon = true, className }: RankBadgeProps) {
  const rankInfo = RANK_LABELS[rank] || RANK_LABELS[1];
  const Icon = RANK_ICONS[rank];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge className={cn("inline-flex items-center gap-1", rankInfo.color, sizeClasses[size], className)}>
      {showIcon && Icon && <Icon className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />}
      {rankInfo.label}
    </Badge>
  );
}

export function RankBadgeWithDetail({ rank, engagementScore, className }: RankBadgeProps & { engagementScore?: number }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RankBadge rank={rank} size="md" showIcon={true} />
      {engagementScore !== undefined && (
        <span className="text-xs text-muted-foreground">
          Score: {engagementScore.toFixed(1)}
        </span>
      )}
    </div>
  );
}

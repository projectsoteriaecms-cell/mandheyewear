import { cn } from "@/lib/utils";
import { Check, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FitType = "perfect" | "good" | "narrow" | "wide" | null;

interface FitIndicatorProps {
  fit: FitType;
  size?: "sm" | "md";
}

const FIT_CONFIG = {
  perfect: {
    label: "Perfect Fit",
    description: "Frame width matches your face perfectly",
    icon: Check,
    className: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  good: {
    label: "Good Fit",
    description: "Frame width is close to your ideal size",
    icon: Check,
    className: "text-primary bg-primary/10",
  },
  narrow: {
    label: "Narrow Fit",
    description: "Frame may be narrower than your ideal size",
    icon: ChevronLeft,
    className: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  },
  wide: {
    label: "Wide Fit",
    description: "Frame may be wider than your ideal size",
    icon: ChevronRight,
    className: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
  },
};

export const FitIndicator = ({ fit, size = "sm" }: FitIndicatorProps) => {
  if (!fit) return null;

  const config = FIT_CONFIG[fit];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full font-medium cursor-help",
              size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
              config.className
            )}
          >
            <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
            <span>{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

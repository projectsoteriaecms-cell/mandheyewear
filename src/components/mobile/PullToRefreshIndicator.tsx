import { ArrowClockwise } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  pullProgress: number;
  isRefreshing: boolean;
  className?: string;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  pullProgress,
  isRefreshing,
  className,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200",
        className
      )}
      style={{
        height: pullDistance,
        opacity: pullProgress,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm",
          isRefreshing && "animate-pulse"
        )}
      >
        <ArrowClockwise
          weight="bold"
          className={cn(
            "h-5 w-5 text-primary transition-transform duration-200",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing
              ? undefined
              : `rotate(${pullProgress * 360}deg)`,
          }}
        />
      </div>
    </div>
  );
};

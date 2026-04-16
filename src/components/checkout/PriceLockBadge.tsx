import { Clock, Lock } from "lucide-react";

export const PriceLockBadge = () => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-accent/30 bg-accent/5">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/15 shrink-0">
        <Lock className="h-4 w-4 text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Price locked for 48 hours
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3 inline" />
          Your cart prices are protected against Naira fluctuations
        </p>
      </div>
    </div>
  );
};

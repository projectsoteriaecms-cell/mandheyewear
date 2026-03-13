import { WifiOff } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator = ({ className }: OfflineIndicatorProps) => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[70] bg-destructive text-destructive-foreground",
        "py-2 px-4 text-center text-sm font-medium",
        "flex items-center justify-center gap-2",
        "animate-fade-in",
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You're offline. Some features may be unavailable.</span>
    </div>
  );
};

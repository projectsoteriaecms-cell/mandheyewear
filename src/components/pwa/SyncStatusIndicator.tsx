/**
 * Sync Status Indicator
 * Shows pending sync count and status in the UI
 */

import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const SyncStatusIndicator = ({
  className,
  showLabel = false,
}: SyncStatusIndicatorProps) => {
  const { isOnline, syncStatus, pendingCount, triggerSync } = useOfflineSync();

  // Don't show if online with no pending items
  if (isOnline && pendingCount === 0 && syncStatus === "idle") {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        label: "Offline",
        description: `${pendingCount} changes waiting to sync`,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        animate: false,
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          icon: RefreshCw,
          label: "Syncing",
          description: "Syncing your changes...",
          color: "text-primary",
          bgColor: "bg-primary/10",
          animate: true,
        };
      case "error":
        return {
          icon: AlertCircle,
          label: "Sync Error",
          description: `${pendingCount} changes failed to sync. Tap to retry.`,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          animate: false,
        };
      case "success":
        return {
          icon: Check,
          label: "Synced",
          description: "All changes saved",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-500/10",
          animate: false,
        };
      default:
        if (pendingCount > 0) {
          return {
            icon: Cloud,
            label: "Pending",
            description: `${pendingCount} changes to sync`,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-500/10",
            animate: false,
          };
        }
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  const handleClick = () => {
    if (isOnline && (syncStatus === "error" || pendingCount > 0)) {
      triggerSync();
    }
  };

  const content = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isOnline || syncStatus === "syncing"}
      className={cn(
        "gap-2 px-2 h-8",
        config.bgColor,
        config.color,
        "hover:opacity-80",
        className
      )}
    >
      <Icon
        className={cn("h-4 w-4", config.animate && "animate-spin")}
      />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
      {pendingCount > 0 && (
        <span
          className={cn(
            "flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full",
            "bg-current/20"
          )}
        >
          {pendingCount}
        </span>
      )}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

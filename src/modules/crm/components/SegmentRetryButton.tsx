import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { useEnqueueSegmentEval, useSegmentEvalStatus } from "../hooks/useSegmentEval";
import { cn } from "@/lib/utils";

interface SegmentRetryButtonProps {
  segmentId: string;
  /** Show a compact icon-only button (default: false) */
  compact?: boolean;
}

const STATUS_META = {
  pending:   { label: "Queued",     icon: Clock,       color: "text-yellow-500" },
  running:   { label: "Evaluating…",icon: Loader2,     color: "text-blue-500"  },
  succeeded: { label: "Up to date", icon: CheckCircle, color: "text-green-500" },
  failed:    { label: "Failed",     icon: AlertCircle, color: "text-red-500"   },
} as const;

export function SegmentRetryButton({ segmentId, compact = false }: SegmentRetryButtonProps) {
  const { data: job } = useSegmentEvalStatus(segmentId);
  const enqueue = useEnqueueSegmentEval();

  const status = job?.status ?? null;
  const meta = status ? STATUS_META[status] : null;
  const isRunning = status === "running" || enqueue.isPending;
  const Icon = meta?.icon ?? RefreshCw;

  const handleTrigger = () => {
    if (!isRunning) enqueue.mutate(segmentId);
  };

  const tooltipText = (() => {
    if (!job) return "Run segment evaluation";
    if (status === "failed") {
      const err = job.last_error ?? "unknown error";
      const exhausted = job.attempt_count >= job.max_attempts;
      return exhausted
        ? `Failed after ${job.attempt_count} attempts: ${err}. Click to retry manually.`
        : `Failed (attempt ${job.attempt_count}/${job.max_attempts}): ${err}. Click to retry.`;
    }
    if (status === "succeeded" && job.completed_at) {
      return `Last evaluated ${new Date(job.completed_at).toLocaleString()}. Click to re-evaluate.`;
    }
    if (status === "running") return "Evaluation in progress…";
    if (status === "pending" && job.next_retry_at) {
      return `Retry scheduled at ${new Date(job.next_retry_at).toLocaleString()}. Click to run now.`;
    }
    return "Click to evaluate segment";
  })();

  const button = (
    <Button
      variant={status === "failed" ? "destructive" : "outline"}
      size={compact ? "icon" : "sm"}
      onClick={handleTrigger}
      disabled={isRunning}
      className={cn("gap-1.5", compact && "h-7 w-7")}
      aria-label={tooltipText}
    >
      <Icon
        className={cn(
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          meta?.color,
          isRunning && "animate-spin",
        )}
      />
      {!compact && (
        <span>
          {isRunning ? "Running…" : status === "failed" ? "Retry" : "Re-evaluate"}
        </span>
      )}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}

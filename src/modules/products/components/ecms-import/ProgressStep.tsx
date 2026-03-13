import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ProgressStepProps } from "./types";

export const ProgressStep = ({ progress, onCancel }: ProgressStepProps) => {
  if (!progress) return null;

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Importing Products...</p>
        <p className="text-sm text-muted-foreground">
          Batch {progress.currentBatch} of {progress.totalBatches}
        </p>
      </div>

      <Progress value={(progress.processed / progress.total) * 100} className="h-3" />

      <div className="text-center text-sm text-muted-foreground">
        {progress.processed} of {progress.total} products processed
        {progress.estimatedTimeRemaining !== null && progress.estimatedTimeRemaining > 0 && (
          <span className="ml-2">
            • ~{formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">{progress.inserted}</p>
          <p className="text-sm text-muted-foreground">Inserted</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{progress.updated}</p>
          <p className="text-sm text-muted-foreground">Updated</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-600">{progress.skipped}</p>
          <p className="text-sm text-muted-foreground">Skipped</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive">{progress.failed}</p>
          <p className="text-sm text-muted-foreground">Failed</p>
        </div>
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel Import
        </Button>
      </div>
    </div>
  );
};

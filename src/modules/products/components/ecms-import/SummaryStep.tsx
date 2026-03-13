import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SummaryStepProps } from "./types";

export const SummaryStep = ({ progress, onDownloadErrorLog }: SummaryStepProps) => {
  if (!progress) return null;

  return (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <p className="text-2xl font-bold">Import Complete!</p>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-green-600">{progress.inserted}</p>
          <p className="text-sm text-muted-foreground">Inserted</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-blue-600">{progress.updated}</p>
          <p className="text-sm text-muted-foreground">Updated</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-amber-600">{progress.skipped}</p>
          <p className="text-sm text-muted-foreground">Skipped</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
          <p className="text-3xl font-bold text-destructive">{progress.failed}</p>
          <p className="text-sm text-muted-foreground">Failed</p>
        </div>
      </div>

      {progress.errors.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onDownloadErrorLog}>
            <Download className="mr-2 h-4 w-4" />
            Download Error Log
          </Button>
        </div>
      )}
    </div>
  );
};

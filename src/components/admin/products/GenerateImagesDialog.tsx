import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Lightning, Warning, CheckCircle, XCircle, Camera } from "@phosphor-icons/react";

interface GenerateImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingCount: number;
  onComplete: () => void;
}

interface BatchResult {
  productId: string;
  sku: string;
  success: boolean;
  error?: string;
  shots?: number;
}

export const GenerateImagesDialog = ({
  open,
  onOpenChange,
  missingCount,
  onComplete,
}: GenerateImagesDialogProps) => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "cancelled">("idle");
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [errors, setErrors] = useState<BatchResult[]>([]);
  const cancelRef = useRef(false);

  const total = missingCount;

  const reset = useCallback(() => {
    setStatus("idle");
    setProcessed(0);
    setSucceeded(0);
    setFailed(0);
    setErrors([]);
    cancelRef.current = false;
  }, []);

  const handleStart = useCallback(async () => {
    setStatus("running");
    cancelRef.current = false;
    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    const allErrors: BatchResult[] = [];

    while (!cancelRef.current) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-product-image", {
          body: { batchSize: 1 },
        });

        if (error) {
          console.error("Edge function error:", error);
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        if (!data || data.processed === 0) break;

        totalProcessed += data.processed;
        totalSucceeded += data.succeeded;
        totalFailed += data.failed;

        setProcessed(totalProcessed);
        setSucceeded(totalSucceeded);
        setFailed(totalFailed);

        const batchErrors = (data.results || []).filter((r: BatchResult) => !r.success);
        if (batchErrors.length > 0) {
          allErrors.push(...batchErrors);
          setErrors([...allErrors]);
        }

        if (data.remaining <= 0) break;

        // Brief pause between products
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error("Batch error:", err);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    setStatus(cancelRef.current ? "cancelled" : "done");
    onComplete();
  }, [onComplete]);

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const handleClose = () => {
    if (status === "running") return;
    reset();
    onOpenChange(false);
  };

  const progressPercent = total > 0 ? Math.min(100, (processed / total) * 100) : 0;
  const estimatedMinutes = Math.ceil((total - processed) * 0.6); // ~35s per product

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" weight="fill" />
            Generate Product Image Gallery
          </DialogTitle>
          <DialogDescription>
            {status === "idle" &&
              `Generate AI product images for ${missingCount.toLocaleString()} products missing primary images. Frame products get a full 6-shot luxury gallery.`}
            {status === "running" && "Generating images — 1 product at a time..."}
            {status === "done" && "Image generation complete!"}
            {status === "cancelled" && "Generation was cancelled. Progress is saved."}
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <Warning className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                <div>
                  <p className="font-medium">6-Shot Luxury Gallery for Frames</p>
                  <p className="mt-1 text-xs opacity-80">
                    Each frame product generates 6 professional shots: Hero (3/4 view), Front, Side
                    Profile, Rear/Interior, Macro Detail, and M&H Packaging. Non-frame products get a
                    single studio shot. Branded frames preserve original logos.
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    Estimated time: ~{Math.ceil(missingCount * 0.6)} minutes for all products.
                    You can cancel and resume at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(status === "running" || status === "done" || status === "cancelled") && (
          <div className="space-y-4">
            <Progress value={progressPercent} className="h-3" />
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <p className="text-muted-foreground">Processed</p>
                <p className="text-lg font-semibold">{processed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" /> Success
                </p>
                <p className="text-lg font-semibold text-green-600">{succeeded.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" /> Failed
                </p>
                <p className="text-lg font-semibold text-red-600">{failed.toLocaleString()}</p>
              </div>
            </div>

            {status === "running" && (
              <p className="text-xs text-muted-foreground text-center">
                {Math.max(0, total - processed).toLocaleString()} remaining •{" "}
                ~{estimatedMinutes} min left • Frames → 6 shots, others → 1 shot
              </p>
            )}

            {errors.length > 0 && (
              <div className="max-h-24 overflow-y-auto rounded border p-2 text-xs text-muted-foreground space-y-1">
                {errors.slice(-5).map((e, i) => (
                  <p key={i} className="text-red-500">
                    {e.sku}: {e.error}
                  </p>
                ))}
                {errors.length > 5 && (
                  <p className="text-muted-foreground">...and {errors.length - 5} more errors</p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {status === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleStart}>
                <Lightning className="h-4 w-4 mr-1" weight="fill" />
                Start Generating
              </Button>
            </>
          )}
          {status === "running" && (
            <Button variant="destructive" onClick={handleCancel}>
              Stop Generation
            </Button>
          )}
          {(status === "done" || status === "cancelled") && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useRef, useCallback, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Lightning, Warning, CheckCircle, XCircle, Camera, Pause, DownloadSimple } from "@phosphor-icons/react";

interface CategoryCount {
  type: string;
  label: string;
  missing: number;
  shots: number;
}

interface GenerateImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryCounts: CategoryCount[];
  onComplete: () => void;
}

interface BatchResult {
  productId: string;
  sku: string;
  name?: string;
  brand?: string | null;
  success: boolean;
  error?: string;
  shots?: number;
}

const BATCH_LIMITS = [
  { value: "10", label: "10 products" },
  { value: "25", label: "25 products" },
  { value: "50", label: "50 products" },
  { value: "100", label: "100 products" },
  { value: "all", label: "All" },
];

const CONSECUTIVE_FAIL_THRESHOLD = 5;

function exportErrorsCSV(errors: BatchResult[]) {
  const header = "SKU,Name,Brand,Error\n";
  const rows = errors.map((e) => {
    const sku = `"${(e.sku || "").replace(/"/g, '""')}"`;
    const name = `"${(e.name || "").replace(/"/g, '""')}"`;
    const brand = `"${(e.brand || "").replace(/"/g, '""')}"`;
    const error = `"${(e.error || "").replace(/"/g, '""')}"`;
    return `${sku},${name},${brand},${error}`;
  }).join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `image-generation-errors-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const GenerateImagesDialog = ({
  open,
  onOpenChange,
  categoryCounts,
  onComplete,
}: GenerateImagesDialogProps) => {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "cancelled" | "paused">("idle");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [batchLimit, setBatchLimit] = useState("50");
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [errors, setErrors] = useState<BatchResult[]>([]);
  const [currentProduct, setCurrentProduct] = useState<{ sku: string; name: string; brand?: string | null } | null>(null);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const totalSelected = useMemo(
    () => categoryCounts.filter((c) => selectedTypes.includes(c.type)).reduce((sum, c) => sum + c.missing, 0),
    [categoryCounts, selectedTypes]
  );

  const effectiveLimit = batchLimit === "all" ? totalSelected : Math.min(Number(batchLimit), totalSelected);

  // Cost estimation: frames = 6 API calls, others = 1
  const estimatedApiCalls = useMemo(() => {
    let calls = 0;
    categoryCounts.filter((c) => selectedTypes.includes(c.type)).forEach((c) => {
      const count = batchLimit === "all" ? c.missing : Math.min(c.missing, Math.ceil(Number(batchLimit || 50) * (c.missing / totalSelected)));
      calls += count * c.shots;
    });
    return Math.round(calls) || 0;
  }, [categoryCounts, selectedTypes, batchLimit, totalSelected]);

  const estimatedMinutes = Math.ceil(
    selectedTypes.includes("frames")
      ? effectiveLimit * 0.6
      : effectiveLimit * 0.15
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const reset = useCallback(() => {
    setStatus("idle");
    setProcessed(0);
    setSucceeded(0);
    setFailed(0);
    setErrors([]);
    setSelectedTypes([]);
    setBatchLimit("50");
    setCurrentProduct(null);
    setPauseReason(null);
    cancelRef.current = false;
  }, []);

  const handleStart = useCallback(async () => {
    setStatus("running");
    cancelRef.current = false;
    setPauseReason(null);
    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    let consecutiveFailures = 0;
    const allErrors: BatchResult[] = [];
    const maxProducts = batchLimit === "all" ? undefined : Number(batchLimit);

    while (!cancelRef.current) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-product-image", {
          body: { batchSize: 1, itemTypes: selectedTypes, maxProducts },
        });

        if (error) {
          console.error("Edge function error:", error);
          consecutiveFailures++;
          if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
            setPauseReason(`Auto-paused: ${CONSECUTIVE_FAIL_THRESHOLD} consecutive failures. This may indicate a systemic issue (API rate limits, missing keys, etc.).`);
            setStatus("paused");
            onComplete();
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        if (!data || data.processed === 0) break;

        // Update live ticker with current product info
        const lastResult = data.results?.[data.results.length - 1];
        if (lastResult) {
          setCurrentProduct({ sku: lastResult.sku, name: lastResult.name || lastResult.sku, brand: lastResult.brand });
        }

        totalProcessed += data.processed;
        totalSucceeded += data.succeeded;
        totalFailed += data.failed;

        setProcessed(totalProcessed);
        setSucceeded(totalSucceeded);
        setFailed(totalFailed);

        // Track consecutive failures for auto-pause
        const batchErrors = (data.results || []).filter((r: BatchResult) => !r.success);
        if (batchErrors.length > 0) {
          consecutiveFailures += batchErrors.length;
          allErrors.push(...batchErrors);
          setErrors([...allErrors]);
        } else {
          consecutiveFailures = 0; // Reset on success
        }

        // Check auto-pause threshold
        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive failures detected. Check API configuration before resuming.`);
          setStatus("paused");
          onComplete();
          return;
        }

        if (data.remaining <= 0) break;
        if (maxProducts && totalProcessed >= maxProducts) break;

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error("Batch error:", err);
        consecutiveFailures++;
        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive errors. Please investigate before continuing.`);
          setStatus("paused");
          onComplete();
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    setStatus(cancelRef.current ? "cancelled" : "done");
    setCurrentProduct(null);
    onComplete();
  }, [onComplete, selectedTypes, batchLimit]);

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const handleClose = () => {
    if (status === "running") return;
    reset();
    onOpenChange(false);
  };

  const progressPercent = effectiveLimit > 0 ? Math.min(100, (processed / effectiveLimit) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" weight="fill" />
            Generate Product Images
          </DialogTitle>
          <DialogDescription>
            {status === "idle" && "Select which product categories to generate images for."}
            {status === "running" && "Generating images — 1 product at a time..."}
            {status === "done" && "Image generation complete!"}
            {status === "cancelled" && "Generation was cancelled. Progress is saved."}
            {status === "paused" && "Generation paused due to consecutive failures."}
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <div className="space-y-4">
            {/* Category checkboxes */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Select product categories:</p>
              <div className="space-y-1.5 rounded-lg border p-3">
                {categoryCounts.filter((c) => c.missing > 0).map((cat) => (
                  <label
                    key={cat.type}
                    className="flex items-center justify-between cursor-pointer py-1 hover:bg-muted/50 rounded px-1 -mx-1"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTypes.includes(cat.type)}
                        onCheckedChange={() => toggleType(cat.type)}
                      />
                      <span className="text-sm">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">
                        ({cat.missing.toLocaleString()})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {cat.shots === 6 ? "6-shot gallery" : "1 shot"}
                    </span>
                  </label>
                ))}
                {categoryCounts.filter((c) => c.missing > 0).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    All products have images!
                  </p>
                )}
              </div>
            </div>

            {/* Batch limit */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">
                Batch limit:
              </label>
              <Select value={batchLimit} onValueChange={setBatchLimit}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BATCH_LIMITS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            {selectedTypes.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <Warning className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                  <div>
                    <p className="font-medium">
                      {effectiveLimit.toLocaleString()} product{effectiveLimit !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">
                      ~{estimatedApiCalls.toLocaleString()} API calls • ~{estimatedMinutes} min • Auto-pauses after {CONSECUTIVE_FAIL_THRESHOLD} consecutive failures
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(status === "running" || status === "done" || status === "cancelled" || status === "paused") && (
          <div className="space-y-4">
            <Progress value={progressPercent} className="h-3" />

            {/* Live ticker — currently processing product */}
            {status === "running" && currentProduct && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground animate-pulse">
                <Camera className="h-3.5 w-3.5 flex-shrink-0 text-primary" weight="fill" />
                <span className="truncate">
                  Processing: <span className="font-medium text-foreground">{currentProduct.sku}</span>
                  {currentProduct.brand && <> — {currentProduct.brand}</>}
                  {currentProduct.name !== currentProduct.sku && <> — {currentProduct.name}</>}
                </span>
              </div>
            )}

            {/* Auto-pause warning */}
            {status === "paused" && pauseReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                <div className="flex items-start gap-2">
                  <Pause className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                  <p>{pauseReason}</p>
                </div>
              </div>
            )}

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
                {Math.max(0, effectiveLimit - processed).toLocaleString()} remaining •{" "}
                ~{Math.ceil((effectiveLimit - processed) * 0.3)} min left
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
              <Button onClick={handleStart} disabled={selectedTypes.length === 0}>
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
          {(status === "done" || status === "cancelled" || status === "paused") && (
            <div className="flex gap-2 w-full justify-end">
              {errors.length > 0 && (
                <Button variant="outline" onClick={() => exportErrorsCSV(errors)}>
                  <DownloadSimple className="h-4 w-4 mr-1" />
                  Export Errors ({errors.length})
                </Button>
              )}
              <Button onClick={handleClose}>Close</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

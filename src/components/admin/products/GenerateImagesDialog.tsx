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

interface SelectedProduct {
  id: string;
  name: string;
  sku: string;
  item_type?: string | null;
  brand?: string | null;
}

interface GenerateImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryCounts: CategoryCount[];
  onComplete: () => void;
  /** When provided, generates for these specific products instead of bulk categories */
  selectedProducts?: SelectedProduct[];
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
  selectedProducts,
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

  const isSelectionMode = !!selectedProducts && selectedProducts.length > 0;

  // Selection mode: compute summary
  const selectionSummary = useMemo(() => {
    if (!selectedProducts) return null;
    const frames = selectedProducts.filter((p) => p.item_type === "frames");
    const nonFrames = selectedProducts.filter((p) => p.item_type !== "frames");
    const frameShots = frames.length * 6;
    const nonFrameShots = nonFrames.length * 1;
    return {
      total: selectedProducts.length,
      frames: frames.length,
      nonFrames: nonFrames.length,
      totalShots: frameShots + nonFrameShots,
    };
  }, [selectedProducts]);

  // Bulk mode totals
  const totalSelected = useMemo(
    () => categoryCounts.filter((c) => selectedTypes.includes(c.type)).reduce((sum, c) => sum + c.missing, 0),
    [categoryCounts, selectedTypes]
  );

  const effectiveLimit = isSelectionMode
    ? (selectedProducts?.length ?? 0)
    : batchLimit === "all"
      ? totalSelected
      : Math.min(Number(batchLimit), totalSelected);

  // Cost estimation for bulk mode
  const estimatedApiCalls = useMemo(() => {
    if (isSelectionMode) return selectionSummary?.totalShots ?? 0;
    let calls = 0;
    categoryCounts.filter((c) => selectedTypes.includes(c.type)).forEach((c) => {
      const count = batchLimit === "all" ? c.missing : Math.min(c.missing, Math.ceil(Number(batchLimit || 50) * (c.missing / totalSelected)));
      calls += count * c.shots;
    });
    return Math.round(calls) || 0;
  }, [categoryCounts, selectedTypes, batchLimit, totalSelected, isSelectionMode, selectionSummary]);

  const estimatedMinutes = Math.ceil(
    isSelectionMode
      ? (selectionSummary?.frames ?? 0) * 0.6 + (selectionSummary?.nonFrames ?? 0) * 0.15
      : selectedTypes.includes("frames")
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

  // Per-product sequential generation (selection mode)
  const handleStartSelection = useCallback(async () => {
    if (!selectedProducts) return;
    setStatus("running");
    cancelRef.current = false;
    setPauseReason(null);

    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    let consecutiveFailures = 0;
    const allErrors: BatchResult[] = [];

    for (const product of selectedProducts) {
      if (cancelRef.current) break;

      setCurrentProduct({ sku: product.sku, name: product.name, brand: product.brand });

      try {
        const { data, error } = await supabase.functions.invoke("generate-product-image", {
          body: { productId: product.id },
        });

        totalProcessed++;

        if (error || !data?.succeeded) {
          totalFailed++;
          consecutiveFailures++;
          const errResult: BatchResult = {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            success: false,
            error: error?.message || data?.results?.[0]?.error || "Unknown error",
          };
          allErrors.push(errResult);
          setErrors([...allErrors]);
        } else {
          totalSucceeded++;
          consecutiveFailures = 0;
        }

        setProcessed(totalProcessed);
        setSucceeded(totalSucceeded);
        setFailed(totalFailed);

        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive failures. Check API configuration.`);
          setStatus("paused");
          onComplete();
          return;
        }

        // Brief pause between requests
        if (!cancelRef.current) {
          await new Promise((r) => setTimeout(r, 800));
        }
      } catch (err) {
        totalProcessed++;
        totalFailed++;
        consecutiveFailures++;
        const errResult: BatchResult = {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          success: false,
          error: (err as Error).message || "Network error",
        };
        allErrors.push(errResult);
        setErrors([...allErrors]);
        setProcessed(totalProcessed);
        setFailed(totalFailed);

        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive errors.`);
          setStatus("paused");
          onComplete();
          return;
        }
      }
    }

    setStatus(cancelRef.current ? "cancelled" : "done");
    setCurrentProduct(null);
    onComplete();
  }, [selectedProducts, onComplete]);

  // Bulk category generation (existing logic)
  const handleStartBulk = useCallback(async () => {
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
          consecutiveFailures++;
          if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
            setPauseReason(`Auto-paused: ${CONSECUTIVE_FAIL_THRESHOLD} consecutive failures.`);
            setStatus("paused");
            onComplete();
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        if (!data || data.processed === 0) break;

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

        const batchErrors = (data.results || []).filter((r: BatchResult) => !r.success);
        if (batchErrors.length > 0) {
          consecutiveFailures += batchErrors.length;
          allErrors.push(...batchErrors);
          setErrors([...allErrors]);
        } else {
          consecutiveFailures = 0;
        }

        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive failures.`);
          setStatus("paused");
          onComplete();
          return;
        }

        if (data.remaining <= 0) break;
        if (maxProducts && totalProcessed >= maxProducts) break;

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        consecutiveFailures++;
        if (consecutiveFailures >= CONSECUTIVE_FAIL_THRESHOLD) {
          setPauseReason(`Auto-paused: ${consecutiveFailures} consecutive errors.`);
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

  const handleStart = isSelectionMode ? handleStartSelection : handleStartBulk;

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const handleClose = () => {
    if (status === "running") return;
    reset();
    onOpenChange(false);
  };

  const progressPercent = effectiveLimit > 0 ? Math.min(100, (processed / effectiveLimit) * 100) : 0;

  const canStart = isSelectionMode
    ? (selectedProducts?.length ?? 0) > 0
    : selectedTypes.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" weight="fill" />
            {isSelectionMode ? "Generate Images for Selected" : "Generate Product Images"}
          </DialogTitle>
          <DialogDescription>
            {status === "idle" && (isSelectionMode
              ? `${selectedProducts!.length} product${selectedProducts!.length !== 1 ? "s" : ""} selected for image generation.`
              : "Select which product categories to generate images for.")}
            {status === "running" && "Generating images — 1 product at a time..."}
            {status === "done" && "Image generation complete!"}
            {status === "cancelled" && "Generation was cancelled. Progress is saved."}
            {status === "paused" && "Generation paused due to consecutive failures."}
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <div className="space-y-4">
            {isSelectionMode ? (
              /* Selection mode summary */
              <div className="space-y-3">
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">Selected products:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedProducts!.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground font-mono ml-2">{p.sku}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectionSummary && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <Warning className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                      <div>
                        <p className="font-medium">
                          {selectionSummary.total} product{selectionSummary.total !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs opacity-80 mt-0.5">
                          {selectionSummary.frames > 0 && `${selectionSummary.frames} frame${selectionSummary.frames !== 1 ? "s" : ""} (${selectionSummary.frames * 6} shots)`}
                          {selectionSummary.frames > 0 && selectionSummary.nonFrames > 0 && " + "}
                          {selectionSummary.nonFrames > 0 && `${selectionSummary.nonFrames} other${selectionSummary.nonFrames !== 1 ? "s" : ""} (${selectionSummary.nonFrames} shot${selectionSummary.nonFrames !== 1 ? "s" : ""})`}
                          {" = "}~{selectionSummary.totalShots} API calls • ~{estimatedMinutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Bulk category mode */
              <>
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
              </>
            )}
          </div>
        )}

        {(status === "running" || status === "done" || status === "cancelled" || status === "paused") && (
          <div className="space-y-4">
            <Progress value={progressPercent} className="h-3" />

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

            {status === "paused" && pauseReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
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
                  <XCircle className="h-3 w-3 text-destructive" /> Failed
                </p>
                <p className="text-lg font-semibold text-destructive">{failed.toLocaleString()}</p>
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
                  <p key={i} className="text-destructive">
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
              <Button onClick={handleStart} disabled={!canStart}>
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

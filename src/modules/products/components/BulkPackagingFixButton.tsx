import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowsClockwise, Package, Trash } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LUXURY_BRANDS } from "@/modules/products/lib/brand-classification";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FixResult {
  productId: string;
  sku: string;
  brand: string;
  success: boolean;
  error?: string;
}

export const BulkPackagingFixButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [results, setResults] = useState<FixResult[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const runFix = useCallback(async () => {
    setShowConfirm(false);
    setIsRunning(true);
    setResults([]);

    try {
      const brandArray = Array.from(LUXURY_BRANDS);
      const { data: products, error } = await supabase
        .from("products")
        .select("id, sku, brand, image_url, additional_images")
        .eq("is_active", true)
        .eq("item_type", "frames")
        .not("additional_images", "is", null)
        .not("brand", "is", null);

      if (error) throw error;

      const affected = (products || []).filter((p) => {
        const brand = (p.brand || "").toUpperCase().trim();
        return (
          LUXURY_BRANDS.has(brand) &&
          Array.isArray(p.additional_images) &&
          p.additional_images.length >= 5
        );
      });

      if (affected.length === 0) {
        toast.info("No known-brand products with full galleries found.");
        setIsRunning(false);
        return;
      }

      setProgress({ done: 0, total: affected.length, failed: 0 });
      toast.info(`Starting packaging fix for ${affected.length} known-brand products…`);

      const allResults: FixResult[] = [];
      let failCount = 0;

      for (let i = 0; i < affected.length; i++) {
        const product = affected[i];
        try {
          const { data, error: fnError } = await supabase.functions.invoke(
            "generate-product-image",
            {
              body: {
                productId: product.id,
                shotSlug: "packaging",
                referenceImageUrls: product.image_url ? [product.image_url] : undefined,
              },
            }
          );

          if (fnError) throw fnError;
          const result = data as any;

          if (result?.succeeded === 1) {
            allResults.push({ productId: product.id, sku: product.sku, brand: product.brand || "", success: true });
          } else {
            failCount++;
            allResults.push({
              productId: product.id,
              sku: product.sku,
              brand: product.brand || "",
              success: false,
              error: result?.results?.[0]?.error || "Unknown error",
            });
          }
        } catch (err: any) {
          failCount++;
          allResults.push({
            productId: product.id,
            sku: product.sku,
            brand: product.brand || "",
            success: false,
            error: err?.message || "Network error",
          });
        }

        setProgress({ done: i + 1, total: affected.length, failed: failCount });
        setResults([...allResults]);

        if (i < affected.length - 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      const successCount = affected.length - failCount;
      toast.success(`Packaging fix complete: ${successCount} succeeded, ${failCount} failed`);
    } catch (err: any) {
      toast.error("Failed to start packaging fix: " + (err?.message || "Unknown error"));
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runCleanup = useCallback(async () => {
    setShowCleanupConfirm(false);
    setIsCleaningUp(true);

    try {
      toast.info("Removing M&H packaging from known-brand products…");

      const { data, error } = await supabase.functions.invoke("cleanup-brand-packaging", {
        method: "POST",
      });

      if (error) throw error;

      const result = data as any;
      if (result.error) throw new Error(result.error);

      toast.success(
        `Cleanup complete: ${result.packagingRemoved} packaging removed, ${result.primaryFixed} primary images fixed, ${result.storageDeleted} files deleted` +
        (result.errors?.length ? `. ${result.errors.length} errors.` : "")
      );

      if (result.errors?.length) {
        console.warn("Cleanup errors:", result.errors);
      }
    } catch (err: any) {
      toast.error("Cleanup failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsCleaningUp(false);
    }
  }, []);

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      {/* Regenerate packaging button */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={isRunning || isCleaningUp}
            className="whitespace-nowrap"
          >
            {isRunning ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Package className="mr-2 h-4 w-4" weight="light" />
            )}
            {isRunning
              ? `Fixing… ${progress.done}/${progress.total}`
              : "Fix Brand Packaging"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Known Brand Packaging?</AlertDialogTitle>
            <AlertDialogDescription>
              This will regenerate the packaging shot (last image) for all known-brand
              products with full galleries. The AI will use each brand's own name on
              the case instead of "M&H Opticals". This requires AI credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runFix}>Start Fix</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove M&H packaging button */}
      <AlertDialog open={showCleanupConfirm} onOpenChange={setShowCleanupConfirm}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setShowCleanupConfirm(true)}
            disabled={isRunning || isCleaningUp}
            className="whitespace-nowrap text-destructive hover:text-destructive"
          >
            {isCleaningUp ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Trash className="mr-2 h-4 w-4" weight="light" />
            )}
            {isCleaningUp ? "Removing…" : "Remove M&H Packaging"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove M&H Packaging from Known Brands?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the last gallery image (M&H-branded packaging/case) from
              all known-brand products that still have 5+ additional images. It will also
              fix any primary images that point to AI-generated shots instead of original
              reference photos. No AI credits needed — this is a data cleanup only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={runCleanup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Packaging
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isRunning && progress.total > 0 && (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Progress value={pct} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {progress.done}/{progress.total}
            {progress.failed > 0 && ` (${progress.failed} failed)`}
          </span>
        </div>
      )}
    </>
  );
};

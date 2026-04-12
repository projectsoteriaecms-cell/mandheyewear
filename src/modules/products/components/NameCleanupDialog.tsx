import { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowsClockwise, CheckCircle, WarningCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Preview {
  id: string;
  original_name: string;
  cleaned_name: string;
  original_brand: string | null;
  extracted_brand: string | null;
  brand_line: string;
  has_zoho: boolean;
}

interface CleanupResult {
  updated: number;
  failed: number;
  total: number;
  errors: { id: string; error: string }[];
  zoho_result?: unknown;
}

interface NameCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NameCleanupDialog({ open, onOpenChange }: NameCleanupDialogProps) {
  const [step, setStep] = useState<"filter" | "preview" | "processing" | "done">("filter");
  const [brandLine, setBrandLine] = useState("all");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [pushToZoho, setPushToZoho] = useState(true);
  const queryClient = useQueryClient();

  const reset = useCallback(() => {
    setStep("filter");
    setPreviews([]);
    setTotalCount(0);
    setLoading(false);
    setProcessing(false);
    setProgress(0);
    setResult(null);
  }, []);

  const handlePreview = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("clean-product-names", {
        body: { action: "preview", brand_line: brandLine, limit: 100 },
      });
      if (error) throw error;
      setPreviews(data.previews || []);
      setTotalCount(data.total || 0);
      setStep("preview");
    } catch (err) {
      toast.error(`Preview failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [brandLine]);

  const handleExecute = useCallback(async () => {
    setProcessing(true);
    setStep("processing");
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 5, 90));
      }, 2000);

      const { data, error } = await supabase.functions.invoke("clean-product-names", {
        body: { action: "execute", brand_line: brandLine, push_to_zoho: pushToZoho },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setResult(data);
      setStep("done");
      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Cleanup complete: ${data.updated} products cleaned`);
    } catch (err) {
      toast.error(`Cleanup failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStep("preview");
    } finally {
      setProcessing(false);
    }
  }, [brandLine, pushToZoho, queryClient]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Product Name Cleanup</DialogTitle>
          <DialogDescription>
            Clean up messy product names by removing category prefixes, embedded prices, and extracting brand names.
          </DialogDescription>
        </DialogHeader>

        {step === "filter" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Line Filter</label>
              <Select value={brandLine} onValueChange={setBrandLine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="soteria_medical">Soteria Medical</SelectItem>
                  <SelectItem value="m_and_h_fashion">M&H Fashion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? (
                  <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" weight="bold" />
                ) : (
                  <MagnifyingGlass className="mr-2 h-4 w-4" weight="light" />
                )}
                {loading ? "Loading…" : "Preview Changes"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{totalCount} products</Badge>
              <Badge variant="outline">need cleanup</Badge>
            </div>

            <ScrollArea className="h-72 border rounded-md">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="p-2 text-left">Original Name</th>
                    <th className="p-2 text-left">→ Cleaned Name</th>
                    <th className="p-2 text-left">Brand</th>
                  </tr>
                </thead>
                <tbody>
                  {previews.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="p-2 max-w-[250px] truncate text-muted-foreground line-through">
                        {p.original_name}
                      </td>
                      <td className="p-2 max-w-[250px] truncate font-medium">
                        {p.cleaned_name}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {p.extracted_brand ? (
                          <Badge variant="secondary" className="text-xs">{p.extracted_brand}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalCount > previews.length && (
                <p className="p-2 text-xs text-muted-foreground text-center">
                  Showing {previews.length} of {totalCount} products
                </p>
              )}
            </ScrollArea>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="push-zoho-cleanup"
                checked={pushToZoho}
                onChange={(e) => setPushToZoho(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="push-zoho-cleanup" className="text-sm">
                Push cleaned names to Zoho Books after update
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleExecute}>
                Clean {totalCount} Products
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "processing" && (
          <div className="py-8 space-y-4">
            <div className="flex items-center gap-2">
              <ArrowsClockwise className="h-5 w-5 animate-spin" weight="bold" />
              <span className="text-sm">Cleaning product names…</span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              This may take a few minutes for large catalogs. Do not close this dialog.
            </p>
          </div>
        )}

        {step === "done" && result && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" weight="fill" />
              <span className="font-medium">Cleanup Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{result.updated}</div>
                <div className="text-xs text-muted-foreground">Cleaned</div>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-xs text-muted-foreground">Processed</div>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold text-destructive">{result.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <WarningCircle className="h-4 w-4" weight="fill" />
                  <span>{result.errors.length} errors</span>
                </div>
                <ScrollArea className="h-24 border rounded-md p-2">
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-mono">{e.id.slice(0, 8)}</span>: {e.error}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => { reset(); onOpenChange(false); }}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

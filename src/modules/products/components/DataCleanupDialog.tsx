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
import { ArrowsClockwise, CheckCircle, WarningCircle, Upload } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";

interface ParsedProduct {
  sku: string;
  type: string;
  category: string;
  name: string;
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  add: number | null;
  price: number;
  qty: number;
  unit: string;
}

interface UploadResult {
  updated: number;
  inserted: number;
  failed: number;
  total: number;
  errors: { sku: string; error: string }[];
  zoho_result?: unknown;
}

function parsePrice(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

interface DataCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataCleanupDialog({ open, onOpenChange }: DataCleanupDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "done">("upload");
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pushToZoho, setPushToZoho] = useState(true);
  const queryClient = useQueryClient();

  const reset = useCallback(() => {
    setStep("upload");
    setProducts([]);
    setFileName("");
    setProcessing(false);
    setProgress(0);
    setResult(null);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];
      if (!ws) throw new Error("No worksheet found");

      // Find header row (look for "sku" in first 5 rows)
      let headerRow = 1;
      for (let r = 1; r <= 5; r++) {
        const cell = ws.getRow(r).getCell(1).value;
        if (cell && String(cell).toLowerCase().includes("sku")) {
          headerRow = r;
          break;
        }
      }

      const parsed: ParsedProduct[] = [];
      for (let r = headerRow + 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const sku = row.getCell(1).value;
        if (!sku) continue;

        const name = String(row.getCell(4).value || "").trim();
        if (!name) continue;

        parsed.push({
          sku: String(typeof sku === "number" ? Math.floor(sku) : sku),
          type: String(row.getCell(2).value || ""),
          category: String(row.getCell(3).value || ""),
          name,
          sph: row.getCell(5).value ? Number(row.getCell(5).value) : null,
          cyl: row.getCell(6).value ? Number(row.getCell(6).value) : null,
          axis: row.getCell(7).value ? Number(row.getCell(7).value) : null,
          add: row.getCell(8).value ? Number(row.getCell(8).value) : null,
          price: parsePrice(row.getCell(9).value),
          qty: Number(row.getCell(10).value) || 0,
          unit: String(row.getCell(11).value || "Item"),
        });
      }

      if (parsed.length === 0) {
        toast.error("No valid products found in the file");
        return;
      }

      setProducts(parsed);
      setStep("preview");
      toast.success(`Parsed ${parsed.length} products from ${file.name}`);
    } catch (err) {
      toast.error(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    setProcessing(true);
    setStep("processing");
    setProgress(10);

    try {
      // Send in batches of 100 to the edge function
      const BATCH = 100;
      let totalUpdated = 0;
      let totalInserted = 0;
      let totalFailed = 0;
      const allErrors: { sku: string; error: string }[] = [];

      for (let i = 0; i < products.length; i += BATCH) {
        const batch = products.slice(i, i + BATCH);
        const isLast = i + BATCH >= products.length;

        const { data, error } = await supabase.functions.invoke("bulk-product-update", {
          body: { products: batch, push_to_zoho: isLast && pushToZoho },
        });

        if (error) throw error;

        totalUpdated += data.updated || 0;
        totalInserted += data.inserted || 0;
        totalFailed += data.failed || 0;
        if (data.errors) allErrors.push(...data.errors);

        setProgress(Math.round(((i + batch.length) / products.length) * 90) + 10);
      }

      setResult({
        updated: totalUpdated,
        inserted: totalInserted,
        failed: totalFailed,
        total: products.length,
        errors: allErrors,
      });
      setStep("done");
      setProgress(100);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Update complete: ${totalUpdated} updated, ${totalInserted} new`);
    } catch (err) {
      toast.error(`Update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStep("preview");
    } finally {
      setProcessing(false);
    }
  }, [products, pushToZoho, queryClient]);

  // Category breakdown
  const categoryBreakdown = products.reduce((acc, p) => {
    const cat = p.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Data Cleanup Update</DialogTitle>
          <DialogDescription>
            Upload the cleaned product data file to update existing products and add new ones.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="py-8">
            <label
              htmlFor="cleanup-file"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" weight="light" />
              <span className="text-sm text-muted-foreground">
                Drop your Excel file here or click to browse
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Supports .xlsx and .xls formats
              </span>
              <input
                id="cleanup-file"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{fileName}</Badge>
              <Badge>{products.length} products</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(categoryBreakdown).map(([cat, count]) => (
                <div key={cat} className="flex justify-between p-2 bg-muted/50 rounded">
                  <span>{cat || "Uncategorized"}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>

            <ScrollArea className="h-48 border rounded-md">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b">
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 50).map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{p.sku}</td>
                      <td className="p-2 max-w-[200px] truncate">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2 text-right">₦{p.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 50 && (
                <p className="p-2 text-xs text-muted-foreground text-center">
                  … and {products.length - 50} more products
                </p>
              )}
            </ScrollArea>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="push-zoho"
                checked={pushToZoho}
                onChange={(e) => setPushToZoho(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="push-zoho" className="text-sm">
                Push corrections to Zoho Books after update
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>Cancel</Button>
              <Button onClick={handleConfirm}>
                Update {products.length} Products
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "processing" && (
          <div className="py-8 space-y-4">
            <div className="flex items-center gap-2">
              <ArrowsClockwise className="h-5 w-5 animate-spin" weight="bold" />
              <span className="text-sm">Processing updates…</span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              Please do not close this dialog until the update completes.
            </p>
          </div>
        )}

        {step === "done" && result && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" weight="fill" />
              <span className="font-medium">Update Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{result.updated}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div className="p-3 bg-muted/50 rounded">
                <div className="text-2xl font-bold">{result.inserted}</div>
                <div className="text-xs text-muted-foreground">New</div>
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
                      <span className="font-mono">{e.sku}</span>: {e.error}
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

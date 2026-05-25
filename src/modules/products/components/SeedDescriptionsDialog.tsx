import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/hooks/use-toast";
import {
  useSeedDescriptions,
  type SeedDryRunResult,
  type SeedCommitResult,
  type SeedSource,
} from "../hooks/useSeedDescriptions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SeedDescriptionsDialog = ({ open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const seed = useSeedDescriptions();

  const [source, setSource] = useState<SeedSource>("bundled");
  const [skipFilled, setSkipFilled] = useState(true);
  const [uploadedPayload, setUploadedPayload] = useState<{ rich?: any; structured?: any } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState<SeedDryRunResult | null>(null);
  const [commitResult, setCommitResult] = useState<SeedCommitResult | null>(null);

  const reset = () => {
    setDryRun(null);
    setCommitResult(null);
    setUploadedPayload(null);
    setFileName(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        // Minimal CSV → rich map: requires headers "sku,headline,short_description"
        const lines = text.split(/\r?\n/).filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim());
        const rich: Record<string, any> = {};
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",");
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));
          if (row.sku) rich[row.sku] = row;
        }
        setUploadedPayload({ rich });
      } else {
        const parsed = JSON.parse(text);
        // Accept either { rich, structured } or a flat map keyed by SKU
        if (parsed?.rich || parsed?.structured) setUploadedPayload(parsed);
        else setUploadedPayload({ rich: parsed });
      }
      toast({ title: "File loaded", description: file.name });
    } catch (e) {
      toast({ title: "Failed to parse file", description: (e as Error).message, variant: "destructive" });
      setUploadedPayload(null);
    }
  };

  const runDryRun = async () => {
    setCommitResult(null);
    try {
      const res = (await seed.mutateAsync({
        mode: "dry_run",
        source,
        skipFilled,
        payload: source === "upload" ? uploadedPayload ?? undefined : undefined,
      })) as SeedDryRunResult;
      setDryRun(res);
    } catch (e) {
      toast({ title: "Dry run failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const runCommit = async () => {
    try {
      const res = (await seed.mutateAsync({
        mode: "commit",
        source,
        skipFilled,
        payload: source === "upload" ? uploadedPayload ?? undefined : undefined,
      })) as SeedCommitResult;
      setCommitResult(res);
      toast({
        title: "Seed complete",
        description: `${res.productsUpdated} products · ${res.framesUpserted} frame rows updated`,
      });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["frame-attributes"] });
    } catch (e) {
      toast({ title: "Commit failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const canAnalyze = source === "bundled" || !!uploadedPayload;
  const changesToShow = useMemo(() => dryRun?.changes.filter((c) => !c.skipped) ?? [], [dryRun]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Seed Product Descriptions
          </DialogTitle>
          <DialogDescription>
            Push frame copy and fit data into products + frame attributes. Always preview before commit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Source selector */}
          <div className="space-y-2">
            <Label>Source</Label>
            <RadioGroup value={source} onValueChange={(v) => { setSource(v as SeedSource); setDryRun(null); setCommitResult(null); }} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bundled" id="src-bundled" />
                <Label htmlFor="src-bundled" className="font-normal cursor-pointer">Bundled JSON (in repo)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="upload" id="src-upload" />
                <Label htmlFor="src-upload" className="font-normal cursor-pointer">Upload file (.json / .csv)</Label>
              </div>
            </RadioGroup>
          </div>

          {source === "upload" && (
            <div className="space-y-2">
              <Label htmlFor="seed-file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Choose file
              </Label>
              <input
                id="seed-file"
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              />
              {fileName && <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>}
            </div>
          )}

          {/* Skip-filled toggle */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="skip-filled" className="font-medium">Skip products that already have a value</Label>
              <p className="text-xs text-muted-foreground">Recommended. Turn off to overwrite existing copy.</p>
            </div>
            <Switch id="skip-filled" checked={skipFilled} onCheckedChange={setSkipFilled} />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={runDryRun} disabled={!canAnalyze || seed.isPending} variant="secondary">
              {seed.isPending && !commitResult ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze (dry run)
            </Button>
            <Button onClick={runCommit} disabled={!dryRun || dryRun.wouldChange === 0 || seed.isPending}>
              {seed.isPending && dryRun ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Commit changes
            </Button>
          </div>

          {/* Dry-run summary */}
          {dryRun && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Matched: {dryRun.matched}</Badge>
                <Badge variant="default">Would change: {dryRun.wouldChange}</Badge>
                <Badge variant="outline">Skipped: {dryRun.skipped}</Badge>
                <Badge variant="destructive">Unmatched: {dryRun.unmatchedCount}</Badge>
              </div>
              {dryRun.unmatched.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Unmatched SKUs ({dryRun.unmatched.length})
                  </summary>
                  <p className="mt-1 break-all">{dryRun.unmatched.join(", ")}</p>
                </details>
              )}
              {changesToShow.length > 0 && (
                <ScrollArea className="h-64 rounded border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">Product fields</th>
                        <th className="text-left p-2">Frame fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changesToShow.slice(0, 200).map((c) => (
                        <tr key={c.sku} className="border-t">
                          <td className="p-2 font-mono">{c.sku}</td>
                          <td className="p-2">{Object.keys(c.productChanges).join(", ") || "—"}</td>
                          <td className="p-2">{Object.keys(c.frameChanges).join(", ") || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {changesToShow.length > 200 && (
                    <p className="p-2 text-xs text-muted-foreground">Showing first 200 of {changesToShow.length}…</p>
                  )}
                </ScrollArea>
              )}
            </div>
          )}

          {/* Commit result */}
          {commitResult && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                {commitResult.errors.length === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                Commit finished
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="default">Products updated: {commitResult.productsUpdated}</Badge>
                <Badge variant="secondary">Frame rows: {commitResult.framesUpserted}</Badge>
                {commitResult.errors.length > 0 && (
                  <Badge variant="destructive">Errors: {commitResult.errors.length}</Badge>
                )}
              </div>
              {commitResult.errors.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer">Error details</summary>
                  <ul className="mt-1 list-disc pl-4">
                    {commitResult.errors.slice(0, 50).map((e) => (
                      <li key={e.sku}><span className="font-mono">{e.sku}</span>: {e.error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

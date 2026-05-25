import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Upload, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/hooks/use-toast";
import {
  useSeedDescriptions,
  type SeedDryRunResult,
  type SeedCommitResult,
  type SeedSource,
  type SeedOverride,
} from "../hooks/useSeedDescriptions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditableRow = {
  sku: string;
  product_id: string;
  productPatch: Record<string, any>;
  framePatch: Record<string, any>;
  skip: boolean;
  expanded: boolean;
};

const PRODUCT_TEXT_FIELDS: Array<{ key: string; label: string; multiline?: boolean }> = [
  { key: "tagline", label: "Tagline" },
  { key: "description_html", label: "Description (HTML)", multiline: true },
];

const FRAME_TEXT_FIELDS: Array<{ key: string; label: string }> = [
  { key: "size_label", label: "Size label" },
  { key: "frame_shape", label: "Frame shape" },
  { key: "frame_material", label: "Frame material" },
  { key: "best_for_faces", label: "Best for faces" },
  { key: "best_for_occasions", label: "Best for occasions" },
];

const FRAME_NUMBER_FIELDS: Array<{ key: string; label: string }> = [
  { key: "lens_height", label: "Lens H" },
  { key: "total_width", label: "Total W" },
  { key: "lens_width", label: "Lens W" },
  { key: "bridge_size", label: "Bridge" },
  { key: "temple_length", label: "Temple" },
  { key: "pd_range_min", label: "PD min" },
  { key: "pd_range_max", label: "PD max" },
  { key: "rx_sph_min", label: "Rx min" },
  { key: "rx_sph_max", label: "Rx max" },
];

export const SeedDescriptionsDialog = ({ open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const seed = useSeedDescriptions();

  const [source, setSource] = useState<SeedSource>("bundled");
  const [skipFilled, setSkipFilled] = useState(true);
  const [uploadedPayload, setUploadedPayload] = useState<{ rich?: any; structured?: any } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState<SeedDryRunResult | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [commitResult, setCommitResult] = useState<SeedCommitResult | null>(null);

  // Seed editable rows whenever a new dry-run lands
  useEffect(() => {
    if (!dryRun) {
      setRows([]);
      return;
    }
    const next: EditableRow[] = dryRun.changes
      .filter((c) => !c.skipped)
      .map((c) => {
        const productPatch: Record<string, any> = {};
        for (const [k, v] of Object.entries(c.productChanges)) productPatch[k] = v.to;
        const framePatch: Record<string, any> = {};
        for (const [k, v] of Object.entries(c.frameChanges)) framePatch[k] = v.to;
        return {
          sku: c.sku,
          product_id: c.product_id,
          productPatch,
          framePatch,
          skip: false,
          expanded: false,
        };
      });
    setRows(next);
  }, [dryRun]);

  const reset = () => {
    setDryRun(null);
    setCommitResult(null);
    setUploadedPayload(null);
    setFileName(null);
    setRows([]);
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
      const overrides: SeedOverride[] = rows
        .filter((r) => !r.skip)
        .map((r) => ({
          sku: r.sku,
          productPatch: r.productPatch,
          framePatch: r.framePatch,
        }));
      const res = (await seed.mutateAsync({
        mode: "commit",
        source,
        skipFilled,
        payload: source === "upload" ? uploadedPayload ?? undefined : undefined,
        overrides,
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
  const activeRowCount = useMemo(() => rows.filter((r) => !r.skip).length, [rows]);

  const updateRow = (idx: number, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const updateProductField = (idx: number, key: string, value: any) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, productPatch: { ...r.productPatch, [key]: value } } : r
      )
    );
  };
  const updateFrameField = (idx: number, key: string, value: any) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, framePatch: { ...r.framePatch, [key]: value } } : r
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Seed Product Descriptions
          </DialogTitle>
          <DialogDescription>
            Push frame copy and fit data into products + frame attributes. Edit any value in the preview before committing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Source</Label>
            <RadioGroup
              value={source}
              onValueChange={(v) => { setSource(v as SeedSource); setDryRun(null); setCommitResult(null); }}
              className="flex gap-6"
            >
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

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="skip-filled" className="font-medium">Skip products that already have a value</Label>
              <p className="text-xs text-muted-foreground">Affects the dry-run preview. Overrides committed by you are written as-is.</p>
            </div>
            <Switch id="skip-filled" checked={skipFilled} onCheckedChange={setSkipFilled} />
          </div>

          <div className="flex gap-2">
            <Button onClick={runDryRun} disabled={!canAnalyze || seed.isPending} variant="secondary">
              {seed.isPending && !commitResult ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze (dry run)
            </Button>
            <Button onClick={runCommit} disabled={!dryRun || activeRowCount === 0 || seed.isPending}>
              {seed.isPending && dryRun ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Commit {activeRowCount > 0 ? `${activeRowCount} row(s)` : "changes"}
            </Button>
          </div>

          {dryRun && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Matched: {dryRun.matched}</Badge>
                <Badge variant="default">Editable rows: {rows.length}</Badge>
                <Badge variant="outline">Will commit: {activeRowCount}</Badge>
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
              {rows.length > 0 && (
                <ScrollArea className="h-[420px] rounded border">
                  <div className="divide-y">
                    {rows.map((r, idx) => (
                      <div key={r.sku} className={r.skip ? "p-3 opacity-50" : "p-3"}>
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => updateRow(idx, { expanded: !r.expanded })}
                            className="flex items-center gap-2 text-sm font-medium hover:underline"
                          >
                            {r.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="font-mono">{r.sku}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {Object.keys(r.productPatch).length} product · {Object.keys(r.framePatch).length} frame
                            </span>
                          </button>
                          <label className="flex items-center gap-2 text-xs">
                            <Switch
                              checked={r.skip}
                              onCheckedChange={(v) => updateRow(idx, { skip: v })}
                            />
                            Skip
                          </label>
                        </div>

                        {r.expanded && (
                          <div className="mt-3 grid gap-3">
                            {PRODUCT_TEXT_FIELDS.map((f) => {
                              const val = r.productPatch[f.key];
                              if (val === undefined) return null;
                              return (
                                <div key={f.key} className="space-y-1">
                                  <Label className="text-xs">{f.label}</Label>
                                  {f.multiline ? (
                                    <Textarea
                                      rows={3}
                                      value={String(val ?? "")}
                                      onChange={(e) => updateProductField(idx, f.key, e.target.value)}
                                      className="text-xs font-mono"
                                    />
                                  ) : (
                                    <Input
                                      value={String(val ?? "")}
                                      onChange={(e) => updateProductField(idx, f.key, e.target.value)}
                                      className="h-8 text-xs"
                                    />
                                  )}
                                </div>
                              );
                            })}

                            {FRAME_TEXT_FIELDS.some((f) => r.framePatch[f.key] !== undefined) && (
                              <div className="grid grid-cols-2 gap-3">
                                {FRAME_TEXT_FIELDS.map((f) => {
                                  const val = r.framePatch[f.key];
                                  if (val === undefined) return null;
                                  return (
                                    <div key={f.key} className="space-y-1">
                                      <Label className="text-xs">{f.label}</Label>
                                      <Input
                                        value={String(val ?? "")}
                                        onChange={(e) => updateFrameField(idx, f.key, e.target.value)}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {FRAME_NUMBER_FIELDS.some((f) => r.framePatch[f.key] !== undefined) && (
                              <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                                {FRAME_NUMBER_FIELDS.map((f) => {
                                  const val = r.framePatch[f.key];
                                  if (val === undefined) return null;
                                  return (
                                    <div key={f.key} className="space-y-1">
                                      <Label className="text-xs">{f.label}</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={val ?? ""}
                                        onChange={(e) =>
                                          updateFrameField(
                                            idx,
                                            f.key,
                                            e.target.value === "" ? null : Number(e.target.value)
                                          )
                                        }
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {r.framePatch.progressive_compatible !== undefined && (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!!r.framePatch.progressive_compatible}
                                  onCheckedChange={(v) => updateFrameField(idx, "progressive_compatible", v)}
                                />
                                <Label className="text-xs">Progressive compatible</Label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

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

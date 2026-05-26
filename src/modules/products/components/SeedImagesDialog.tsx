import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Image as ImageIcon, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/hooks/use-toast";
import {
  useSeedImages,
  fileToBase64,
  type SeedImagesDryRunResult,
  type SeedImagesCommitResult,
  type SeedImagesSource,
  type SeedImagesTarget,
  type SeedImageFile,
} from "../hooks/useSeedImages";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SeedImagesDialog = ({ open, onOpenChange }: Props) => {
  const qc = useQueryClient();
  const seed = useSeedImages();

  const [source, setSource] = useState<SeedImagesSource>("bundled");
  const [target, setTarget] = useState<SeedImagesTarget>("both");
  const [skipFilled, setSkipFilled] = useState(true);

  const [uploadedFiles, setUploadedFiles] = useState<SeedImageFile[]>([]);
  const [dryRun, setDryRun] = useState<SeedImagesDryRunResult | null>(null);
  const [commitResult, setCommitResult] = useState<SeedImagesCommitResult | null>(null);
  const [encoding, setEncoding] = useState(false);

  const reset = () => {
    setDryRun(null);
    setCommitResult(null);
    setUploadedFiles([]);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setEncoding(true);
    try {
      const out: SeedImageFile[] = [];
      for (const f of Array.from(files)) {
        if (!/\.(jpe?g|png|webp)$/i.test(f.name)) continue;
        const dataBase64 = await fileToBase64(f);
        out.push({ filename: f.name, contentType: f.type, dataBase64 });
      }
      setUploadedFiles(out);
      toast({ title: "Files loaded", description: `${out.length} image(s) ready` });
    } catch (e) {
      toast({ title: "Failed to read files", description: (e as Error).message, variant: "destructive" });
    } finally {
      setEncoding(false);
    }
  };

  const runDryRun = async () => {
    setCommitResult(null);
    try {
      const res = (await seed.mutateAsync({
        mode: "dry_run",
        source,
        target,
        skipFilled,
        files: source === "upload" ? uploadedFiles : undefined,
      })) as SeedImagesDryRunResult;
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
        target,
        skipFilled,
        files: source === "upload" ? uploadedFiles : undefined,
      })) as SeedImagesCommitResult;
      setCommitResult(res);
      const linkedMsg = res.anchorLink?.linked != null ? ` · ${res.anchorLink.linked} anchor(s) linked` : "";
      toast({
        title: "Image seed complete",
        description: `${res.uploaded} seeded · ${res.anchorUploaded ?? 0} anchor(s)${linkedMsg} · ${res.errors.length} error(s)`,
      });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-image-stats"] });
    } catch (e) {
      toast({ title: "Commit failed", description: (e as Error).message, variant: "destructive" });
    }
  };


  const canAnalyze = source === "bundled" || uploadedFiles.length > 0;
  const planRows = useMemo(() => dryRun?.plan ?? [], [dryRun]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" /> Seed Product Images
          </DialogTitle>
          <DialogDescription>
            Upload bundled MH-SKU photos (or drop a fresh batch) to the product catalog. Always preview before commit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label>Source</Label>
            <RadioGroup
              value={source}
              onValueChange={(v) => { setSource(v as SeedImagesSource); setDryRun(null); setCommitResult(null); }}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bundled" id="img-src-bundled" />
                <Label htmlFor="img-src-bundled" className="font-normal cursor-pointer">Bundled images (67 in repo)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="upload" id="img-src-upload" />
                <Label htmlFor="img-src-upload" className="font-normal cursor-pointer">Upload images (.jpg/.png/.webp)</Label>
              </div>
            </RadioGroup>
          </div>

          {source === "upload" && (
            <div className="space-y-2">
              <Label htmlFor="seed-img-files" className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Choose files (multiple)
              </Label>
              <input
                id="seed-img-files"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => handleFiles(e.target.files)}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
              />
              {encoding && <p className="text-xs text-muted-foreground">Encoding files…</p>}
              {!encoding && uploadedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">{uploadedFiles.length} image(s) staged. Filenames must start with MH-&lt;SKU&gt;.</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="img-skip-filled" className="font-medium">Skip products that already have a primary image</Label>
              <p className="text-xs text-muted-foreground">Recommended. New images for those products are appended to the gallery instead.</p>
            </div>
            <Switch id="img-skip-filled" checked={skipFilled} onCheckedChange={setSkipFilled} />
          </div>

          <div className="flex gap-2">
            <Button onClick={runDryRun} disabled={!canAnalyze || seed.isPending} variant="secondary">
              {seed.isPending && !commitResult ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze (dry run)
            </Button>
            <Button onClick={runCommit} disabled={!dryRun || dryRun.wouldUpload === 0 || seed.isPending}>
              {seed.isPending && dryRun ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Commit upload
            </Button>
          </div>

          {dryRun && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Matched: {dryRun.matched}</Badge>
                <Badge variant="default">Would upload: {dryRun.wouldUpload}</Badge>
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
              {planRows.length > 0 && (
                <ScrollArea className="h-64 rounded border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="text-left p-2">SKU</th>
                        <th className="text-left p-2">File</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-right p-2">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planRows.slice(0, 300).map((p, i) => (
                        <tr key={`${p.sku}-${i}`} className="border-t">
                          <td className="p-2 font-mono">{p.sku}</td>
                          <td className="p-2">{p.filename}</td>
                          <td className="p-2">
                            {p.action === "set_primary" && <Badge variant="default">Set primary</Badge>}
                            {p.action === "append_additional" && <Badge variant="secondary">Append to gallery</Badge>}
                            {p.action === "unmatched" && <Badge variant="destructive">No product</Badge>}
                            {p.action === "skip" && <Badge variant="outline">Skip</Badge>}
                          </td>
                          <td className="p-2 text-right">{p.sizeBytes ? `${Math.round(p.sizeBytes / 1024)} KB` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {planRows.length > 300 && (
                    <p className="p-2 text-xs text-muted-foreground">Showing first 300 of {planRows.length}…</p>
                  )}
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
                Upload finished
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="default">Uploaded: {commitResult.uploaded}</Badge>
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

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Download, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseRow(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

const COL_MAP: Record<string, string> = {
  email: "email", "e-mail": "email", "email address": "email",
  full_name: "full_name", "full name": "full_name", name: "full_name",
  first_name: "first_name", "first name": "first_name",
  last_name: "last_name", "last name": "last_name",
  phone: "phone", "phone number": "phone", phone_number: "phone", mobile: "phone",
  marketing_consent: "marketing_consent", "marketing consent": "marketing_consent", marketing: "marketing_consent",
  newsletter_opt_in: "newsletter_opt_in", "newsletter opt in": "newsletter_opt_in",
  newsletter: "newsletter_opt_in", "opt in": "newsletter_opt_in",
};

function normalise(h: string) {
  return COL_MAP[h.toLowerCase().replace(/_/g, " ").trim()] ?? h.toLowerCase().replace(/\s+/g, "_").trim();
}

function parseBool(v: string | undefined): boolean {
  return ["yes", "true", "1", "y", "on"].includes((v ?? "").toLowerCase().trim());
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

interface ContactRow {
  raw:                Record<string, string>;
  email:              string;
  full_name:          string;
  phone:              string;
  marketing_consent:  boolean;
  newsletter_opt_in:  boolean;
  valid:              boolean;
  error?:             string;
}

function parseCsv(text: string): { headers: string[]; rows: ContactRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const rawHeaders = parseRow(lines[0]);
  const headers    = rawHeaders.map(normalise);

  const rows: ContactRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseRow(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((h, j) => { raw[h] = values[j] ?? ""; });

    // Combine first_name + last_name if full_name absent
    let fullName = raw["full_name"] ?? "";
    if (!fullName && (raw["first_name"] || raw["last_name"])) {
      fullName = `${raw["first_name"] ?? ""} ${raw["last_name"] ?? ""}`.trim();
    }

    const email = (raw["email"] ?? "").toLowerCase().trim();
    const valid = isValidEmail(email);

    rows.push({
      raw,
      email,
      full_name:         fullName,
      phone:             raw["phone"] ?? "",
      marketing_consent: parseBool(raw["marketing_consent"]),
      newsletter_opt_in: parseBool(raw["newsletter_opt_in"]),
      valid,
      error: valid ? undefined : "Invalid email",
    });
  }

  return { headers, rows };
}

// ── Sample CSV download ───────────────────────────────────────────────────────

const SAMPLE_CSV = [
  "email,full_name,phone,marketing_consent,newsletter_opt_in",
  "john.doe@example.com,John Doe,+2348012345678,yes,yes",
  "jane.smith@example.com,Jane Smith,+2348087654321,no,yes",
  "contact@example.com,,,,",
].join("\n");

function downloadSample() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: "text/csv" }));
  a.download = "contacts_import_sample.csv";
  a.click();
}

// ── Import result ─────────────────────────────────────────────────────────────

interface ImportResult {
  imported: number;
  skipped:  number;
  errors:   { row: number; email: string; reason: string }[];
}

// ── Main dialog ───────────────────────────────────────────────────────────────

type Stage = "idle" | "preview" | "importing" | "done";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportDialog({ open, onOpenChange }: Props) {
  const qc  = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);

  const [stage,   setStage]   = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [rows,    setRows]    = useState<ContactRow[]>([]);
  const [result,  setResult]  = useState<ImportResult | null>(null);

  function handleClose() {
    if (stage === "importing") return;
    setStage("idle");
    setRows([]);
    setResult(null);
    if (ref.current) ref.current.value = "";
    onOpenChange(false);
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      toast.error("Please upload a .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows: parsed } = parseCsv(text);
      if (parsed.length === 0) {
        toast.error("No data rows found in the file");
        return;
      }
      if (parsed.length > 1000) {
        toast.error("Maximum 1 000 rows per import. Please split your file.");
        return;
      }
      setRows(parsed);
      setStage("preview");
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function startImport() {
    const valid = rows.filter(r => r.valid);
    if (valid.length === 0) return;

    setStage("importing");

    const payload = valid.map(r => ({
      email:             r.email,
      full_name:         r.full_name || null,
      phone:             r.phone     || null,
      marketing_consent: r.marketing_consent,
      newsletter_opt_in: r.newsletter_opt_in,
    }));

    const { data, error } = await supabase.rpc("crm_bulk_import_contacts", {
      p_rows: payload,
    });

    if (error) {
      toast.error(`Import failed: ${error.message}`);
      setStage("preview");
      return;
    }

    const res = data as ImportResult;
    setResult(res);
    setStage("done");
    qc.invalidateQueries({ queryKey: ["crm_contacts"] });
    qc.invalidateQueries({ queryKey: ["crm_contact_stats"] });
  }

  const validCount   = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid).length;
  const previewRows  = rows.slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        {/* ── IDLE ── */}
        {stage === "idle" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to add contacts in bulk. Existing contacts are updated — no duplicates are created.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => ref.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
              )}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Drop your CSV here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">Max 1 000 rows · .csv format only</p>
              </div>
              <input
                ref={ref}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>

            {/* Format hint */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Expected columns
                </div>
                <Button variant="ghost" size="sm" onClick={downloadSample} className="h-7 gap-1.5 text-xs">
                  <Download className="h-3 w-3" /> Sample CSV
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { col: "email", req: true },
                  { col: "full_name", req: false },
                  { col: "phone", req: false },
                  { col: "marketing_consent", req: false },
                  { col: "newsletter_opt_in", req: false },
                ].map(({ col, req }) => (
                  <code
                    key={col}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs font-mono",
                      req
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {col}{req ? " *" : ""}
                  </code>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                marketing_consent and newsletter_opt_in accept: yes / no / true / false / 1 / 0
              </p>
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {stage === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                <CheckCircle2 className="mr-1 h-3 w-3" /> {validCount} valid
              </Badge>
              {invalidCount > 0 && (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0">
                  <AlertCircle className="mr-1 h-3 w-3" /> {invalidCount} invalid
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{rows.length} rows parsed</span>
            </div>

            <div className="rounded-lg border overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Mkt</TableHead>
                    <TableHead className="text-center">News</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow key={i} className={!r.valid ? "bg-rose-50/50 dark:bg-rose-900/10" : ""}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-xs font-mono">{r.email || <span className="italic text-muted-foreground">empty</span>}</TableCell>
                      <TableCell className="text-xs">{r.full_name || "—"}</TableCell>
                      <TableCell className="text-xs">{r.phone || "—"}</TableCell>
                      <TableCell className="text-center text-xs">{r.marketing_consent ? "✓" : "—"}</TableCell>
                      <TableCell className="text-center text-xs">{r.newsletter_opt_in ? "✓" : "—"}</TableCell>
                      <TableCell>
                        {!r.valid && <AlertCircle className="h-3.5 w-3.5 text-rose-500" title={r.error} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length > 6 && (
                <p className="px-4 py-2 text-xs text-muted-foreground border-t">
                  + {rows.length - 6} more rows not shown
                </p>
              )}
            </div>

            {invalidCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Invalid rows will be skipped. Only valid emails will be imported.
              </p>
            )}
          </div>
        )}

        {/* ── IMPORTING ── */}
        {stage === "importing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Importing {validCount} contacts…</p>
              <p className="mt-1 text-sm text-muted-foreground">This may take a moment</p>
            </div>
            <Progress value={undefined} className="w-full max-w-xs" />
          </div>
        )}

        {/* ── DONE ── */}
        {stage === "done" && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-lg font-semibold">Import complete</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{result.imported}</p>
                <p className="text-xs text-muted-foreground mt-1">Contacts imported</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold">{result.skipped}</p>
                <p className="text-xs text-muted-foreground mt-1">Skipped (invalid)</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 dark:bg-rose-900/10 p-3 space-y-1 max-h-36 overflow-y-auto">
                {result.errors.slice(0, 10).map((e, i) => (
                  <p key={i} className="text-xs text-rose-700 dark:text-rose-300">
                    Row {e.row}: <span className="font-mono">{e.email}</span> — {e.reason}
                  </p>
                ))}
                {result.errors.length > 10 && (
                  <p className="text-xs text-muted-foreground">+ {result.errors.length - 10} more</p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {stage === "idle" && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {stage === "preview" && (
            <>
              <Button variant="outline" onClick={() => { setStage("idle"); setRows([]); if (ref.current) ref.current.value = ""; }}>
                <X className="mr-1.5 h-3.5 w-3.5" /> Choose different file
              </Button>
              <Button onClick={startImport} disabled={validCount === 0}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Import {validCount} contact{validCount !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {stage === "done" && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

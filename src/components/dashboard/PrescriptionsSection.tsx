import { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Plus, Trash2, FileText, Upload, CheckCircle2, AlertTriangle,
  XCircle, ClipboardList, ExternalLink, Stethoscope, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrescriptions, isPrescriptionValid, type Prescription, PrescriptionForm } from "@/modules/prescriptions";

// ── helpers ───────────────────────────────────────────────────────────────────

function rxStatus(rx: Prescription): "valid" | "expiring" | "expired" {
  if (!isPrescriptionValid(rx)) return "expired";
  if (rx.expiry_date) {
    const days = differenceInDays(parseISO(rx.expiry_date), new Date());
    if (days <= 60) return "expiring";
  }
  return "valid";
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  try { return format(parseISO(d), "dd MMM yyyy"); } catch { return d; }
}

function fmtNum(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

function fmtPd(rx: Prescription): string {
  if (rx.pd_distance) return `${rx.pd_distance} mm`;
  if (rx.pd_right && rx.pd_left) return `${rx.pd_right} / ${rx.pd_left} mm`;
  return "—";
}

// ── status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReturnType<typeof rxStatus> }) {
  if (status === "valid")
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        <CheckCircle2 className="h-3 w-3" /> Valid
      </Badge>
    );
  if (status === "expiring")
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        <AlertTriangle className="h-3 w-3" /> Expiring Soon
      </Badge>
    );
  return (
    <Badge className="gap-1 bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
      <XCircle className="h-3 w-3" /> Expired
    </Badge>
  );
}

// ── source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: Prescription["source"] }) {
  const map: Record<Prescription["source"], { icon: React.ReactNode; label: string }> = {
    manual:       { icon: <FileText className="h-3 w-3" />,      label: "Manual" },
    uploaded:     { icon: <Upload className="h-3 w-3" />,        label: "Uploaded" },
    clinic_issued: { icon: <Stethoscope className="h-3 w-3" />, label: "Clinic" },
  };
  const { icon, label } = map[source] ?? map.manual;
  return (
    <Badge variant="outline" className="gap-1 text-xs font-normal">
      {icon} {label}
    </Badge>
  );
}

// ── eye row ───────────────────────────────────────────────────────────────────

function EyeRow({
  label, sph, cyl, axis,
}: { label: string; sph: number | null; cyl: number | null; axis: number | null }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 font-semibold text-muted-foreground text-xs uppercase">{label}</span>
      <div className="flex gap-4">
        <span><span className="text-xs text-muted-foreground mr-1">Sph</span>{fmtNum(sph)}</span>
        <span><span className="text-xs text-muted-foreground mr-1">Cyl</span>{fmtNum(cyl)}</span>
        <span><span className="text-xs text-muted-foreground mr-1">Axis</span>{axis ?? "—"}°</span>
      </div>
    </div>
  );
}

// ── prescription card ─────────────────────────────────────────────────────────

function PrescriptionCard({
  rx, onDelete, isDeleting,
}: {
  rx: Prescription;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const status = rxStatus(rx);
  const hasEyeData = rx.right_eye || rx.left_eye;

  return (
    <Card className={`transition-all ${status === "expired" ? "opacity-70" : ""}`}>
      <CardContent className="p-4 space-y-3">
        {/* Top row: status + source + delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <SourceBadge source={rx.source} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this prescription?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the prescription from your profile. You can always add it again later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => onDelete(rx.id)}
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Eye values */}
        {hasEyeData && (
          <div className="rounded-md bg-muted/40 border px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Lens Values
              </span>
            </div>
            {rx.right_eye && (
              <EyeRow
                label="OD"
                sph={rx.right_eye.sph}
                cyl={rx.right_eye.cyl}
                axis={rx.right_eye.axis}
              />
            )}
            {rx.left_eye && (
              <EyeRow
                label="OS"
                sph={rx.left_eye.sph}
                cyl={rx.left_eye.cyl}
                axis={rx.left_eye.axis}
              />
            )}
            <div className="flex items-center gap-3 text-sm pt-0.5">
              <span className="w-8 font-semibold text-muted-foreground text-xs uppercase">PD</span>
              <span>{fmtPd(rx)}</span>
            </div>
          </div>
        )}

        {/* Uploaded document */}
        {rx.source === "uploaded" && rx.document_url && (
          <a
            href={rx.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            View uploaded prescription
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground/80">Issued:</span>{" "}
            {fmtDate(rx.issued_date)}
          </div>
          <div>
            <span className="font-medium text-foreground/80">Expires:</span>{" "}
            {rx.expiry_date ? fmtDate(rx.expiry_date) : "—"}
          </div>
          {rx.prescriber_name && (
            <div className="col-span-2">
              <span className="font-medium text-foreground/80">Prescriber:</span>{" "}
              {rx.prescriber_name}
              {rx.clinic_name ? ` · ${rx.clinic_name}` : ""}
            </div>
          )}
          {rx.notes && (
            <div className="col-span-2 italic">{rx.notes}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── main section ──────────────────────────────────────────────────────────────

export function PrescriptionsSection() {
  const { prescriptions, isLoading, createRx, deleteRx } = usePrescriptions();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = (rx: Parameters<typeof createRx.mutate>[0]) => {
    createRx.mutate(rx, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // ── empty state ────────────────────────────────────────────────────────────
  const isEmpty = prescriptions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">My Prescriptions</h2>
          {!isEmpty && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} saved
              {" · "}
              {prescriptions.filter(isPrescriptionValid).length} valid
            </p>
          )}
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="shrink-0"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Prescription
        </Button>
      </div>

      {/* Info banner */}
      {!isEmpty && (
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
          <Stethoscope className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your prescriptions are securely stored and used only when you purchase prescription lenses.
            A valid prescription is required at checkout for Rx frames.
          </p>
        </div>
      )}

      {/* Prescription cards */}
      {!isEmpty ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              rx={rx}
              onDelete={(id) => deleteRx.mutate(id)}
              isDeleting={deleteRx.isPending && (deleteRx.variables as string) === rx.id}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-5 mb-4">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No prescriptions yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Add your eye prescription so we can recommend the right lenses and make checkout faster.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your Prescription
          </Button>
        </div>
      )}

      {/* Add Prescription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add Prescription</DialogTitle>
          </DialogHeader>
          <PrescriptionForm
            onSave={handleSave}
            isSaving={createRx.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

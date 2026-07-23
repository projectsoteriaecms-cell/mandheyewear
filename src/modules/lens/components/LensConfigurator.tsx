import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, ArrowRight, ShoppingCart, CalendarCheck, Info,
  CheckCircle2, AlertTriangle, Lock, Eye, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  TIER_ORDER, TYPES_IN_TIER, LENS_TIER_LABELS, LENS_TIER_DESCRIPTIONS,
  LENS_TYPE_LABELS, LENS_TYPE_DESCRIPTIONS,
  COATING_LABELS, COATING_DESCRIPTIONS, RECOMMENDED_COATINGS,
  LENS_INDEX_LABELS, NEEDS_PRESCRIPTION, REQUIRES_FITTING,
  calculateLensPrice,
  type LensType, type LensCoating, type LensIndex, type LensTier,
} from "../constants";
import { evaluateLensGate, type PrescriptionStatus } from "../lib/lensGate";
import {
  usePrescriptions,
  isPrescriptionValid,
  PrescriptionForm,
  type PrescriptionInsert,
} from "@/modules/prescriptions";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface LensConfig {
  lensType:        LensType;
  lensIndex:       LensIndex | null;
  lensCoatings:    LensCoating[];
  prescriptionId:  string | null;
  prescriptionData: any | null;
  requiresFitting: boolean;
  fittingBooked:   boolean;
  lensPrice:       number;
  frameOnly:       boolean;
}

interface Props {
  open:            boolean;
  onOpenChange:    (open: boolean) => void;
  productName:     string;
  productId:       string;
  onConfirm:       (config: LensConfig) => void;
  isAdding?:       boolean;
}

type Step = "tier" | "type" | "prescription" | "coatings" | "summary";

// ── Component ─────────────────────────────────────────────────────────────────
export function LensConfigurator({ open, onOpenChange, productName, onConfirm, isAdding }: Props) {
  const navigate = useNavigate();
  const { prescriptions, latestValid, createRx } = usePrescriptions();

  // A real navigation stack, not a fixed linear index into `steps`. Frame Only
  // jumps straight from "tier" to "summary" -- with a plain step index, "Back"
  // from there would land on steps[stepIndex - 1] ("coatings"), a screen for
  // configuring a lens that this order doesn't have. The stack always knows
  // the actual path taken, so Back is correct regardless of what was skipped.
  const [history, setHistory] = useState<Step[]>(["tier"]);
  const step = history[history.length - 1];
  const goToStep = (next: Step) => setHistory((h) => [...h, next]);
  const goBack = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));

  const [selectedTier, setSelectedTier] = useState<LensTier | null>(null);
  const [selectedType, setSelectedType] = useState<LensType | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<LensIndex>("1.56");
  const [selectedCoatings, setSelectedCoatings] = useState<LensCoating[]>(["ar", "uv400"]);
  const [selectedRxId, setSelectedRxId] = useState<string | null>(latestValid?.id ?? null);
  const [showRxForm, setShowRxForm] = useState(false);
  const [fittingAcknowledged, setFittingAcknowledged] = useState(false);

  const rxStatus: PrescriptionStatus = useMemo(() => {
    if (prescriptions.length === 0) return "none";
    const hasValid = prescriptions.some(isPrescriptionValid);
    return hasValid ? "valid" : "expired";
  }, [prescriptions]);

  const gate = useMemo(() => {
    if (!selectedType) return null;
    return evaluateLensGate(selectedType, rxStatus);
  }, [selectedType, rxStatus]);

  const selectedRx = prescriptions.find((r) => r.id === selectedRxId) ?? null;
  const lensPrice = selectedType ? calculateLensPrice(selectedType, selectedCoatings) : 0;

  // ── Navigation helpers ────────────────────────────────────────────────────
  const reset = () => {
    setHistory(["tier"]);
    setSelectedTier(null);
    setSelectedType(null);
    setSelectedCoatings(["ar", "uv400"]);
    setSelectedRxId(latestValid?.id ?? null);
    setShowRxForm(false);
    setFittingAcknowledged(false);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const handleTierNext = () => {
    if (!selectedTier) return;
    if (selectedTier === "none") {
      setSelectedType("frame_only");
      goToStep("summary");
    } else {
      goToStep("type");
    }
  };

  const handleTypeNext = () => {
    if (!selectedType) return;
    if (gate?.action === "require_booking") {
      goToStep("prescription"); // shows the fitting gate screen
      return;
    }
    if (NEEDS_PRESCRIPTION[selectedType]) {
      goToStep("prescription");
    } else {
      goToStep("coatings");
    }
  };

  const handlePrescriptionNext = () => {
    if (gate?.action === "require_booking" && !fittingAcknowledged) return;
    goToStep("coatings");
  };

  const handleBookTest = (service: string) => {
    handleClose();
    navigate(`/booking?service=${service}&returnTo=/shop`);
  };

  const handleConfirm = () => {
    if (!selectedType) return;
    onConfirm({
      lensType: selectedType,
      lensIndex: NEEDS_PRESCRIPTION[selectedType] ? selectedIndex : null,
      // frame_only never visits the coatings step (jumps straight from tier
      // to summary), so selectedCoatings still holds its default value here --
      // a coating cannot apply to an order with no lens, so the persisted
      // record must not carry it regardless of what's sitting in that state.
      lensCoatings: selectedType === "frame_only" ? [] : selectedCoatings,
      prescriptionId: selectedRxId,
      prescriptionData: selectedRx
        ? { right_eye: selectedRx.right_eye, left_eye: selectedRx.left_eye, pd_distance: selectedRx.pd_distance }
        : null,
      requiresFitting: REQUIRES_FITTING[selectedType],
      fittingBooked: fittingAcknowledged,
      lensPrice,
      frameOnly: selectedType === "frame_only",
    });
  };

  // ── Step renderers ─────────────────────────────────────────────────────────
  const renderTier = () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select the type of lenses you need for <span className="font-medium text-foreground">{productName}</span>.
      </p>
      <RadioGroup value={selectedTier ?? ""} onValueChange={(v) => setSelectedTier(v as LensTier)}>
        {TIER_ORDER.map((tier) => (
          <label
            key={tier}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
              ${selectedTier === tier ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
          >
            <RadioGroupItem value={tier} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{LENS_TIER_LABELS[tier]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{LENS_TIER_DESCRIPTIONS[tier]}</p>
              {tier === "multifocal" && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  <Lock className="h-3 w-3 mr-1" /> Requires in-clinic fitting
                </Badge>
              )}
              {tier === "specialty" && (
                <Badge variant="outline" className="mt-1 text-xs">
                  <Eye className="h-3 w-3 mr-1" /> Optometrist review required
                </Badge>
              )}
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );

  const renderType = () => {
    if (!selectedTier) return null;
    const types = TYPES_IN_TIER[selectedTier];
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Choose the specific lens type.</p>
        <RadioGroup value={selectedType ?? ""} onValueChange={(v) => setSelectedType(v as LensType)}>
          {types.map((t) => (
            <label
              key={t}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${selectedType === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <RadioGroupItem value={t} className="mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{LENS_TYPE_LABELS[t]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{LENS_TYPE_DESCRIPTIONS[t]}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    );
  };

  const renderPrescription = () => {
    // Hard gate: fitting required
    if (gate?.action === "require_booking") {
      return (
        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              {gate.reason}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button variant="default" className="w-full" onClick={() => handleBookTest("lens_fitting_consultation")}>
              <CalendarCheck className="h-4 w-4 mr-2" />
              Book Fitting Consultation
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleBookTest("comprehensive_eye_exam")}>
              Book Comprehensive Eye Exam
            </Button>
          </div>

          <Separator />
          <p className="text-xs text-muted-foreground">
            Or, reserve the frame now — we'll note that it requires fitting and our team will contact you.
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={fittingAcknowledged}
              onCheckedChange={(v) => setFittingAcknowledged(!!v)}
              className="mt-0.5"
            />
            <span className="text-xs">
              I understand these lenses require in-clinic fitting. Reserve my frame and I'll book an appointment to complete my order.
            </span>
          </label>
        </div>
      );
    }

    // Soft gate / recommend test
    if (gate?.action === "recommend_test" && rxStatus !== "valid") {
      return (
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">{gate.reason}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col" onClick={() => handleBookTest("basic_eye_test")}>
              <Eye className="h-5 w-5 mb-1" />
              <span className="font-medium text-sm">FREE</span>
              <span className="text-xs text-muted-foreground">Basic Eye Test</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-3 flex-col" onClick={() => handleBookTest("comprehensive_eye_exam")}>
              <CheckCircle2 className="h-5 w-5 mb-1" />
              <span className="font-medium text-sm">₦10k–₦25k</span>
              <span className="text-xs text-muted-foreground">Comprehensive Exam</span>
            </Button>
          </div>

          <Separator />
          <p className="text-sm font-medium">Or enter / upload your existing prescription:</p>
          {renderRxSelector()}
        </div>
      );
    }

    // Normal prescription entry
    return (
      <div className="space-y-4">
        {renderRxSelector()}
      </div>
    );
  };

  const renderRxSelector = () => (
    <div className="space-y-3">
      {prescriptions.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Saved prescriptions</p>
          <RadioGroup value={selectedRxId ?? "__new__"} onValueChange={(v) => {
            if (v === "__new__") { setSelectedRxId(null); setShowRxForm(true); }
            else { setSelectedRxId(v); setShowRxForm(false); }
          }}>
            {prescriptions.map((rx) => {
              const valid = isPrescriptionValid(rx);
              return (
                <label
                  key={rx.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedRxId === rx.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <RadioGroupItem value={rx.id} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {rx.prescriber_name ?? "Prescription"}{" "}
                      {rx.issued_date ? `(${rx.issued_date})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{rx.source}</p>
                  </div>
                  <Badge variant={valid ? "default" : "destructive"} className="text-xs">
                    {valid ? "Valid" : "Expired"}
                  </Badge>
                </label>
              );
            })}
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-primary/40 transition-colors">
              <RadioGroupItem value="__new__" />
              <span className="text-sm">Add new prescription</span>
            </label>
          </RadioGroup>
        </div>
      )}

      {(prescriptions.length === 0 || showRxForm) && (
        <PrescriptionForm
          isSaving={createRx.isPending}
          onSave={async (rx: PrescriptionInsert) => {
            const saved = await createRx.mutateAsync(rx);
            setSelectedRxId(saved.id);
            setShowRxForm(false);
          }}
        />
      )}

      {/* Index selection for prescription lenses */}
      {selectedType && NEEDS_PRESCRIPTION[selectedType] && selectedRxId && !showRxForm && (
        <div>
          <p className="text-sm font-medium mb-2">Lens index (thickness)</p>
          <RadioGroup value={selectedIndex} onValueChange={(v) => setSelectedIndex(v as LensIndex)}>
            {(["1.50", "1.56", "1.61", "1.67", "1.74"] as LensIndex[]).map((idx) => (
              <label key={idx} className="flex items-center gap-2 py-1 cursor-pointer">
                <RadioGroupItem value={idx} />
                <span className="text-sm">{LENS_INDEX_LABELS[idx]}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );

  const renderCoatings = () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Coatings enhance lens performance. Add or remove as needed.
      </p>
      {(Object.keys(COATING_LABELS) as LensCoating[]).map((c) => {
        const checked = selectedCoatings.includes(c);
        const recommended = RECOMMENDED_COATINGS.includes(c);
        return (
          <label key={c} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) =>
                setSelectedCoatings((prev) =>
                  v ? [...prev, c] : prev.filter((x) => x !== c)
                )
              }
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{COATING_LABELS[c]}</p>
                {recommended && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{COATING_DESCRIPTIONS[c]}</p>
            </div>
          </label>
        );
      })}
    </div>
  );

  const renderSummary = () => {
    if (!selectedType) return null;
    const isFrameOnly = selectedType === "frame_only";
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lens type</span>
            <span className="font-medium">{LENS_TYPE_LABELS[selectedType]}</span>
          </div>
          {!isFrameOnly && selectedCoatings.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coatings</span>
              <span className="font-medium text-right">{selectedCoatings.map((c) => COATING_LABELS[c]).join(", ")}</span>
            </div>
          )}
          {selectedRx && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prescription</span>
              <span className="font-medium">Saved ({selectedRx.issued_date ?? "no date"})</span>
            </div>
          )}
          {REQUIRES_FITTING[selectedType] && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fitting</span>
              <Badge variant={fittingAcknowledged ? "outline" : "destructive"} className="text-xs">
                {fittingAcknowledged ? "To be booked" : "Required — not booked"}
              </Badge>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-sm font-semibold">
            <span>Lens cost</span>
            <span>{lensPrice > 0 ? `₦${lensPrice.toLocaleString()}` : "Included"}</span>
          </div>
        </div>

        {REQUIRES_FITTING[selectedType] && !fittingAcknowledged && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs">
              Go back and acknowledge the fitting requirement, or book a consultation now.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // ── Step config ────────────────────────────────────────────────────────────
  const steps: Step[] = ["tier", "type", "prescription", "coatings", "summary"];
  const stepIndex = steps.indexOf(step);

  const stepTitles: Record<Step, string> = {
    tier:         "Choose Lens Category",
    type:         "Choose Lens Type",
    prescription: "Prescription",
    coatings:     "Lens Coatings",
    summary:      "Confirm Lens Selection",
  };

  const canProceedType = !!selectedType;
  const canProceedRx = gate?.action === "require_booking"
    ? fittingAcknowledged
    : !!(selectedRxId || !NEEDS_PRESCRIPTION[selectedType ?? "frame_only"]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          <DialogDescription className="text-xs">
            Step {stepIndex + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-1 mb-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors
                ${i <= stepIndex ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          {step === "tier"         && renderTier()}
          {step === "type"         && renderType()}
          {step === "prescription" && renderPrescription()}
          {step === "coatings"     && renderCoatings()}
          {step === "summary"      && renderSummary()}
        </div>

        {/* Footer navigation */}
        <div className="flex justify-between pt-3 border-t mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === "tier") handleClose();
              else goBack();
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {step === "tier" ? "Cancel" : "Back"}
          </Button>

          {step === "summary" ? (
            <Button
              onClick={handleConfirm}
              disabled={isAdding || (REQUIRES_FITTING[selectedType ?? "frame_only"] && !fittingAcknowledged)}
            >
              {isAdding
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding…</>
                : <><ShoppingCart className="h-4 w-4 mr-2" />Add to Cart</>
              }
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                if (step === "tier")         handleTierNext();
                else if (step === "type")    handleTypeNext();
                else if (step === "prescription") handlePrescriptionNext();
                else if (step === "coatings") goToStep("summary");
              }}
              disabled={
                (step === "tier" && !selectedTier) ||
                (step === "type" && !canProceedType) ||
                (step === "prescription" && !canProceedRx && gate?.action !== "recommend_test")
              }
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


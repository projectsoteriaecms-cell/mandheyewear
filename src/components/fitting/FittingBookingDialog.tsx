import { useState } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useBranches } from "@/modules/branches/hooks/useBranches";
import { useCreateAppointment } from "@/modules/appointments/hooks/useAppointments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  CalendarDays,
  MapPin,
  Clock,
  Wrench,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── constants ─────────────────────────────────────────────────────────────────

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function fmtTime(t: string) {
  const [h] = t.split(":").map(Number);
  return `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
}

// ── props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The order that needs a fitting. Used to mark fitting_booked on order_items. */
  orderId: string;
  orderNumber: string;
}

// ── component ─────────────────────────────────────────────────────────────────

export function FittingBookingDialog({ open, onOpenChange, orderId, orderNumber }: Props) {
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const createAppointment = useCreateAppointment();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const selectedBranch = branches.find((b) => b.id === branchId);
  const canProceed = !!branchId && !!date && !!time;

  const handleClose = (next: boolean) => {
    if (!next) {
      // reset on close (but keep "done" state visible briefly)
      setTimeout(() => {
        setStep("select");
        setBranchId("");
        setDate(undefined);
        setTime("");
        setNotes("");
      }, 300);
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!date || !branchId || !time) return;

    const fullNotes = [
      `Lens fitting for Order #${orderNumber}`,
      notes.trim() || null,
    ]
      .filter(Boolean)
      .join(" — ");

    await createAppointment.mutateAsync({
      branch_id: branchId,
      service_type: "lens_fitting_consultation",
      scheduled_date: format(date, "yyyy-MM-dd"),
      scheduled_time: time,
      duration_minutes: 30,
      notes: fullNotes,
    });

    // Mark fitting_booked on all requires_fitting items for this order
    await supabase
      .from("order_items")
      .update({ fitting_booked: true })
      .eq("order_id", orderId)
      .eq("requires_fitting", true);

    // Refresh order queries so admin Rx badge clears
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });

    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Book Lens Fitting
          </DialogTitle>
          <DialogDescription>
            Order <span className="font-semibold text-foreground">{orderNumber}</span> — 30 min appointment
          </DialogDescription>
        </DialogHeader>

        {/* ── Done state ── */}
        {step === "done" && (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Fitting Booked!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {format(date!, "PPP")} at {fmtTime(time)}
                <br />
                {selectedBranch?.name}
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Bring your glasses frame and order confirmation. Our optician will fit your
              lenses and ensure everything is perfect.
            </p>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}

        {/* ── Selection step ── */}
        {step === "select" && (
          <div className="space-y-5 py-2">
            {/* Branch */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Branch
              </Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder={branchesLoading ? "Loading…" : "Select a branch"} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}{b.city ? ` — ${b.city}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                Date
              </Label>
              <div className="rounded-lg border overflow-hidden">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) =>
                    isBefore(d, startOfToday()) ||
                    d.getDay() === 0 // no Sundays
                  }
                  fromDate={addDays(new Date(), 1)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time slots */}
            {date && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Time
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                        time === slot
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted border-border"
                      )}
                    >
                      {fmtTime(slot)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Additional notes (optional)
              </Label>
              <Textarea
                rows={2}
                placeholder="Any specific concerns or requests for your fitting…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm resize-none"
              />
            </div>

            <Button
              className="w-full"
              disabled={!canProceed}
              onClick={() => setStep("confirm")}
            >
              Review Booking
            </Button>
          </div>
        )}

        {/* ── Confirm step ── */}
        {step === "confirm" && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Wrench className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Lens Fitting Consultation</p>
                  <p className="text-muted-foreground text-xs">30 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>{selectedBranch?.name}{selectedBranch?.city ? `, ${selectedBranch.city}` : ""}</p>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>{format(date!, "EEEE, d MMMM yyyy")}</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>{fmtTime(time)}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Please bring your purchase confirmation and any frames you'd like fitted.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("select")}
                disabled={createAppointment.isPending}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking…</>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

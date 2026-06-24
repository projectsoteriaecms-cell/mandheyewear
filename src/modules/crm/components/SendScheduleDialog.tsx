import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export interface SendScheduleOptions {
  sendNow: boolean;
  scheduledAt?: string;
}

interface SendScheduleDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: SendScheduleOptions) => void;
  isPending?: boolean;
}

export function SendScheduleDialog({
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: SendScheduleDialogProps) {
  const [mode, setMode] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSubmit = () => {
    if (mode === "now") {
      onSubmit({ sendNow: true });
    } else {
      if (!scheduledDate || !scheduledTime) {
        alert("Please select both date and time");
        return;
      }
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      onSubmit({ sendNow: false, scheduledAt });
    }
    resetForm();
  };

  const resetForm = () => {
    setMode("now");
    setScheduledDate("");
    setScheduledTime("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];
  // Get minimum time (current time, rounded to next 15 min)
  const now = new Date();
  const minTime = new Date(now.getTime() + 15 * 60000);
  const minTimeStr = minTime.toTimeString().slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "now" | "scheduled")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="send-now" />
              <Label htmlFor="send-now" className="font-medium cursor-pointer">
                Send immediately
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scheduled" id="send-scheduled" />
              <Label htmlFor="send-scheduled" className="font-medium cursor-pointer">
                Schedule for later
              </Label>
            </div>
          </RadioGroup>

          {mode === "scheduled" && (
            <div className="space-y-3 p-3 bg-muted rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={today}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={scheduledDate === today ? minTimeStr : undefined}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "now" ? "Send now" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

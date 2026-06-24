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
import { Loader2 } from "lucide-react";
import { SendScheduleDialog, type SendScheduleOptions } from "./SendScheduleDialog";

interface TestEmailDialogProps {
  campaignId: string;
  campaignName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testEmail: string, options: SendScheduleOptions) => void;
  isPending?: boolean;
}

export function TestEmailDialog({
  campaignId,
  campaignName,
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: TestEmailDialogProps) {
  const [testEmail, setTestEmail] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const handleTestEmailSubmit = () => {
    if (!testEmail.trim()) {
      alert("Please enter a test email address");
      return;
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    setShowSchedule(true);
  };

  const handleScheduleSubmit = (options: SendScheduleOptions) => {
    onSubmit(testEmail, options);
    setTestEmail("");
    setShowSchedule(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTestEmail("");
      setShowSchedule(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showSchedule} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Test "{campaignName}" before sending to your segment
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test email address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestEmailSubmit}
              disabled={isPending || !testEmail.trim()}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SendScheduleDialog
        title="When to send test?"
        description="Send the test email now or schedule it for later"
        isOpen={showSchedule}
        onClose={() => {
          setShowSchedule(false);
          setTestEmail("");
        }}
        onSubmit={handleScheduleSubmit}
        isPending={isPending}
      />
    </>
  );
}

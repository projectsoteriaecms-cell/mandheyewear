import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmailVerification } from "@/modules/auth";
import {
  ShieldCheck,
  MailWarning,
  Loader2,
  RefreshCw,
  PencilLine,
} from "lucide-react";

const formatCooldown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface EmailVerificationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailVerificationStatusDialog = ({
  open,
  onOpenChange,
}: EmailVerificationStatusDialogProps) => {
  const {
    isVerified,
    email,
    verifiedAt,
    resend,
    updateEmail,
    isResending,
    cooldownSeconds,
  } = useEmailVerification();

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-close when state becomes verified after dialog was opened
  useEffect(() => {
    if (open && isVerified) {
      const t = setTimeout(() => onOpenChange(false), 1200);
      return () => clearTimeout(t);
    }
  }, [open, isVerified, onOpenChange]);

  // Reset inline form when dialog closes
  useEffect(() => {
    if (!open) {
      setShowEmailEdit(false);
      setNewEmail("");
    }
  }, [open]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const { error } = await updateEmail(newEmail);
    setIsUpdating(false);
    if (!error) {
      setShowEmailEdit(false);
      setNewEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isVerified ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center">Email verified</DialogTitle>
              <DialogDescription className="text-center">
                Your email{" "}
                <span className="font-medium text-foreground">{email}</span>{" "}
                {verifiedAt
                  ? `was verified on ${new Date(verifiedAt).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}.`
                  : "is verified."}{" "}
                You're all set.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="hero"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <MailWarning className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center">
                Verify your email
              </DialogTitle>
              <DialogDescription className="text-center">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">
                  {email ?? "your inbox"}
                </span>
                . Check your inbox (and spam folder).
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="mb-2 font-medium text-foreground">Steps to verify</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Open the email from us</li>
                <li>Click the confirmation link</li>
                <li>Return here — status updates automatically</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="hero"
                onClick={() => resend()}
                disabled={isResending || cooldownSeconds > 0 || !email}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend in {formatCooldown(cooldownSeconds)}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend confirmation email
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowEmailEdit((v) => !v)}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                I used a different email
              </Button>
            </div>

            {showEmailEdit && (
              <div className="space-y-3 rounded-md border bg-card p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dialog-new-email" className="text-xs">
                    New email address
                  </Label>
                  <Input
                    id="dialog-new-email"
                    type="email"
                    placeholder="you@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send a confirmation link to the new address.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="hero"
                    onClick={handleUpdate}
                    disabled={isUpdating || !newEmail}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Send confirmation"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowEmailEdit(false);
                      setNewEmail("");
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Still nothing after 5 minutes? Try updating your email or contact
              support.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

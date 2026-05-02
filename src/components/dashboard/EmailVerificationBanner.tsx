import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MailWarning, Loader2, RefreshCw, PencilLine, Info } from "lucide-react";
import { useEmailVerification } from "@/modules/auth/hooks/useEmailVerification";
import { EmailVerificationStatusDialog } from "./EmailVerificationStatusDialog";

const formatCooldown = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const EmailVerificationBanner = () => {
  const {
    isVerified,
    email,
    resend,
    updateEmail,
    isResending,
    cooldownSeconds,
  } = useEmailVerification();

  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  if (isVerified || !email) return null;

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
    <>
    <Card className="mb-6 border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20">
      <CardContent className="py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <MailWarning className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">
                Verify your email to secure your account
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Check your inbox (and spam folder). Didn't get it?
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="hero"
                size="sm"
                onClick={() => resend()}
                disabled={isResending || cooldownSeconds > 0}
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
                size="sm"
                onClick={() => setStatusDialogOpen(true)}
              >
                <Info className="mr-2 h-4 w-4" />
                View details
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailEdit((v) => !v)}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                I used a different email
              </Button>
            </div>

            {showEmailEdit && (
              <div className="rounded-md border bg-card p-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-email" className="text-xs">
                    New email address
                  </Label>
                  <Input
                    id="new-email"
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
          </div>
        </div>
      </CardContent>
    </Card>
    <EmailVerificationStatusDialog
      open={statusDialogOpen}
      onOpenChange={setStatusDialogOpen}
    />
    </>
  );
};

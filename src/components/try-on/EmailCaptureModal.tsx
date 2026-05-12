import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, Download } from "lucide-react";
import type { TryOnResult } from "@/modules/personalization/hooks/useVirtualTryOn";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, marketingConsent: boolean) => Promise<{ success: boolean }>;
  onSkip: () => void;
  result: TryOnResult | null;
  isSubmitting: boolean;
}

export const EmailCaptureModal = ({
  isOpen,
  onClose,
  onSubmit,
  onSkip,
  result,
  isSubmitting,
}: EmailCaptureModalProps) => {
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [consentError, setConsentError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!dataConsent) {
      setConsentError("Please consent to data processing to receive your try-on by email.");
      return;
    }
    setConsentError("");

    const { success } = await onSubmit(email, marketingConsent);
    if (success) {
      setEmail("");
      setMarketingConsent(false);
      setDataConsent(false);
    }
  };

  const handleSkip = () => {
    setEmail("");
    setMarketingConsent(false);
    setEmailError("");
    onSkip();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Get Your Try-On via Email
          </DialogTitle>
          <DialogDescription>
            We'll send you a high-quality version with frame details and a direct purchase link.
          </DialogDescription>
        </DialogHeader>

        {/* Preview of the try-on result */}
        {result?.compositeImage && (
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden mb-4">
            <img
              src={result.compositeImage}
              alt="Your try-on result"
              className="w-full h-full object-cover"
            />
            {result.frameDetails && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium">{result.frameDetails.name}</p>
                {result.frameDetails.price && (
                  <p className="text-white/80 text-xs">
                    ₦{result.frameDetails.price.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              disabled={isSubmitting}
              className={emailError ? "border-destructive" : ""}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="marketing" className="text-sm text-muted-foreground font-normal cursor-pointer">
              Send me style tips, exclusive offers, and new arrivals
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send to My Email
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full text-muted-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Skip & download directly
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

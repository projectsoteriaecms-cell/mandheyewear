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
import { Mail, Phone, Loader2 } from "lucide-react";
import type { TryOnResult } from "@/modules/personalization/hooks/useVirtualTryOn";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";

type ContactTab = "email" | "phone";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** email and phone are mutually exclusive — exactly one will be non-null. */
  onSubmit: (
    email: string | null,
    phone: string | null,
    marketingConsent: boolean
  ) => Promise<{ success: boolean }>;
  result: TryOnResult | null;
  isSubmitting: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts Nigerian (+234) or international format with optional leading +
const PHONE_RE = /^\+?[0-9]{10,15}$/;

export const EmailCaptureModal = ({
  isOpen,
  onClose,
  onSubmit,
  result,
  isSubmitting,
}: EmailCaptureModalProps) => {
  const [tab, setTab] = useState<ContactTab>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [consentError, setConsentError] = useState("");

  const validate = () => {
    setFieldError("");
    if (tab === "email") {
      if (!email.trim()) { setFieldError("Please enter your email address."); return false; }
      if (!EMAIL_RE.test(email)) { setFieldError("Please enter a valid email address."); return false; }
    } else {
      if (!phone.trim()) { setFieldError("Please enter your WhatsApp number."); return false; }
      if (!PHONE_RE.test(phone.trim())) { setFieldError("Enter a valid phone number (10–15 digits, e.g. +234…)."); return false; }
    }
    if (!dataConsent) {
      setConsentError("Please tick the consent box to continue.");
      return false;
    }
    setConsentError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { success } = await onSubmit(
      tab === "email" ? email.trim() : null,
      tab === "phone" ? phone.trim() : null,
      marketingConsent
    );

    if (success) {
      setEmail("");
      setPhone("");
      setMarketingConsent(false);
      setDataConsent(false);
    }
  };

  const switchTab = (t: ContactTab) => {
    setTab(t);
    setFieldError("");
    setConsentError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tab === "email"
              ? <><Mail className="h-5 w-5 text-primary" /> Get Your Try-On via Email</>
              : <><Phone className="h-5 w-5 text-primary" /> Get Your Try-On via WhatsApp</>
            }
          </DialogTitle>
          <DialogDescription>
            Save your look and receive frame details and a direct purchase link.
          </DialogDescription>
        </DialogHeader>

        {/* Result preview */}
        {result?.compositeImage && (
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
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

        {/* Channel toggle */}
        <div className="flex rounded-lg border border-border p-0.5 gap-0.5 bg-muted/40">
          <button
            type="button"
            onClick={() => switchTab("email")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors ${
              tab === "email"
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => switchTab("phone")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors ${
              tab === "phone"
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="h-3.5 w-3.5" />
            WhatsApp
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="vto-email">Email address</Label>
              <Input
                id="vto-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(""); }}
                disabled={isSubmitting}
                className={fieldError ? "border-destructive" : ""}
                autoComplete="email"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="vto-phone">WhatsApp number</Label>
              <Input
                id="vto-phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFieldError(""); }}
                disabled={isSubmitting}
                className={fieldError ? "border-destructive" : ""}
                autoComplete="tel"
              />
            </div>
          )}

          {fieldError && (
            <p className="text-sm text-destructive -mt-2">{fieldError}</p>
          )}

          <DataProtectionConsent
            consent={dataConsent}
            onConsentChange={(v) => { setDataConsent(v); if (v) setConsentError(""); }}
            marketing={marketingConsent}
            onMarketingChange={setMarketingConsent}
            disabled={isSubmitting}
            error={consentError}
            compact
            idPrefix="tryon"
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : tab === "email" ? (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send to My Email &amp; Download
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Save &amp; Download
              </>
            )}
          </Button>

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

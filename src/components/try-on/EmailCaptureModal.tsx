import { useState, useEffect } from "react";
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
import { Mail, Phone, Loader2, Send, X, Download } from "lucide-react";
import { toast } from "sonner";

import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";
import { applyTryOnBadge, type TryOnResult } from "@/modules/personalization";
import { track, getSessionId } from "@/shared/lib/telemetry";

type ContactTab = "email" | "phone";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** email and phone are mutually exclusive — exactly one will be non-null. */
  onSubmit: (
    email: string | null,
    phone: string | null,
    marketingConsent: boolean,
    fullName?: string | null
  ) => Promise<{ success: boolean; channel?: "email" | "whatsapp"; delivered?: boolean }>;
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [consentError, setConsentError] = useState("");
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  // Set only when the lead saved but the email itself failed to send --
  // distinct from fieldError (a validation problem) so the retry/download
  // affordance can render without touching the form the visitor already filled in.
  const [deliveryFailed, setDeliveryFailed] = useState(false);

  // This component never unmounts between opens -- it's always rendered by
  // the parent, just toggled via `isOpen`. Dismissing via the X button,
  // backdrop click, or Escape all bypass resetForm() (that's only wired to
  // specific in-flow buttons), so a leftover sub-view from a previous
  // attempt -- the WhatsApp-share screen, the delivery-failed screen --
  // could persist and reappear instead of the tab+form on the next open.
  // Resetting whenever the dialog opens guarantees a fresh start regardless
  // of how the last attempt ended.
  useEffect(() => {
    if (!isOpen) return;
    setTab("email");
    setFullName("");
    setEmail("");
    setPhone("");
    setMarketingConsent(false);
    setDataConsent(false);
    setFieldError("");
    setConsentError("");
    setShowWhatsAppShare(false);
    setDeliveryFailed(false);
  }, [isOpen]);

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

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setMarketingConsent(false);
    setDataConsent(false);
    setShowWhatsAppShare(false);
    setDeliveryFailed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setDeliveryFailed(false);

    const { success, channel, delivered } = await onSubmit(
      tab === "email" ? email.trim() : null,
      tab === "phone" ? phone.trim() : null,
      marketingConsent,
      fullName.trim() || null
    );

    // Lead-capture failure: the hook already toasted the error. Leave the
    // form exactly as filled in so the visitor can just hit submit again.
    if (!success) return;

    if (channel === "whatsapp") {
      // WhatsApp: stay open, show share step
      setShowWhatsAppShare(true);
      return;
    }

    // Email: only close on a CONFIRMED send. A saved-but-undelivered lead
    // (delivered === false) surfaces a retry/download-instead choice
    // instead of quietly closing as if the email had gone out.
    if (delivered) {
      resetForm();
      onClose();
    } else {
      setDeliveryFailed(true);
    }
  };

  const handleDownloadInstead = () => {
    // Watermarked, deliberately -- this is a raw client-side download with no
    // server mediation. The clean image is what the contact was traded for;
    // it only ever leaves via a server-mediated channel (email attachment,
    // WhatsApp share) that actually confirms delivery. An email that FAILED
    // to send is not a confirmed delivery, so this must not become a
    // no-strings-attached way to get the clean file by just letting the
    // send fail.
    const source = result?.compositeImage;
    if (!source) return;
    const link = document.createElement("a");
    link.href = source;
    link.download = `mh-try-on-${result?.frameDetails?.name || "frame"}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    void track("tryon.email_download_fallback", {
      frameId: result?.frameDetails?.id ?? null,
    });
    resetForm();
    onClose();
  };

  const handleWhatsAppShare = async () => {
    const source = result?.cleanImage ?? result?.compositeImage;
    if (!source) return;

    setIsSharing(true);
    try {
      // The shared copy drops the diagonal tiling (the contact is captured)
      // but keeps the brand badge -- a Status post or forwarded image should
      // carry mandheyewear.com wherever it travels.
      const branded = await applyTryOnBadge(source);
      const response = await fetch(branded);
      const blob = await response.blob();
      const file = new File([blob], "mh-try-on.jpg", {
        type: blob.type || "image/jpeg",
      });

      // Tracked link back to the site: ref stitches any resulting visit to
      // this session's journey, utm params make the channel readable in
      // analytics. This is what turns a share into a lead-generation path.
      const shareUrl = `${window.location.origin}/try-on?utm_source=whatsapp&utm_medium=tryon_share&ref=${getSessionId()}`;
      const frameName = result?.frameDetails?.name ?? "these frames";

      // Desktop browsers mostly can't share files -- fall back to downloading
      // the branded image so the visitor still walks away with it.
      const canShareFiles =
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }));

      if (!canShareFiles) {
        const link = document.createElement("a");
        link.href = branded;
        link.download = "mh-try-on.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        void track("tryon.share_downloaded_fallback", {
          frameId: result?.frameDetails?.id ?? null,
        });
        toast.success("Image downloaded — attach it in WhatsApp to share!");
        resetForm();
        onClose();
        return;
      }

      void track("tryon.share_opened", {
        channel: "whatsapp_share_sheet",
        frameId: result?.frameDetails?.id ?? null,
        frameName: result?.frameDetails?.name ?? null,
      });

      await navigator.share({
        title: `Virtual Try-On: ${frameName}`,
        text: `Check out how ${frameName} looks on me! 👓 Try yours: ${shareUrl}`,
        files: [file],
      });

      void track("tryon.share_completed", {
        channel: "whatsapp_share_sheet",
        frameId: result?.frameDetails?.id ?? null,
      });

      // After successful share, close the modal
      resetForm();
      onClose();
    } catch (error) {
      // User cancelled or share failed — stay open so they can retry
      void track("tryon.share_cancelled", {
        channel: "whatsapp_share_sheet",
        frameId: result?.frameDetails?.id ?? null,
      });
      console.log("Share cancelled:", error);
    } finally {
      setIsSharing(false);
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
            {showWhatsAppShare ? (
              <><Send className="h-5 w-5 text-primary" /> Share Your Try-On</>
            ) : deliveryFailed ? (
              <><Mail className="h-5 w-5 text-destructive" /> Email Didn't Send</>
            ) : tab === "email" ? (
              <><Mail className="h-5 w-5 text-primary" /> Get Your Try-On via Email</>
            ) : (
              <><Phone className="h-5 w-5 text-primary" /> Get Your Try-On via WhatsApp</>
            )}
          </DialogTitle>
          <DialogDescription>
            {showWhatsAppShare
              ? "Send your try-on to WhatsApp to share with friends or save to your chats."
              : deliveryFailed
              ? "Your details are saved — just the email itself didn't go through."
              : "Save your look and receive frame details and a direct purchase link."}
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

        {deliveryFailed ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your contact details were saved, but the email failed to send
              just now. You can try again, or download your result directly.
            </p>
            <Button onClick={() => setDeliveryFailed(false)} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleDownloadInstead} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Instead
            </Button>
          </div>
        ) : showWhatsAppShare ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              Your try-on is saved. Now share it to WhatsApp!
            </p>
            <Button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening share…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to WhatsApp
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        ) : (
          <>
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
              <div className="space-y-2">
                <Label htmlFor="vto-name">
                  First name{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="vto-name"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="given-name"
                  maxLength={60}
                />
              </div>

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
                    {tab === "email" ? "Sending…" : "Saving…"}
                  </>
                ) : tab === "email" ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send to My Email &amp; Download
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Next: Share to WhatsApp
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

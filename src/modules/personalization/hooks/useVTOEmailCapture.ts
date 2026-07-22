import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { toast } from "sonner";
import type { TryOnResult } from "./useVirtualTryOn";
import { uploadTryOnResult } from "../lib/tryOnStorage";
import { getSessionId } from "@/shared/lib/telemetry";

export type ContactChannel = "email" | "whatsapp";

interface EmailCaptureState {
  isOpen: boolean;
  source: "download" | "share";
  result: TryOnResult | null;
}

interface SubmitContactParams {
  email: string | null;
  phone: string | null;
  marketingConsent: boolean;
  result: TryOnResult;
  source: "download" | "share";
  /** Optional -- enriches the lead and personalizes delivery, never required. */
  fullName?: string | null;
}

const CONSENT_TEXT_VERSION = "v1.0";

export const useVTOEmailCapture = () => {
  const { user } = useAuth();
  const { trackLead } = useMetaPixel();
  const [captureState, setCaptureState] = useState<EmailCaptureState>({
    isOpen: false,
    source: "download",
    result: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = !!user;
  const userEmail = user?.email;

  const submitContact = useCallback(
    async ({ email, phone, marketingConsent, result, source, fullName }: SubmitContactParams) => {
      setIsSubmitting(true);

      try {
        const channel: ContactChannel = email ? "email" : "whatsapp";

        // Store the clean image and keep only a path on the row. Previously the
        // full base64 went into try_on_image_url -- a single such row is 2.9MB.
        // A storage failure must not cost the lead, so this degrades to null.
        const cleanImage = result.cleanImage ?? result.compositeImage;
        const stored = cleanImage
          ? await uploadTryOnResult(cleanImage, {
              userId: user?.id ?? null,
              sessionId: getSessionId(),
              frameId: result.frameDetails?.id ?? null,
            })
          : null;

        const { error: dbError } = await supabase.from("vto_email_leads").insert({
          email: email ? email.toLowerCase().trim() : null,
          phone: phone ? phone.trim() : null,
          full_name: fullName?.trim() || null,
          marketing_consent: marketingConsent,
          frame_id: result.frameDetails?.id || null,
          frame_name: result.frameDetails?.name || null,
          source,
          user_id: user?.id || null,
          // try_on_image_url is deprecated (it held megabytes of base64);
          // the image now lives in storage and the row keeps a path.
          try_on_image_url: null,
          image_path: stored?.path ?? null,
          image_expires_at: stored?.expiresAt ?? null,
          // Consent provenance — required for NDPA 2023 + Meta WhatsApp compliance
          consent_timestamp: new Date().toISOString(),
          consent_source: "vto_result_gate",
          consent_text_version: CONSENT_TEXT_VERSION,
          consent_channel: channel,
        });

        if (dbError) {
          // Gap 1: graceful degrade — user still gets their result even if DB insert fails
          console.error("Error saving VTO lead:", dbError);
        }

        trackLead({
          content_name: result.frameDetails?.name,
          content_category: "virtual_try_on",
        });

        // Only send email if contact channel is email
        if (email) {
          const { error: emailError } = await supabase.functions.invoke(
            "send-tryon-result",
            {
              body: {
                email,
                fullName: fullName?.trim() || null,
                frameDetails: result.frameDetails,
                // The clean, unwatermarked image is what the contact was
                // traded for -- the on-screen copy stays watermarked.
                // Still base64 for email. The stored copy exists (and is what
                // the DB row points at), but switching the email to a signed
                // URL needs the Edge Function to do the signing -- the bucket
                // is private and anon cannot sign. Deploying that update is
                // blocked on the CLI's _shared/ layout, so it lands with the
                // WhatsApp work, which needs the same server-side signing.
                tryOnImageBase64: cleanImage,
                // Pass DB failure so the Edge Function can fire a Slack alert.
                // The user still receives their result regardless.
                ...(dbError && {
                  dbInsertFailed: true,
                  dbErrorMessage: dbError.message,
                }),
              },
            }
          );

          if (emailError) {
            console.error("Error sending VTO email:", emailError);
            // Check for circuit-open 503 — show a service-issue message, not a user error
            const isCircuitOpen = (emailError as any)?.context?.circuitOpen === true;
            // Logged-in users never see the capture modal (initiateCapture
            // skips it and captures silently) -- for them this toast IS the
            // entire UI, so it must describe a real next step. Guests DO see
            // the modal, which renders its own Try Again / Download Instead
            // buttons right there -- repeating those instructions in the
            // toast too was confusing and, worse, described actions that
            // don't exist for the logged-in path at all.
            const isSilentCapture = isLoggedIn && !!userEmail;
            toast.error(
              isCircuitOpen
                ? "Email delivery is temporarily paused. Your result is saved — please try again in 30 minutes."
                : isSilentCapture
                ? "Couldn't email your result — tap Download again to retry."
                : "Couldn't send that email.",
            );
            // The lead is saved (success) but nothing actually landed in an
            // inbox (delivered: false) -- callers must not treat this the
            // same as a real send, or silently kick off a "your email is on
            // its way" download as if it worked.
            return { success: true, channel, delivered: false };
          }

          toast.success("Your try-on result is on its way to your inbox!");
        } else if (phone) {
          // Delivery is client-side: the capture modal follows up with a share
          // sheet that puts the clean image straight into the visitor's own
          // WhatsApp -- no business number or Meta Cloud API setup required.
          //
          // The server send stays as a dormant fire-and-forget: the function
          // returns 503 until WHATSAPP_* secrets are configured, and the day
          // they are, business-initiated delivery starts working with no code
          // change here. Never awaited -- it must not delay the share step.
          supabase.functions
            .invoke("send-tryon-whatsapp", {
              body: {
                phone,
                fullName: fullName?.trim() || null,
                // The function signs this itself; anon cannot sign a private object.
                imagePath: stored?.path ?? null,
                frameName: result.frameDetails?.name ?? null,
                leadId: null,
              },
            })
            .catch(() => {});

          toast.success("Contact saved!");
        }

        return { success: true, channel, delivered: true };
      } catch (error) {
        console.error("VTO capture error:", error);
        toast.error("Something went wrong. Please try again.");
        return { success: false as const };
      } finally {
        setIsSubmitting(false);
      }
    },
    [user?.id, trackLead]
  );

  const closeModal = useCallback(() => {
    setCaptureState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Called when a gated action (download, share) is triggered.
  // Logged-in users are captured silently via their account email.
  // Guests see the gate modal — no skip path.
  const initiateCapture = useCallback(
    (result: TryOnResult, source: "download" | "share") => {
      if (isLoggedIn && userEmail) {
        submitContact({
          email: userEmail,
          phone: null,
          marketingConsent: false,
          result,
          source,
        });
        return { shouldShowModal: false };
      }

      setCaptureState({ isOpen: true, source, result });
      return { shouldShowModal: true };
    },
    [isLoggedIn, userEmail, submitContact]
  );

  // Called by the modal's onSubmit — contact is email OR phone, not both.
  const handleSubmit = useCallback(
    async (
      email: string | null,
      phone: string | null,
      marketingConsent: boolean,
      fullName?: string | null,
    ) => {
      if (!captureState.result) return { success: false };

      const result = await submitContact({
        email,
        phone,
        marketingConsent,
        result: captureState.result,
        source: captureState.source,
        fullName,
      });

      // Email closes only once actually delivered -- on failure the modal
      // stays open with a retry/download-instead option instead of
      // vanishing as if it worked. WhatsApp always stays open so the modal
      // can show the share step (navigator.share needs a fresh user tap --
      // it cannot fire from this async completion).
      if (result.success && result.channel === "email" && result.delivered) {
        closeModal();
      }

      return result;
    },
    [captureState, submitContact, closeModal]
  );

  return {
    captureState,
    isSubmitting,
    isLoggedIn,
    userEmail,
    initiateCapture,
    closeModal,
    handleSubmit,
  };
};

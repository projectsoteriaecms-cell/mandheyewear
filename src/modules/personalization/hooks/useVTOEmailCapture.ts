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
    async ({ email, phone, marketingConsent, result, source }: SubmitContactParams) => {
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
            toast.error(
              isCircuitOpen
                ? "Email delivery is temporarily paused. Your result is saved — please try again in 30 minutes."
                : "Couldn't send email, but you can download your result below.",
            );
          } else {
            toast.success("Your try-on result is on its way to your inbox!");
          }
        } else if (phone) {
          // Previously this branch only showed a toast -- nothing was ever
          // sent, so WhatsApp leads were promised a follow-up that never came.
          const { data: waData, error: waError } = await supabase.functions.invoke(
            "send-tryon-whatsapp",
            {
              body: {
                phone,
                // The function signs this itself; anon cannot sign a private object.
                imagePath: stored?.path ?? null,
                frameName: result.frameDetails?.name ?? null,
                leadId: null,
              },
            },
          );

          if (waError || (waData as { error?: string } | null)?.error) {
            console.error("Error sending VTO WhatsApp:", waError ?? waData);
            // The lead and consent are already saved, so this is recoverable
            // by a human following up -- say so rather than implying failure.
            toast.success("Got it! We'll follow up on WhatsApp with your result.");
          } else {
            toast.success("Sent! Check WhatsApp for your try-on result.");
          }
        }

        return { success: true };
      } catch (error) {
        console.error("VTO capture error:", error);
        toast.error("Something went wrong. Please try again.");
        return { success: false };
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
    async (email: string | null, phone: string | null, marketingConsent: boolean) => {
      if (!captureState.result) return { success: false };

      const result = await submitContact({
        email,
        phone,
        marketingConsent,
        result: captureState.result,
        source: captureState.source,
      });

      if (result.success) {
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

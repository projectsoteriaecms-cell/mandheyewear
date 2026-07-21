import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { toast } from "sonner";
import type { TryOnResult } from "./useVirtualTryOn";

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

        const { error: dbError } = await supabase.from("vto_email_leads").insert({
          email: email ? email.toLowerCase().trim() : null,
          phone: phone ? phone.trim() : null,
          marketing_consent: marketingConsent,
          frame_id: result.frameDetails?.id || null,
          frame_name: result.frameDetails?.name || null,
          source,
          user_id: user?.id || null,
          try_on_image_url: result.compositeImage || null,
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
                tryOnImageBase64: result.compositeImage,
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
        } else {
          toast.success("Got it! We'll follow up on WhatsApp with your result.");
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

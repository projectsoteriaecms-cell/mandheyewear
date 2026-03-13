import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { toast } from "sonner";
import type { TryOnResult } from "./useVirtualTryOn";

interface EmailCaptureState {
  isOpen: boolean;
  source: "download" | "share";
  result: TryOnResult | null;
}

interface SubmitEmailParams {
  email: string;
  marketingConsent: boolean;
  result: TryOnResult;
  source: "download" | "share";
}

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

  const submitEmail = useCallback(
    async ({ email, marketingConsent, result, source }: SubmitEmailParams) => {
      setIsSubmitting(true);

      try {
        const { error: dbError } = await supabase.from("vto_email_leads").insert({
          email,
          marketing_consent: marketingConsent,
          frame_id: result.frameDetails?.id || null,
          frame_name: result.frameDetails?.name || null,
          source,
          user_id: user?.id || null,
          try_on_image_url: result.compositeImage || null,
        });

        if (dbError) {
          console.error("Error saving VTO lead:", dbError);
        }

        trackLead({
          content_name: result.frameDetails?.name,
          content_category: "virtual_try_on",
        });

        const { error: emailError } = await supabase.functions.invoke(
          "send-tryon-result",
          {
            body: {
              email,
              frameDetails: result.frameDetails,
              tryOnImageBase64: result.compositeImage,
            },
          }
        );

        if (emailError) {
          console.error("Error sending VTO email:", emailError);
          toast.error("Couldn't send email, but your result is ready to download");
        } else {
          toast.success("Your try-on result will be sent to your email!");
        }

        return { success: true };
      } catch (error) {
        console.error("VTO email capture error:", error);
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

  const initiateCapture = useCallback(
    (result: TryOnResult, source: "download" | "share") => {
      if (isLoggedIn && userEmail) {
        submitEmail({
          email: userEmail,
          marketingConsent: false,
          result,
          source,
        });
        return { shouldShowModal: false };
      }

      setCaptureState({
        isOpen: true,
        source,
        result,
      });
      return { shouldShowModal: true };
    },
    [isLoggedIn, userEmail, submitEmail]
  );

  const handleSubmit = useCallback(
    async (email: string, marketingConsent: boolean) => {
      if (!captureState.result) return { success: false };

      const result = await submitEmail({
        email,
        marketingConsent,
        result: captureState.result,
        source: captureState.source,
      });

      if (result.success) {
        closeModal();
      }

      return result;
    },
    [captureState, submitEmail, closeModal]
  );

  const skipCapture = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    captureState,
    isSubmitting,
    isLoggedIn,
    userEmail,
    initiateCapture,
    closeModal,
    handleSubmit,
    skipCapture,
  };
};
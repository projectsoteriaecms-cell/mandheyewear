import { useState, useCallback } from "react";
import { useAuth } from "@/modules/auth";
import { useProfile } from "./useProfile";
import { useSessionTryOnPhoto } from "../lib/sessionTryOnPhoto";

/**
 * Whether "Try On" opens inline used to depend on being logged in with a
 * saved photo -- anyone else got bounced to /try-on to start over, even for
 * a frame they were already looking at. Now it ALWAYS opens inline: a signed-
 * in user's saved photo is used if there is one, otherwise the shared session
 * photo (set by InlineTryOnModal's own upload step, and reused for every
 * other product they try in this tab) if there is one, and if there's
 * neither, the modal itself asks for a photo before generating -- no
 * navigation away in any case.
 */
export const useInlineTryOn = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const sessionPhoto = useSessionTryOnPhoto();

  const accountPhotoUrl = isAuthenticated ? profile?.vto_photo_url || null : null;
  const savedPhotoUrl = accountPhotoUrl || sessionPhoto;

  const triggerTryOn = useCallback(
    (productId: string, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      setTargetProductId(productId);
      setModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTargetProductId(null);
  }, []);

  return {
    modalOpen,
    targetProductId,
    savedPhotoUrl,
    triggerTryOn,
    closeModal,
    setModalOpen,
  };
};

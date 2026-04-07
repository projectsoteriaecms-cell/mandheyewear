import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useProfile } from "@/modules/personalization/hooks/useProfile";

export const useInlineTryOn = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetProductId, setTargetProductId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const savedPhotoUrl = profile?.vto_photo_url || null;
  const canInlineTryOn = isAuthenticated && !!savedPhotoUrl;

  const triggerTryOn = useCallback(
    (productId: string, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (savedPhotoUrl) {
        setTargetProductId(productId);
        setModalOpen(true);
      } else {
        navigate(`/try-on?product=${productId}`);
      }
    },
    [isAuthenticated, savedPhotoUrl, navigate]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTargetProductId(null);
  }, []);

  return {
    modalOpen,
    targetProductId,
    savedPhotoUrl,
    canInlineTryOn,
    triggerTryOn,
    closeModal,
    setModalOpen,
  };
};

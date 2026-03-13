// Shared hook exports
export { useAuth } from "./useAuth";
export { 
  useUserRole, 
  useIsStaff, 
  useIsManager, 
  useIsSuperAdmin,
  useIsAdmin,
  type AppRole 
} from "./useUserRole";

// Cross-cutting shared hooks
export { useToast, toast } from "./use-toast";
export { useIsMobile } from "./use-mobile";
export { useSEO } from "./useSEO";
export { useMetaPixel, useMetaPixelPageView } from "./useMetaPixel";
export { usePWA } from "./usePWA";
export { useCameraKit, type CameraKitState, type UseCameraKitReturn } from "./useCameraKit";
export { useOfflineSync } from "./useOfflineSync";
export { useOfflineMutation } from "./useOfflineMutation";
export { usePerformance } from "./usePerformance";
export { useResourceHints } from "./useResourceHints";
export { useScrollReveal } from "./useScrollReveal";
export { usePullToRefresh } from "./usePullToRefresh";
export { useSwipeGesture } from "./useSwipeGesture";

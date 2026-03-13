// Shared hook exports - canonical sources
export { useAuth } from "@/modules/auth/hooks/useAuth";
export { 
  useUserRole, 
  useIsStaff, 
  useIsManager, 
  useIsSuperAdmin,
  useIsAdmin,
  type AppRole 
} from "@/modules/auth/hooks/useUserRole";

// Cross-cutting shared hooks
export { useToast, toast } from "./use-toast";
export { useIsMobile } from "./use-mobile";
export { useSEO } from "./useSEO";
export { useMetaPixel, useMetaPixelPageView } from "./useMetaPixel";
export { usePWA } from "./usePWA";
export { useCameraKit, type CameraKitState, type UseCameraKitReturn } from "./useCameraKit";
export { useOfflineSync } from "./useOfflineSync";
export { useOfflineMutation } from "./useOfflineMutation";
export { useDebounce, useThrottle, useIntersectionObserver } from "./usePerformance";
export { usePreload, usePrefetch, useDnsPrefetch } from "./useResourceHints";
export { useScrollReveal } from "./useScrollReveal";
export { usePullToRefresh } from "./usePullToRefresh";
export { useSwipeGesture } from "./useSwipeGesture";

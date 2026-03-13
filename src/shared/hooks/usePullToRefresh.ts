import { useState, useCallback, useRef, useEffect } from "react";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: PullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    pullProgress: 0,
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only start pull if at the top of the page
    if (window.scrollY === 0 && containerRef.current) {
      startY.current = e.touches[0].clientY;
      setState((prev) => ({ ...prev, isPulling: true }));
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!state.isPulling || state.isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      if (diff > 0 && window.scrollY === 0) {
        // Apply resistance to pull
        const resistance = 0.5;
        const pullDistance = Math.min(diff * resistance, maxPull);
        const pullProgress = Math.min(pullDistance / threshold, 1);

        setState((prev) => ({
          ...prev,
          pullDistance,
          pullProgress,
        }));

        // Prevent scroll when pulling
        if (pullDistance > 0) {
          e.preventDefault();
        }
      }
    },
    [state.isPulling, state.isRefreshing, threshold, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling) return;

    if (state.pullDistance >= threshold && !state.isRefreshing) {
      setState((prev) => ({ ...prev, isRefreshing: true }));

      try {
        await onRefresh();
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          pullProgress: 0,
        });
      }
    } else {
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        pullProgress: 0,
      });
    }
  }, [state.isPulling, state.pullDistance, state.isRefreshing, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options: AddEventListenerOptions = { passive: false };

    container.addEventListener("touchstart", handleTouchStart, options);
    container.addEventListener("touchmove", handleTouchMove, options);
    container.addEventListener("touchend", handleTouchEnd, options);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    ...state,
  };
};

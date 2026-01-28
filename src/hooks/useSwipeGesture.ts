import { useState, useCallback, useRef } from "react";

type SwipeDirection = "left" | "right" | "up" | "down" | null;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeState {
  direction: SwipeDirection;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
}

interface SwipeOptions extends SwipeHandlers {
  threshold?: number;
  preventDefaultOnSwipe?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultOnSwipe = false,
}: SwipeOptions = {}) => {
  const [state, setState] = useState<SwipeState>({
    direction: null,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
  });

  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    setState((prev) => ({ ...prev, isSwiping: true }));
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!state.isSwiping) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX.current;
      const deltaY = currentY - startY.current;

      // Determine swipe direction based on dominant axis
      let direction: SwipeDirection = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      setState((prev) => ({
        ...prev,
        deltaX,
        deltaY,
        direction,
      }));

      if (preventDefaultOnSwipe && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    },
    [state.isSwiping, preventDefaultOnSwipe]
  );

  const handleTouchEnd = useCallback(() => {
    const { deltaX, deltaY, direction } = state;
    const timeDiff = Date.now() - startTime.current;
    const velocity = Math.max(Math.abs(deltaX), Math.abs(deltaY)) / timeDiff;

    // Check if swipe meets threshold (or has enough velocity)
    const meetsThreshold =
      Math.abs(deltaX) >= threshold ||
      Math.abs(deltaY) >= threshold ||
      velocity > 0.5;

    if (meetsThreshold && direction) {
      switch (direction) {
        case "left":
          onSwipeLeft?.();
          break;
        case "right":
          onSwipeRight?.();
          break;
        case "up":
          onSwipeUp?.();
          break;
        case "down":
          onSwipeDown?.();
          break;
      }
    }

    setState({
      direction: null,
      deltaX: 0,
      deltaY: 0,
      isSwiping: false,
    });
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return {
    handlers,
    ...state,
  };
};

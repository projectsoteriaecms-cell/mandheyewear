import { useCallback, useRef, useState } from "react";

interface DebounceOptions {
  delay?: number;
  leading?: boolean;
}

// Debounce hook for search inputs, etc.
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  { delay = 300, leading = false }: DebounceOptions = {}
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const leadingRef = useRef(true);

  return useCallback(
    (...args: Parameters<T>) => {
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        callback(...args);
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        leadingRef.current = true;
      }, delay);
    },
    [callback, delay, leading]
  );
};

// Throttle hook for scroll handlers, resize, etc.
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 100
) => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        // Schedule trailing call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      if (ref.current) {
        // Cleanup previous observer
      }

      if (node) {
        const observer = new IntersectionObserver(([entry]) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting && !hasIntersected) {
            setHasIntersected(true);
          }
        }, options);

        observer.observe(node);
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;

        return () => observer.disconnect();
      }
    },
    [options, hasIntersected]
  );

  return { ref: setRef, isIntersecting, hasIntersected };
};

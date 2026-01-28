import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

interface ScrollRevealReturn {
  ref: React.RefObject<HTMLElement>;
  inView: boolean;
  hasRevealed: boolean;
}

/**
 * Custom hook for scroll-triggered reveal animations
 * Uses Intersection Observer for viewport detection
 * Respects prefers-reduced-motion accessibility setting
 */
export const useScrollReveal = ({
  threshold = 0.15,
  triggerOnce = true,
  rootMargin = '0px 0px -50px 0px',
}: ScrollRevealOptions = {}): ScrollRevealReturn => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isIntersecting = entry.isIntersecting;

      if (isIntersecting) {
        setInView(true);
        setHasRevealed(true);
      } else if (!triggerOnce) {
        setInView(false);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    // If user prefers reduced motion, reveal immediately
    if (prefersReducedMotion) {
      setInView(true);
      setHasRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, handleIntersection, prefersReducedMotion]);

  return { ref, inView, hasRevealed };
};

/**
 * Hook for staggered reveal animations on multiple children
 */
export const useStaggerReveal = (
  itemCount: number,
  baseDelay: number = 0.1,
  options?: ScrollRevealOptions
) => {
  const { ref, inView, hasRevealed } = useScrollReveal(options);
  
  const getStaggerDelay = (index: number) => ({
    animationDelay: `${index * baseDelay}s`,
    transitionDelay: `${index * baseDelay}s`,
  });

  return { ref, inView, hasRevealed, getStaggerDelay };
};

export default useScrollReveal;

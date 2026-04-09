import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  startOnView?: boolean;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

/**
 * Animates a number from 0 to target value using requestAnimationFrame
 * Triggered when element enters viewport via IntersectionObserver
 */
export const useCountUp = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  separator = ',',
}: UseCountUpOptions = { end: 0 }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const frameRef = useRef<number>();

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(end);
      setHasStarted(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));

            if (progress < 1) {
              frameRef.current = requestAnimationFrame(animate);
            }
          };

          frameRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, hasStarted, prefersReducedMotion]);

  const formatNumber = (num: number): string => {
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return `${prefix}${formatted}${suffix}`;
  };

  return { ref, displayValue: formatNumber(count) };
};

export default useCountUp;

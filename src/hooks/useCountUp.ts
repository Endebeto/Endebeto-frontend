import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 to `target` over `duration` ms once `start` becomes true.
 * Handles decimals (1 decimal place if target is not an integer).
 */
export function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = eased * target;
      setValue(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [start, target, duration]);

  const isFloat = !Number.isInteger(target);
  return isFloat ? value.toFixed(1) : Math.floor(value).toString();
}

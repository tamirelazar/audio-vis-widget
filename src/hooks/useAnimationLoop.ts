import { useEffect, useRef } from 'react';

type DrawFunction = (elapsed: number) => void;

export const useAnimationLoop = (drawFunction: DrawFunction): void => {
  const startTimeRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      if (!startTimeRef.current) {
        startTimeRef.current = performance.now();
      }
      const elapsed = performance.now() - startTimeRef.current;

      drawFunction(elapsed);

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      startTimeRef.current = null;
    };
  }, [drawFunction]);
}; 
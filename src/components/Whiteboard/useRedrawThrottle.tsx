import { useRef, useCallback } from 'react';

export const useRedrawThrottle = (
  redrawCanvas: (scale: number, offset: { x: number; y: number }) => void
) => {
  const animationFrame = useRef<number | null>(null);

  const requestRedraw = useCallback(
    (scale: number, offset: { x: number; y: number }) => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        redrawCanvas(scale, offset);
        animationFrame.current = null;
      });
    },
    [redrawCanvas]
  );

  return requestRedraw;
};

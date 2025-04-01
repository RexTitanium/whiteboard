import { useCallback, useRef } from 'react';
import { useWhiteboard } from '../../context/WhiteBoardContext';
import { useRedrawThrottle } from './useRedrawThrottle';

export const usePanZoom = (redrawCanvas: (scale: number, offset: { x: number, y: number }) => void) => {
  const { scale, setScale, offset, setOffset, setIsPanning } = useWhiteboard();
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const throttledRedraw = useRedrawThrottle(redrawCanvas);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    setScale(newScale);
    throttledRedraw(newScale, offset);
  }, [scale, offset, setScale, throttledRedraw]);

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 1) return;
    e.preventDefault();
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    setOffset((prev: { x: number; y: number; }) => {
      const newOffset = { x: prev.x + dx, y: prev.y + dy };
      throttledRedraw(scale, newOffset);
      return newOffset;
    });
    panStart.current = { x: e.clientX, y: e.clientY };
  }, [scale, setOffset, throttledRedraw]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
    panStart.current = null;
  }, []);

  return {
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
  };
};
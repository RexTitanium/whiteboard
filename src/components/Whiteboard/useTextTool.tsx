import { useEffect } from 'react';
import { useWhiteboard } from '../../context/WhiteBoardContext';

export const useTextTool = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  saveSnapshot: (scale: number, offset: { x: number; y: number }) => void
) => {
  const {
    isTyping,
    textValue,
    setTextValue,
    textPosition,
    setTextPosition,
    color,
    fontSize,
    isBold,
    isItalic,
    showCursor,
    setShowCursor,
    scale,
    offset,
    setIsTyping
  } = useWhiteboard() as any;

  useEffect(() => {
    if (!isTyping) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !textPosition) return;

        ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px Poppins,sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        ctx.fillText(textValue, textPosition.x, textPosition.y);
        saveSnapshot(scale, offset);

        setIsTyping(false);
        setTextValue('');
        setTextPosition(null);
      } else if (e.key === 'Escape') {
        setIsTyping(false);
        setTextValue('');
        setTextPosition(null);
      } else if (e.key.length === 1) {
        setTextValue((prev: string) => prev + e.key);
      } else if (e.key === 'Backspace') {
        setTextValue((prev: string) => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, textValue, textPosition, color, fontSize]);

  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      setShowCursor((prev: boolean) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  useEffect(() => {
    const preview = previewCanvasRef.current;
    const ctx = preview?.getContext('2d');

    if (!preview || !ctx) return;

    ctx.clearRect(0, 0, preview.width, preview.height);

    if (isTyping && textPosition) {
      const { x, y } = textPosition;

      ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : ''}${fontSize}px Poppins, sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      if (textValue) {
        ctx.fillText(textValue, x, y);
      }

      if (showCursor) {
        const textWidth = ctx.measureText(textValue).width;
        ctx.beginPath();
        ctx.moveTo(x + textWidth + 1, y);
        ctx.lineTo(x + textWidth + 1, y + fontSize);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, [textValue, showCursor, isTyping, textPosition, fontSize, color]);
};
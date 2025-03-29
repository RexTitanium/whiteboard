import { useState, useRef, useCallback } from 'react';

export const useCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  const saveSnapshot = useCallback((scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snapshot = canvas.toDataURL();
    setUndoStack((prev) => [...prev, snapshot]);
    setRedoStack([]);

    const img = new Image();
    img.src = snapshot;
    img.onload = () => {
      setBaseImage(img);
    };
  }, [canvasRef]);

  const redrawCanvas = useCallback((scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseImage) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const displayWidth = canvas.width / dpr;
    const displayHeight = canvas.height / dpr;
    ctx.drawImage(baseImage, 0, 0, displayWidth, displayHeight);
  }, [canvasRef, baseImage]);

  const undo = useCallback((scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || undoStack.length <= 1) return;

    const newUndoStack = [...undoStack];
    newUndoStack.pop();
    const prevState = newUndoStack[newUndoStack.length - 1];

    setUndoStack(newUndoStack);
    setRedoStack((prev) => [...prev, canvas.toDataURL()]);

    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      context.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      context.drawImage(img, 0, 0, displayWidth, displayHeight);

      setBaseImage(img);
    };
  }, [canvasRef, undoStack]);

  const redo = useCallback((scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const lastState = newRedoStack.pop();
    setRedoStack(newRedoStack);
    setUndoStack((prev) => [...prev, canvas.toDataURL()]);

    const img = new Image();
    if (lastState) {
      img.src = lastState;
    }

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      context.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      context.drawImage(img, 0, 0, displayWidth, displayHeight);

      setBaseImage(img);
    };
  }, [canvasRef, redoStack]);

  const clearCanvas = useCallback((scale: number, offset: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setBaseImage(null);

    saveSnapshot(scale, offset);
  }, [canvasRef, saveSnapshot]);


  return {
    undo,
    redo,
    clearCanvas,
    saveSnapshot,
    redrawCanvas,
    isDrawing,
    setIsDrawing,
    startPos,
    setStartPos,
  };
};

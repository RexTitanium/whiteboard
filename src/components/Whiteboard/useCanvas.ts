import { useState, useRef } from 'react';

export const useCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    previewCanvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    setUndoStack((prev) => [...prev, snapshot]);
    setRedoStack([]);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || undoStack.length <= 1) return;

    const newUndoStack = [...undoStack];
    const lastState = newUndoStack.pop();
    const prevState = newUndoStack[newUndoStack.length - 1];

    setUndoStack(newUndoStack);
    setRedoStack((prev) => [...prev, canvas.toDataURL()]);

    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const redo = () => {
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
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    saveSnapshot();
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return {
    undo,
    redo,
    clearCanvas,
    saveSnapshot,
    isDrawing,
    setIsDrawing,
    startPos,
    setStartPos,
  };
};

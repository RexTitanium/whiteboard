import { useCallback } from 'react';
import { useWhiteboard } from '../../context/WhiteBoardContext';
import { snapAngle, getSnappedEndpoint } from '../../utils/snapping';
import { useCanvas } from './useCanvas';

export const useDrawing = (
  saveSnapshot: (scale: number, offset: {x: number, y:number}) => void,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
  const {
    tool, shape, brushSize, eraserSize, color, isDrawing,
    setIsDrawing, startPos, setStartPos, scale, offset, gridCols
  } = useWhiteboard();

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    return { offsetX: x, offsetY: y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCanvasCoords(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.lineWidth = tool === 'pen' ? brushSize : eraserSize;
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = tool === 'pen' ? 'source-over' : 'destination-out';
      setIsDrawing(true);
    } else if (shape !== '') {
      ctx.globalCompositeOperation = 'source-over';
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCanvasCoords(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { offsetX, offsetY } = getCanvasCoords(e);
    const { shiftKey } = e.nativeEvent;

    if (tool === 'pen' || tool === 'eraser') {
        ctx.closePath();
    } else if (shape !== '' && startPos) {
        const { x, y } = startPos;

        let endX = offsetX;
        let endY = offsetY;

        if (shape === 'rectangle' || shape === 'circle') {
        if (shiftKey) {
            const dx = offsetX - x;
            const dy = offsetY - y;
            const size = Math.min(Math.abs(dx), Math.abs(dy));
            endX = x + Math.sign(dx) * size;
            endY = y + Math.sign(dy) * size;
        }
        } else if (shape === 'line' && shiftKey) {
        const dx = offsetX - x;
        const dy = offsetY - y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const snapped = snapAngle(angle);
        const length = Math.sqrt(dx * dx + dy * dy);
        [endX, endY] = getSnappedEndpoint(x, y, length, snapped);
        }

        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;

        if (shape === 'rectangle') {
            ctx.rect(x, y, endX - x, endY - y);
            } else if (shape === 'circle') {
            const radius = Math.sqrt((endX - x) ** 2 + (endY - y) ** 2);
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            } else if (shape === 'line') {
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            } else if (shape === 'grid') {
            const rows = 1;
            const cols = gridCols;
            const width = endX - x;
            const height = endY - y;
            const cellWidth = width / cols;
            const cellHeight = height / rows;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                ctx.rect(x + c * cellWidth, y + r * cellHeight, cellWidth, cellHeight);
                }
            }
        }

        ctx.stroke();
        ctx.closePath();

        const preview = previewCanvasRef.current;
        preview?.getContext('2d')?.clearRect(0, 0, preview.width, preview.height);
        }

        setIsDrawing(false);
        setStartPos(null);
        saveSnapshot(scale, offset);
    };


  return {
    getCanvasCoords,
    startDrawing,
    draw,
    endDrawing,
  };
};
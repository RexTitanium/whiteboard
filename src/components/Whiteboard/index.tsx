import React, { useRef, useEffect, useState } from 'react';
import Toolbar from '../Toolbar';
import CanvasLayer from './CanvasLayer';
import { useCanvas } from './useCanvas';
import { Tool, Shapes } from '../../types/types';
import { generateCursor } from './generateCursor';
import Taskbar from '../Taskbar';
import Toast from '../Toast';
import api from '../../api/api';
import { renameFile } from '../../utils/utils';
import { useBoard } from '../../context/BoardContext';
import { useWhiteboard } from '../../context/WhiteBoardContext';
import { useDrawing } from './useDrawing';
import { getSnappedEndpoint, snapAngle } from '../../utils/snapping';
import { usePanZoom } from './usePanZoom';
import { useTextTool } from './useTextTool';
import { uploadBoard, shareBoard } from './boardUtil';

interface WhiteboardProps {
  boardId: string;
  onExit: () => void;
}


const Whiteboard: React.FC<WhiteboardProps> = ({
  boardId,
  onExit,
}) => {

  const {board, permission, sharedWith, } = useBoard();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isReadOnly = permission === 'view';
  const [fileName, setFileName] = useState(board?.name || 'Unnamed');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const [sharedUsers, setSharedUsers] = useState<{ userId: string; email: string; permission: 'view' | 'edit' }[]>(sharedWith);
  const {
    tool, setTool,
    shape, setShape,
    color, setColor,
    brushSize, setBrushSize,
    eraserSize, setEraserSize,
    fontSize, setFontSize,
    isBold, setIsBold,
    isItalic, setIsItalic,
    isTyping, setIsTyping,
    textValue, setTextValue,
    textPosition, setTextPosition,
    scale, setScale,
    offset, setOffset,
    gridCols, setGridCols,
    isDrawing, setIsDrawing,
    startPos, setStartPos,
    isPanning
  }=useWhiteboard()

  const {
    undo,
    redo,
    clearCanvas,
    saveSnapshot,
    redrawCanvas,
  } = useCanvas(canvasRef, previewCanvasRef);

  const {
    getCanvasCoords,
    startDrawing,
    draw,
    endDrawing,
  } = useDrawing(saveSnapshot, canvasRef, previewCanvasRef);

  const { handleWheel, handlePanStart, handlePanMove, handlePanEnd } = usePanZoom(redrawCanvas);

  const loadBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const boardData = board?.data;
    if (!boardData) {
      triggerToast(`No saved data for "${board?.name}"`);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `${boardData}?v=${Date.now()}`

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);
      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      requestAnimationFrame(() => {
        saveSnapshot(scale, offset);
      });

      triggerToast(`Loaded "${board.name}"`);
    };
  };

  const handlePermissionChange = async (email: string, newPermission: 'view' | 'edit') => {
    try {
        await api.post(`/boards/${boardId}/share`, { email, permission: newPermission });

        setSharedUsers((prev) =>
        prev.map((u) =>
            u.email === email ? { ...u, permission: newPermission } : u
        )
        );
        triggerToast(`Updated ${email} to ${newPermission}`);
    } catch (err) {
        console.error('Failed to update permission:', err);
        triggerToast('Failed to update permission');
    }
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  const getCursorURL = ({ item }: { item: Tool | Shapes }) => {
    const size = item === 'pen' ? brushSize
                : item === 'eraser' ? eraserSize
                : item === 'text' ? fontSize * 2
                : 35;

    const cursorSVG = generateCursor(size, item, color);
    const blob = new Blob([cursorSVG], { type: 'image/svg+xml' });
    const cursorUrl = URL.createObjectURL(blob);

    const hotspot = `${size / 2} ${size / 2}`;

    return `url(${cursorUrl}) ${hotspot}, auto`;
  };

  const handleShare = async (email: string, permission: 'view' | 'edit') => {
    try {
      await shareBoard(boardId, 'user@example.com', 'view');
      setSharedUsers((prev) => {
        const existingIndex = prev.findIndex((u) => u.email === email);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], permission };
          return updated;
        } else {
          return [...prev, { email, permission, userId: '' }]; 
        }
      });
      triggerToast(`Shared with ${email} (${permission})`);
    } catch (err) {
      console.error('Failed to share board', err);
      triggerToast('Failed to share');
    }
  }

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text') return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    setTextValue('');
    setTextPosition({ x: offsetX, y: offsetY });
    setIsTyping(true);
  };


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    if (tool === 'pen' || tool === 'eraser') {
      draw(e);
      return;
    }

    if (shape !== '' && startPos) {
      const preview = previewCanvasRef.current;
      const ctx = preview?.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      ctx && ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);

      if (!preview || !ctx) return;

      const {shiftKey} = e.nativeEvent;
      const { x, y } = startPos;

      const { offsetX, offsetY } = getCanvasCoords(e);
      
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

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, preview.width, preview.height);
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);

      ctx.beginPath();
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
    }
  };

  
  const saveBoard = async ():Promise<number | undefined> => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const resp = await uploadBoard(boardId, dataUrl);
    return resp
  };

  useTextTool(canvasRef, previewCanvasRef, saveSnapshot);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preview = previewCanvasRef.current;
    if (!canvas || !preview) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth * 0.98;
    const height = window.innerHeight * 0.93;

    [canvas, preview].forEach((c) => {
      c.width = width * dpr;
      c.height = height * dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;

      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    });

    redrawCanvas(scale, offset)
  }, [window.innerWidth, window.innerHeight, scale, offset]);

  useEffect(() => {
    if (board?.data) {
      loadBoard();
    }
  },[board?.data])

  useEffect(() => {
    const rename = async () => {
      const resp = await renameFile(boardId, fileName);
      if(resp) triggerToast(resp);
    };

    if (fileName !== board?.name) {
      rename();
    }

}, [fileName]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo(scale, offset); 
          } else {
            undo(scale, offset);
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo(scale, offset); 
        } else if (e.key.toLowerCase() === 's'){
          e.preventDefault();
          saveBoard();
        } else if (e.key.toLowerCase() === '0'){
            setScale(1);
            setOffset({ x: 0, y: 0 });

        }
        return;
    }

    switch (e.key.toLowerCase()) {
      case 'b':
        setTool('pen');
        setShape('');
        break;
      case 'e':
        setTool('eraser');
        setShape('');
        break;
      case 'r':
        setShape('rectangle');
        setTool('');
        break;
      case 'c':
        setShape('circle');
        setTool('');
        break;
      case 'l':
        setShape('line');
        setTool('');
        break;
      case 'x':
        clearCanvas(scale, offset);
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo, setTool, setShape, clearCanvas, saveBoard, loadBoard]);

  return (
    <div className="flex flex-col items-center transition-[all 300ms ease] dark:bg-[#000] dark:transition-[all 300ms ease]">
      <div className="absolute z-[100] top-12 w-full">
        <Taskbar
        handleBackButton={onExit}
        fileName={fileName}
        setFileName={setFileName}
        downloadBoard={downloadBoard}
        saveBoard={saveBoard}
        boardId={boardId}
        sharedUsers={sharedUsers}
        setSharedUsers={setSharedUsers}
        onShare={handleShare}
        handlePermissionChange={handlePermissionChange}
        permission={permission}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
      />
      </div>
      <div className="min-h-screen flex items-center justify-center" 
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}  
      >
        <div className={`relative transition-all duration-300ms ease dark: transition-all duration-300ms ease dark:bg-[radial-gradient(circle,_#111_1px,_#040404_1px)] bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] [background-size:20px_20px] border border-gray-300 rounded-3xl transition-all duration-300 dark:border-gray-700`}>
          <CanvasLayer
            ref={canvasRef}
            onMouseDown={isReadOnly? undefined:startDrawing}
            onMouseMove={isReadOnly? undefined:handleMouseMove}
            onMouseUp={isReadOnly? undefined:endDrawing}
            onMouseLeave={isReadOnly? undefined:endDrawing}
            onClick={isReadOnly? undefined:handleCanvasClick}
            className=""
            style={{ cursor: isPanning ? 'grab' : isReadOnly? 'not-allowed': getCursorURL({ item: tool || shape }) }}
          />

          <CanvasLayer
            ref={previewCanvasRef}
            className="absolute top-0 left-0 pointer-events-none z-10"
          />
        </div>
      </div>
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default Whiteboard;
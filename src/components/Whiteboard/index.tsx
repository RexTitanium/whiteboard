import React, { useRef, useEffect, useState } from 'react';
import Toolbar from '../Toolbar';
import CanvasLayer from './CanvasLayer';
import { useCanvas } from './useCanvas';
import { Tool, Shapes } from '../../types/types';
import { generateCursor } from './generateCursor';
import Taskbar from '../Taskbar';
import Toast from '../Toast';

interface WhiteboardProps {
  boardId: string;
  board: { name: string; data: string };
  boards: Record<string, { name: string; data: string }>;
  onExit: () => void;
  updateBoards: React.Dispatch<React.SetStateAction<Record<string, { name: string; data: string }>>>;
  getUniqueBoardName: (base?: string) => string;
}


const Whiteboard: React.FC<WhiteboardProps> = ({
  boardId,
  board,
  boards,
  updateBoards,
  onExit,
  getUniqueBoardName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [tool, setTool] = useState<Tool>('pen');
  const [shape, setShape] = useState<Shapes | ''>('');
  const [gridCols, setGridCols] = useState(3);
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fileName, setFileName] = useState(board.name || 'Unnamed');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [scale, setScale] = useState(1); // Zoom level
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // Pan offset
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number } | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);


  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    setScale(newScale);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;
    return { offsetX: x, offsetY: y };
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 1) return; // Middle mouse
    e.preventDefault();
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;

    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePanEnd = () => {
    setIsPanning(false);
    panStart.current = null;
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

    const hotspot = `${size / 2} ${size / 2}`; // <-- center the hotspot

    return `url(${cursorUrl}) ${hotspot}, auto`;
  };


  const {
    undo,
    redo,
    clearCanvas,
    saveSnapshot,
    redrawCanvas,
    isDrawing,
    setIsDrawing,
    startPos,
    setStartPos,
  } = useCanvas(canvasRef, previewCanvasRef);

  // Canvas setup
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

    saveSnapshot(scale, offset);
    
    const saved = localStorage.getItem('savedBoards');
    const boards = saved ? JSON.parse(saved) : {};
    if (boards[boardId]) {
      loadBoard();
    }
  }, [window.innerWidth, window.innerHeight]);


  useEffect(() => {
    redrawCanvas(scale, offset);
  }, [scale, offset]);


  const [fontSize, setFontSize] = useState(16); // optional UI later


  // Drawing events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {

    if (e.button !== 0) return;
    
    const { offsetX, offsetY } = getCanvasCoords(e);
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    if (tool === 'pen' || tool === 'eraser' || tool === 'text') {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      context.lineWidth = tool === 'pen' ? brushSize : eraserSize;
      context.strokeStyle = color;
      context.globalCompositeOperation = tool === 'pen' || tool ===  'text'? 'source-over' : 'destination-out';
      setIsDrawing(true);
    } else if (shape !== '') {
      context.globalCompositeOperation = 'source-over';
      setStartPos({ x: offsetX, y: offsetY });
      setIsDrawing(true);
    }
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // hide after 3s
  };


  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = getCanvasCoords(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const snapAngle = (angle: number): number => {
    const angles = [0, 45, 90, 135, 180, -45, -90, -135, -180];
    return angles.reduce((prev, curr) =>
      Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
    );
  };

  const getSnappedEndpoint = (
    x: number,
    y: number,
    length: number,
    angleDeg: number
  ): [number, number] => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(angleRad) * length;
    const dy = Math.sin(angleRad) * length;
    return [x + dx, y + dy];
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
      if (!preview || !ctx) return;

      const { offsetX, offsetY } = getCanvasCoords(e);
      const shiftKey = e.nativeEvent;
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

      ctx.clearRect(0, 0, preview.width, preview.height);
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


  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { offsetX, offsetY, shiftKey } = e.nativeEvent;

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


    const saveBoard = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');

      const saved = localStorage.getItem('savedBoards');
      const boardsInStorage: Record<string, { name: string; data: string }> = saved ? JSON.parse(saved) : {};

      // Find if another board has the same name (not including current board)
      const nameExistsElsewhere = Object.entries(boardsInStorage).find(
        ([id, { name }]) => name === fileName && id !== boardId
      );

      let uniqueName = fileName;

      if (nameExistsElsewhere) {
        // If a board with same name exists, generate a new unique name
        uniqueName = getUniqueBoardName(fileName);
        setFileName(uniqueName);
      }

      const updatedBoards = {
        ...boardsInStorage,
        [boardId]: {
          name: uniqueName,
          data: dataUrl,
        },
      };

      localStorage.setItem('savedBoards', JSON.stringify(updatedBoards));
      updateBoards(updatedBoards);

      triggerToast(`Board "${uniqueName}" saved`);
    };




  const loadBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const boardData = boards[boardId]?.data;
    if (!boardData) {
      triggerToast(`No saved data for "${fileName}"`);
      return;
    }

    const img = new Image();
    img.src = boardData;

    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;

      // ✅ Clear canvas and reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ✅ Reapply scale for correct rendering (just once)
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);


      // ✅ Draw image at display size, not raw pixel size
      const displayWidth = canvas.width / dpr;
      const displayHeight = canvas.height / dpr;
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      saveSnapshot(scale, offset);
      triggerToast(`Loaded "${board.name}"`);
    };
  };



  

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo(scale, offset); // ✅ Ctrl + Shift + Z
        } else {
          undo(scale, offset); // ✅ Ctrl + Z
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo(scale, offset); // ✅ Ctrl + Y
      } else if (e.key.toLowerCase() === 's'){
        e.preventDefault();
        saveBoard();
      } else if (e.key.toLowerCase() === 'u'){
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
        clearCanvas();
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo, setTool, setShape, clearCanvas, saveBoard, loadBoard]);


  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
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
      

      // Draw typed text
      if (textValue) {
        ctx.fillText(textValue, x, y);
      }

      // Draw blinking cursor
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
        setTextValue((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        setTextValue((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, textValue, textPosition, color, fontSize]);

  return (
    <div className="flex flex-col items-center dark:bg-[#000]">
      <div className="absolute z-[999] top-12 w-full">
        <Taskbar
        handleBackButton={onExit}
        fileName={fileName}
        setFileName={setFileName}
        downloadBoard={downloadBoard}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        shape={shape}
        setShape={setShape}
        tool={tool}
        setTool={setTool}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
        saveBoard={saveBoard}
        loadBoard={loadBoard}
        gridCols={gridCols}
        setGridCols={setGridCols}
        fontSize={fontSize}
        setFontSize={setFontSize}
        isBold={isBold}
        setIsBold={setIsBold}
        isItalic={isItalic}
        setIsItalic={setIsItalic}
        scale={scale}
        offset={offset}
      />
      </div>
      <div className="min-h-screen flex items-center justify-center" 
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}  
      >
        <div className={`relative dark:bg-[radial-gradient(circle,_#111_1px,_#040404_1px)] bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] [background-size:20px_20px] border border-gray-300 rounded-3xl transition-all duration-300 dark:border-gray-700`}>
          <CanvasLayer
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onClick={handleCanvasClick}
            className=""
            style={{ cursor: getCursorURL({ item: tool || shape }) }}
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
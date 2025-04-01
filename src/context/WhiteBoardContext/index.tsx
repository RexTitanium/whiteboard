import React, { createContext, useContext, useState, useRef } from 'react';
import { Tool, Shapes } from '../../types/types';

interface TextPosition {
  x: number;
  y: number;
}

interface WhiteboardContextType {
    tool: Tool;
    setTool: React.Dispatch<React.SetStateAction<Tool>>;
    shape: Shapes | '';
    setShape: React.Dispatch<React.SetStateAction<Shapes | ''>>;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    brushSize: number;
    setBrushSize: React.Dispatch<React.SetStateAction<number>>;
    eraserSize: number;
    setEraserSize: React.Dispatch<React.SetStateAction<number>>;
    fontSize: number;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    showCursor: boolean;
    setShowCursor: React.Dispatch<React.SetStateAction<boolean>>;

    isBold: boolean;
    setIsBold: React.Dispatch<React.SetStateAction<boolean>>;
    isItalic: boolean;
    setIsItalic: React.Dispatch<React.SetStateAction<boolean>>;
    isTyping: boolean;
    setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
    textValue: string;
    setTextValue: React.Dispatch<React.SetStateAction<string>>;
    textPosition: TextPosition | null;
    setTextPosition: React.Dispatch<React.SetStateAction<TextPosition | null>>;
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    offset: { x: number; y: number };
    setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
    gridCols: number;
    setGridCols: React.Dispatch<React.SetStateAction<number>>;
    isDrawing: boolean;
    setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
    startPos: TextPosition | null;
    setStartPos: React.Dispatch<React.SetStateAction<TextPosition | null>>;
    isPanning: boolean,
    setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
}

const WhiteboardContext = createContext<WhiteboardContextType | null>(null);

export const WhiteboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tool, setTool] = useState<Tool>('pen');
  const [shape, setShape] = useState<Shapes | ''>('');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [eraserSize, setEraserSize] = useState<number>(20);
  const [fontSize, setFontSize] = useState<number>(16);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [textValue, setTextValue] = useState('');
  const [textPosition, setTextPosition] = useState<TextPosition | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [gridCols, setGridCols] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<TextPosition | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  return (
    <WhiteboardContext.Provider value={{
      tool, setTool,
      shape, setShape,
      color, setColor,
      brushSize, setBrushSize,
      eraserSize, setEraserSize,
      fontSize, setFontSize,
      showCursor,setShowCursor,
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
      isPanning, setIsPanning
    }}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
};
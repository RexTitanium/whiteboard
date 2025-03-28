import { Dispatch, SetStateAction } from "react";

export type Tool = 'pen' | 'eraser' | 'text' | '' ;
export type Shapes = 'rectangle' | 'circle' | 'line' | 'grid';

export interface ToolbarProps {
    color: string,
    setColor: Dispatch<SetStateAction<string>>, 
    brushSize: number,
    setBrushSize: Dispatch<SetStateAction<number>>,
    eraserSize: number,
    setEraserSize: Dispatch<SetStateAction<number>>,
    shape: string,
    setShape: Dispatch<SetStateAction<"" | Shapes>>,
    tool: string,
    setTool: Dispatch<SetStateAction<Tool>>,
    clearCanvas:()  => void,
    undo: (scale: number, offset: { x: number; y: number }) => void,
    redo: (scale: number, offset: { x: number; y: number }) => void,
    saveBoard: (scale: number, offset: { x: number; y: number }) => void,
    loadBoard: () => void,
    gridCols: number;
    setGridCols: (val: number) => void;
    fontSize: number,
    setFontSize: Dispatch<SetStateAction<number>>,
    isBold: boolean,
    setIsBold: Dispatch<SetStateAction<boolean>>,
    isItalic: boolean,
    setIsItalic: Dispatch<SetStateAction<boolean>>,
    scale: number,
    offset: { x: number; y: number },
}

export type BoardRecord = {
    id?: string,
    name?: string,
    data?: string,
}
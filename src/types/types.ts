import { Dispatch, SetStateAction } from "react";

export type Tool = 'pen' | 'eraser' | 'text' | '';
export type Shapes = 'rectangle' | 'circle' | 'line' | 'grid';

export type SharedUser = {
  userId: string;
  email: string;
  permission: 'view' | 'edit';
};

export type Board = {
  _id: string;
  name: string;
  data: string;
  userId: string;
  sharedWith?: SharedUser[];
  shared?: boolean;
  updatedAt?: string;
};

export interface ToolbarProps {
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  brushSize: number;
  setBrushSize: Dispatch<SetStateAction<number>>;
  eraserSize: number;
  setEraserSize: Dispatch<SetStateAction<number>>;
  shape: string;
  setShape: Dispatch<SetStateAction<'' | Shapes>>;
  tool: string;
  setTool: Dispatch<SetStateAction<Tool>>;
  clearCanvas: (scale: number, offset: { x: number; y: number }) => void;
  undo: (scale: number, offset: { x: number; y: number }) => void;
  redo: (scale: number, offset: { x: number; y: number }) => void;
  saveBoard: () => Promise<number | undefined>;
  loadBoard: () => void;
  gridCols: number;
  setGridCols: (val: number) => void;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
  isBold: boolean;
  setIsBold: Dispatch<SetStateAction<boolean>>;
  isItalic: boolean;
  setIsItalic: Dispatch<SetStateAction<boolean>>;
  scale: number;
  offset: { x: number; y: number };
}

export interface TaskbarProps extends ToolbarProps {
  handleBackButton: () => void;
  fileName: string;
  setFileName: (name: string) => void;
  downloadBoard: () => void;
  boardId: string;
  sharedWith?: string[];
  onShare?: (email: string, permission: 'view' | 'edit') => void;
  permission?: 'view' | 'edit';
  sharedUsers: SharedUser[];
  setSharedUsers: Dispatch<SetStateAction<SharedUser[]>>;
  handlePermissionChange: (email: string, newPermission: 'view' | 'edit') => void;
}

export type BoardRecord = {
  id?: string;
  name?: string;
  data?: string;
};

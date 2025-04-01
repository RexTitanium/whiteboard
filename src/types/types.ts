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
  clearCanvas: (scale: number, offset: { x: number; y: number }) => void;
  undo: (scale: number, offset: { x: number; y: number }) => void;
  redo: (scale: number, offset: { x: number; y: number }) => void;
  saveBoard: () => Promise<number | undefined>;
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

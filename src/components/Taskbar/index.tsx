import React from 'react'
import { ToolbarProps } from '../../types/types'
import Toolbar from '../Toolbar'
import { Download, MoveLeft } from 'lucide-react';
import ToolButton from '../Toolbar/ToolButton';

interface TaskbarProps extends ToolbarProps {
    handleBackButton: () => void;
    fileName: string;
    setFileName: (name: string) => void;
    downloadBoard: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
    handleBackButton,
    fileName,
    setFileName,
    downloadBoard,
    color,
    setColor,
    brushSize,
    setBrushSize,
    eraserSize,
    setEraserSize,
    shape,
    setShape,
    tool,
    setTool,
    clearCanvas,
    undo,
    redo,
    saveBoard,
    loadBoard,
    gridCols,
    setGridCols,
    fontSize,
    setFontSize,
    isBold,
    setIsBold,
    isItalic,
    setIsItalic
}) => {
  return (
    <div className='w-full px-10 flex justify-between'>
        {/* Left: File name input */}

        <div className="flex gap-2">
            <div className="flex items-center gap-2 z-[999] p-2 bg-white rounded-xl shadow-sm border border-gray-200 h-10">
                <ToolButton icon={<MoveLeft size={20} strokeWidth={1.5}/>} title='Back' onClick={handleBackButton}/>
            </div>
            <div className="flex items-center gap-2 z-[999] p-2 bg-white rounded-xl shadow-sm border border-gray-200 h-10">
                <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    placeholder="Unnamed"
                    className="px-2 py-1 text-sm border-gray-800 focus:outline-none focus:border-b-2"
                    />
            </div>
        </div>
        <Toolbar
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
        />

        {/* Right: Download button */}
        <div className="flex items-center gap-2 z-[999] h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-100">
        <button
            onClick={downloadBoard}
        >
            <Download size={20} strokeWidth={1.5} />
        </button>
        </div>
    </div>
  )
}

export default Taskbar
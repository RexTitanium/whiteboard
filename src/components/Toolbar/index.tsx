import React, { useState } from 'react';
import {
  Pencil,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash,
  Save,
  Upload,
  ChevronDown,
  Circle,
  Square,
  Spline,
  Columns3,
  Type,
  Moon,
  Sun,
} from 'lucide-react';

import { Tool, Shapes, ToolbarProps } from '../../types/types';
import ToolButton from './ToolButton';
import ToolDropdown from './ToolDropDown';
import Toast from '../Toast';

const Toolbar: React.FC<ToolbarProps> = ({
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
  undo,
  redo,
  clearCanvas,
  saveBoard,
  loadBoard,
  gridCols,
  setGridCols,
  fontSize,
  setFontSize,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  scale,
  offset,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<Tool | ''>('');
  const [showShapeDropdown, setShowShapeDropdown] = useState(false);
  const [showGridDropdown, setShowGridDropdown] = useState(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(document.documentElement.classList.contains('dark'));


  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((prev) => !prev)
  }
  const handleToolChange = (newTool: Tool) => {
    setTool(newTool);
    setShape('');
  };

  const toggleDropdown = (toolName: Tool) => {
    handleToolChange(toolName);
    setActiveDropdown(activeDropdown === toolName ? '' : toolName);
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    const status = await saveBoard();
    if (status === 200) {
      triggerToast('Board Saved');
    } else {
      triggerToast('Save failed');
    }
  };


  const shapeOptions: { key: Shapes; label: string; icon: any }[] = [
    { key: 'rectangle', label: 'Rectangle', icon: <Square size={20} strokeWidth={1.5} /> },
    { key: 'circle', label: 'Circle', icon: <Circle size={20} strokeWidth={1.5} /> },
    { key: 'line', label: 'Line', icon: <Spline size={20} strokeWidth={1.5} /> },
    { key: 'grid', label: 'Grid', icon: <Columns3 size={20} strokeWidth={1.5} />
}
  ];

  return (
    <div className='flex flex-row gap-2 '>
    <div className="flex flex-wrap px-2 transition-all duration-300ms ease items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md">
      {/* Color Picker */}
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-6 h-6 p-0 border-none cursor-pointer rounded transition delay-150 ease-in"
        title="Color"
      />

      {/* Pen Tool */}
      <div className="relative flex items-center gap-1">
        <ToolButton
          icon={<Pencil size={20} />}
          onClick={() => handleToolChange('pen')}
          active={tool === 'pen'}
          title="Pen"
        />
        <ToolButton icon={<ChevronDown size={12} />} onClick={() => toggleDropdown('pen')} title="Brush Size" />

        <ToolDropdown label="Brush Size" show={activeDropdown === 'pen'} onClose={() => setActiveDropdown('')}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={50}
              step={0.5}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-stone-900 dark:accent-[#606060]"
            />
          </div>
        </ToolDropdown>
      </div>

      {/* Eraser Tool */}
      <div className="relative flex items-center gap-1">
        <ToolButton
          icon={<Eraser size={20} />}
          onClick={() => handleToolChange('eraser')}
          active={tool === 'eraser'}
          title="Eraser"
        />
        <ToolButton icon={<ChevronDown size={12} />} onClick={() => toggleDropdown('eraser')} title="Eraser Size" />

        <ToolDropdown label="Eraser Size" show={activeDropdown === 'eraser'} onClose={() => setActiveDropdown('')}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
              className="w-full accent-stone-900 dark:accent-[#606060]"
            />
          </div>
        </ToolDropdown>
      </div>

      {/* Text Tool */}
      <div className="relative flex items-center gap-1">
        <ToolButton
          icon={<Type size={20} />} 
          onClick={() => handleToolChange('text')}
          active={tool === 'text'}
          title="Text Tool"
        />
        <ToolButton icon={<ChevronDown size={12} />} onClick={() => toggleDropdown('text')} title="Eraser Size" />

        <ToolDropdown
          label="Text Style"
          show={activeDropdown === 'text'}
          onClose={() => setActiveDropdown('')}
          showDoneButton={false}
        >
          <div className="flex flex-row justify-between gap-3 text-sm">
            {/* Font Size */}
            <div className="flex items-center gap-2 text-black dark:text-[#606060]">
              <label htmlFor="fontsize">Size:</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                className="w-16 px-2 py-1 focus:outline-none border rounded text-black text-right dark:bg-stone-900 dark:border-stone-800 dark:text-[#606060] dark:focus:text-white"
              />
            </div>

            {/* Formatting Buttons */}
            <div className="flex gap-2 items-center justify-start">
              <button
                onClick={() => setIsBold(!isBold)}
                className={`px-2 py-1 border rounded-md font-bold  ${isBold ? 'bg-stone-800 text-white' : 'bg-white text-black'} dark:border-[#606060] dark:bg-stone-800 dark:text-white dark:${isBold ? 'bg-stone-800 text-white' : 'bg-stone-900'}`}
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                className={`px-[9.5px] py-1 border rounded-md italic ${isItalic ? 'bg-stone-800 text-white' : 'bg-white text-black'} dark:border-[#606060] dark:bg-stone-800 dark:text-white dark:${isItalic ? 'bg-stone-800 text-white' : 'bg-stone-900'}`}
                title="Italic"
              >
                I
              </button>
            </div>
          </div>
        </ToolDropdown>

      </div>


      {/* Shape Dropdown */}
       <div className="relative flex items-center gap-1">
      <div className="w-7 h-7 relative rounded-lg flex items-center justify-center">
        <ToolButton
          icon={shapeOptions.find((s) => s.key === shape)?.icon || <Square size={20} />}
          onClick={() => {
            setShowShapeDropdown((prev) => !prev);
            setTool('');
          }}
          active={!tool && !!shape}
          title="Shapes"
        />
        <ToolDropdown label="Shape Tool" show={showShapeDropdown} onClose={() => setShowShapeDropdown(false)} showDoneButton={false}>
          {shapeOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => {
                setShape(key);
                setShowShapeDropdown(false);
                setTool('');
              }}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 rounded ${
                shape === key ? 'bg-gray-100 font-medium' : ''
              }
              text-black
              dark:hover:bg-stone-800 dark:bg-stone-900 dark:text-white dark:hover:text-[#b1b1b1] dark:font-medium
              `}
            >
              {icon} {label}
            </button>
          ))}
        </ToolDropdown>
      </div>

      {/* Grid Dropdown */}
       {shape === 'grid' && (
          <div>
          <ToolButton icon={<ChevronDown size={12} />} onClick={() => setShowGridDropdown(true)} title="Array Size" />
            <ToolDropdown
              label="Number of Boxes"
              show={showGridDropdown}
              onClose={() => setShowGridDropdown(false)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={gridCols}
                  onChange={(e) => setGridCols(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-sm text-gray-500 w-10 text-right">{gridCols}</span>
              </div>
            </ToolDropdown>
          </div>
        )}
      </div>
      {/* Canvas Actions */}
       <div className="relative flex items-center gap-1">
      <ToolButton icon={<RotateCcw size={20} />} onClick={() => undo(scale, offset)} title="Undo" />
      <ToolButton icon={<RotateCw size={20} />} onClick={() => redo(scale, offset)} title="Redo" />
      <ToolButton icon={<Trash size={20} />} onClick={() => clearCanvas(scale, offset)} title="Clear" />
      </div>
    </div>
    <div className="relative px-2  transition-all duration-300ms ease flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md">
      <div className="relative flex items-center gap-1">
        <ToolButton icon={<Save size={20} />} onClick={() => handleSave()} title="Save" />
      </div>
      <div className="relative flex items-center gap-1">
        <ToolButton icon={isDark ? <Sun size={20}/> : <Moon size={20} />} onClick={toggleTheme} title="Load" />
      </div>
    </div>
    <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default Toolbar;

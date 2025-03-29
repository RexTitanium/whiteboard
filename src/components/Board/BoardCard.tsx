import React from 'react';
import { Trash } from 'lucide-react';

interface BoardCardProps {
  id: string;
  name: string;
  data: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ id, name, data, onSelect, onDelete }) => (
  <div className="w-72 bg-white dark:bg-stone-900 border dark:border-stone-700 rounded-lg shadow hover:shadow-md transition">
    <div
      className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-lg bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#222_1px,_transparent_1px)] [background-size:20px_20px]"
      onClick={() => onSelect(id)}
    >
      <img src={data} alt={name} className="w-full h-full object-contain" />
    </div>
    <div className="p-2 flex justify-between items-center text-xs text-black dark:text-white">
      <span className="truncate max-w-[70%] font-medium">{name}</span>
      <button onClick={() => onDelete(id)} className="text-red-500 hover:text-red-700">
        <Trash size={14} />
      </button>
    </div>
  </div>
);

export default BoardCard;
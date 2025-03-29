import React from 'react';
import { Plus } from 'lucide-react';

const NewBoardCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex justify-center">
    <div
      onClick={onClick}
      className="w-72 aspect-square bg-gray-100 hover:bg-gray-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-dashed border-2 border-gray-400 dark:border-stone-600 rounded-lg flex items-center justify-center cursor-pointer transition"
    >
      <Plus size={32} className="text-gray-500 dark:text-white" />
    </div>
  </div>
);

export default NewBoardCard;
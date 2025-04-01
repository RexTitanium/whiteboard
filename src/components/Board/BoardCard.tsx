import React, { useState } from 'react';
import { Trash } from 'lucide-react';

interface BoardCardProps {
  id: string;
  name: string;
  data: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ id, name, data, onSelect, onDelete }) => {
  
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<boolean>(false)
  return(
  <div className="w-72 bg-white dark:bg-stone-900 border dark:border-stone-700 rounded-lg shadow hover:shadow-md transition">
    <div
      className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-lg bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#222_1px,_transparent_1px)] [background-size:20px_20px]"
      onClick={() => onSelect(id)}
    >
      <img src={`${data}?v=${Date.now()}`} alt={name} className="w-full h-full object-contain" />
    </div>
    <div className="p-2 flex justify-between items-center text-xs text-black dark:text-white">
      <span className="truncate max-w-[70%] font-medium">{name}</span>
      <button onClick={() => setShowConfirmDeleteModal(true)} className="text-red-500 hover:text-red-700">
        <Trash size={14} />
      </button>
    </div>
    {showConfirmDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="flex flex-row gap-10 h-[16vh] w-[14vw] justify-center items-center bg-white rounded-3xl shadow-lg dark:bg-black">
            <div className='relative p-4 w-full h-full flex justify-center items-center'>
              <div className='flex flex-col gap-5 dark:text-white'>
                <div className='flex flex-col gap-2 justify-center items-center'>Do you want to delete board?
                   <div>{name}</div></div>
                <div className='w-full flex flex-row gap-4 justify-center items-center'>
                  <button
                    onClick={() => setShowConfirmDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-2xl hover:bg-gray-400 dark:bg-[#111] dark:hover:bg-[#222] dark:text-white "
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      onDelete(id);
                      setShowConfirmDeleteModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )}
  </div>
  );
}

export default BoardCard;
import { Plus, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import ToolButton from "../../components/Toolbar/ToolButton";
import {v4 as uuidv4} from 'uuid';

interface HomeProps {
    onSelectBoard: (name: string) => void;
    boards: Record<string, { name: string; data: string }>;
    setBoards: React.Dispatch<React.SetStateAction<Record<string, { name: string; data: string }>>>;
    getUniqueBoardName: (base?: string) => string;
}

const Home: React.FC<HomeProps> = ({ onSelectBoard, boards, setBoards, getUniqueBoardName}) => {

  useEffect(() => {
    const saved = localStorage.getItem("savedBoards");
    if (saved) setBoards(JSON.parse(saved));
  }, []);

  

  const handleCreate = () => {
    const newId = uuidv4();
    const newBoardName = getUniqueBoardName();
    const newBoards = {
    ...boards,
    [newId]: { name: newBoardName, data: '' }
    };
    setBoards(newBoards);
    localStorage.setItem("savedBoards", JSON.stringify(newBoards));
    onSelectBoard(newId);
    };

  const handleDelete = (id: string) => {
    const updated = { ...boards };
    delete updated[id];
    setBoards(updated);
    localStorage.setItem("savedBoards", JSON.stringify(updated));
    };


  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">My Boards</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(boards).map(([id, { name, data }]) => (
                <div key={id} className="w-72 bg-white border rounded-lg shadow hover:shadow-md transition">
                    <div
                    className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-lg bg-[radial-gradient(circle,_#ccc_1px,_transparent_1px)] [background-size:20px_20px]"
                    onClick={() => onSelectBoard(id)}
                    >
                    <img src={data} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div className="p-2 flex justify-between items-center text-xs">
                    <span className="truncate max-w-[70%] font-medium">{name}</span>
                    <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700">
                        <Trash size={14} />
                    </button>
                    </div>
                </div>
                ))}


            {/* Add New Board Card — Always Visible */}
            <div className="w-full flex justify-center">
                <div
                    onClick={handleCreate}
                    className="w-72 aspect-square bg-gray-100 hover:bg-gray-200 border-dashed border-2 border-gray-400 rounded-lg flex items-center justify-center cursor-pointer transition"
                >
                    <Plus size={32} className="text-gray-500" />
                </div>
            </div>
        </div>
        </div>

  );
};

export default Home;

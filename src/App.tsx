import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Whiteboard from './components/Whiteboard';
import Home from './pages/Home';

function App() {
    const [activeBoard, setActiveBoard] = useState<string | null>(null);
    const [boards, setBoards] = useState<Record<string, string>>({});
   
    const getUniqueBoardName = (base: string = 'Untitled') => {
      let name = base;
      let count = 1;
      const keys = Object.keys(boards);
      while (keys.includes(name)) {
        name = `${base} (${count++})`;
      }
      return name;
    };
  return (
    <div className="min-h-screen bg-gray-50">
      {activeBoard ? (
        <Whiteboard boardName={activeBoard} onExit={() => setActiveBoard(null)} getUniqueBoardName={getUniqueBoardName}/>
      ) : (
        <Home onSelectBoard={(name) => setActiveBoard(name)} boards={boards} setBoards={setBoards} getUniqueBoardName={getUniqueBoardName}/>
      )}
    </div>
  );
}

export default App;

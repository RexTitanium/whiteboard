import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Whiteboard from './components/Whiteboard';
import Home from './pages/Home';

function App() {
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
    const [boards, setBoards] = useState<Record<string, { name: string; data: string }>>({});
   
    const getUniqueBoardName = (base: string = 'Untitled') => {
      let name = base;
      let count = 1;

      const existingNames = Object.values(boards).map(b => b.name);
      while (existingNames.includes(name)) {
        name = `${base} (${count++})`;
      }

      return name;
    };


  return (
    <div className="min-h-screen bg-gray-50">
      {activeBoardId  ? (
        <Whiteboard boardId={activeBoardId} board={boards[activeBoardId]} boards={boards} onExit={() => setActiveBoardId(null)} getUniqueBoardName={getUniqueBoardName} updateBoards={setBoards}/>
      ) : (
        <Home onSelectBoard={(id) => setActiveBoardId(id)} boards={boards} setBoards={setBoards} getUniqueBoardName={getUniqueBoardName}/>
      )}
    </div>
  );
}

export default App;

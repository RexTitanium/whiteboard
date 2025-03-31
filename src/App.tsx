import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Whiteboard from './components/Whiteboard';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './api/api';
import Loader from './components/Loader';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [boards, setBoards] = useState<Record<string, { name: string; data: string }>>({});

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={
                <Home/>
              }
            />
            <Route
              path="/board/:boardId"
              element={
                <PrivateRoute>
                  <WhiteboardWrapper />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const WhiteboardWrapper: React.FC = () => {
  const { boardId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState<{ name: string; data: string } | null>(null);
  const [allBoards, setAllBoards] = useState<Record<string, { name: string; data: string }>>({});
  const [permission, setPermission] = useState<'view' | 'edit'>('edit');
  const [sharedWith, setSharedWith] = useState<{ userId: string; email: string; permission: 'view' | 'edit' }[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchBoard = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        const boardData = res.data;
        setSharedWith(boardData.sharedWith);
        setBoard({ name: boardData.name, data: boardData.data });
        setAllBoards((prev) => ({
          ...prev,
          [id]: { name: boardData.name, data: boardData.data },
        }));

        if (boardData.userId === user?._id) {
          setPermission('edit');
        } else {
          const sharedEntry = boardData.sharedWith?.find(
            (entry: any) => entry.userId === user?._id
          );
          setPermission(sharedEntry?.permission || 'view');
        }
      } catch (err) {
        console.error('Board fetch error:', err);
        navigate('/');
      }
    };

    fetchBoard();
  }, [id, user, navigate]);

  if (!id || !board) return <div className="p-6 text-center"><Loader /></div>;

  return (
    <Whiteboard
      boardId={id}
      board={board}
      boards={allBoards}
      updateBoards={setAllBoards}
      getUniqueBoardName={(base = 'Untitled') => {
        const existingNames = Object.values(allBoards).map((b) => b.name);
        let name = base;
        let count = 1;
        while (existingNames.includes(name)) {
          name = `${base} (${count++})`;
        }
        return name;
      }}
      onExit={() => navigate('/')}
      permission={permission}
      sharedWith={sharedWith}
    />
  );
};

export default App;
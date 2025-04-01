import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import Whiteboard from './components/Whiteboard';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import api from './api/api';
import Loader from './components/Loader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BoardProvider, useBoard } from './context/BoardContext';
import { WhiteboardProvider } from './context/WhiteBoardContext';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <BoardProvider>
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
        </BoardProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const WhiteboardWrapper: React.FC = () => {
  const { boardId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    board, fetchBoardById} = useBoard();

  useEffect(() => {
      if (!id || !user) return;
      fetchBoardById(id, user._id, navigate);
  }, [id, user, navigate]);

  if (!id || !board) return <div className="p-6 text-center"><Loader /></div>;

  return (
    <WhiteboardProvider>
      <Whiteboard boardId={id} onExit={() => navigate('/')}/>
    </WhiteboardProvider>
  );
};

export default App;
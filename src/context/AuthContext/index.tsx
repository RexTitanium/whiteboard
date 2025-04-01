import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/api';
import { Board } from '../../types/types';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (onLoggedOut?: () => void) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credentials: string) => Promise<void>;
  board: Board | null;
  setBoard: React.Dispatch<React.SetStateAction<Board | null>>,
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [board, setBoard] = useState<Board | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setLoading(false);
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    
    try {
      setLoading(true);
      await api.post('/auth/login', { email, password });
      await fetchUser();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      setLoading(true);
      await api.post('/auth/google-login', { credential });
      await fetchUser();
    } catch (err) {
      console.error('Google login error:', err);
      alert('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      await login(email, password);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (callback?: () => void) => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      if (callback) callback();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, googleLogin, board, setBoard }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
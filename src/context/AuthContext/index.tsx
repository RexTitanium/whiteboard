import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../api/api';

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
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); 

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false); 
    }
  };

    useEffect(() => {
      fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
      setLoading(true)
      const res = await api.post('/auth/login', { email, password });
      const token = res?.data?.token;

      console.log(token)
      if (token) {
        localStorage.setItem('token', token);
        window.location.reload();
      } else {
        console.error('Login succeeded but token missing from response');
      }
      setLoading(false)
      await fetchUser();
      };

    const register = async (name: string, email: string, password: string) => {
      await api.post('/auth/register', { name, email, password });
      await login(email, password);
    };

    const logout = async (callback?: () => void) => {
      try {
        await api.post('/auth/logout');
        localStorage.removeItem('token')
        setUser(null);
        if (callback) callback();
      } catch (err) {
        console.error('Logout error', err);
      }
    };




  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LoginProps {
  onClose: () => void;
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess();
      onClose();
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="p-6 max-w-sm w-full relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
      >
        &times;
      </button>
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onClose: () => void;
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      onClose();
      onSuccess();
    } catch {
      alert('Registration failed');
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
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" required />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default Register;

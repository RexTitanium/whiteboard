import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, XIcon } from 'lucide-react';
import ToolButton from '../../components/Toolbar/ToolButton';
import { GoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from './GoogleLoginButton';
import Loader from '../../components/Loader';

interface RegisterProps {
  changePage: () => void,
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ changePage, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cnfPassword, setCnfPassword] = useState('');
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [err, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== cnfPassword) {
      setError('The passwords do not match')
    }
    else {
      try {
        await register(name, email, password);
        onSuccess();
      } catch {
        alert('Registration failed');
      }
    }
  };

  return (
    <div className="p-6 max-w-sm w-full relative">
      <div >
      <div className='mb-4'>
        <div className="text-xl font-semibold dark:text-[#aaa]">
          Register
        </div>
        <p className='text-sm flex flex-row gap-1 text-[#aaa] dark:text-[#333]'>Have an account, <div className='cursor-pointer underline hover:text-[#db7b00] hover:transition-[all 300ms ease]' onClick={changePage}>Sign In?</div></p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="truncate bg-[#eee] border-2 text-sm border-[#eee] px-2 py-2 rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="truncate bg-[#eee] border-2 text-sm border-[#eee] px-2 py-2 rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" required />
        <div className='relative'>
          <input type={showPassword ? 'text' : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="truncate bg-[#eee] w-full border-2 text-sm border-[#eee] px-2 py-2 rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" required />
          <div onClick={() => setShowPassword((prev) => !prev)} className='absolute top-[1vh] right-2 w-5 h-5 cursor-pointer transition duration-300 ease-in-out inline-block align-middle dark:text-[#aaa]'>
            <Eye size={20} strokeWidth={1.5}/>
            <span className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <span
                className={`block h-[1px] w-[140%] bg-black rotate-45 origin-top transition-transform duration-300 ease-in-out 
                  ${showPassword ? "scale-x-0" : "scale-x-100"}
                  dark:bg-[#aaa]
                `}
              />
            </span>
          </div>
        </div>
        <div>
          <input type="password" value={cnfPassword} onChange={(e) => setCnfPassword(e.target.value)} placeholder="Re-enter Password" className="truncate bg-[#eee] w-full border-2 text-sm border-[#eee] px-2 py-2 rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" required />
          <div className='ml-2 mt-1 text-xs text-red-500'>{err}</div>
        </div>
        <div className='w-full flex justify-end gap-2'>
         <GoogleLoginButton onSuccess={onSuccess}/>
          <button type="submit" className="bg-[#db5700] text-white rounded-xl w-20 py-1 hover:bg-[#c14d00] transition-all duration-150 ease-in hover:transition-[all 150ms ease-out]">{loading ? <Loader color='border-black' width={5} height={5} borderSize={2}/>:'Sign Up'}</button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default Register;

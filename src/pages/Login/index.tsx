import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, XIcon } from 'lucide-react';
import Loader from '../../components/Loader';
import ToolButton from '../../components/Toolbar/ToolButton';
import GoogleLoginButton from '../Register/GoogleLoginButton';

interface LoginProps {
  changePage: () => void;
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ changePage, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      onSuccess();
    } catch {
      alert('Login failed');
    }
  };

  return (

    <div className="pl-10 pr-6 py-6 max-w-sm w-full relative">
    <div >
      <div>
        <div className="text-xl font-semibold dark:text-[#aaa]">
          Login
        </div>
        <p className='text-sm flex flex-row gap-1 text-[#aaa] dark:text-[#333]'>Don't have an account, <div className='cursor-pointer underline hover:text-[#db7b00] hover:transition-[all 300ms ease]' onClick={changePage}>Sign Up?</div></p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" 
        className="truncate bg-[#eee] border-2 text-sm border-[#eee] px-2 py-2 rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" required />
        <div className='relative'>
          <input 
            type={showPassword ? 'text' : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            className="truncate bg-[#eee] text-sm border-2 border-[#eee] px-2 py-2 w-full rounded-2xl focus:outline-none focus:bg-white dark:bg-[#111] dark:border-[#141414] dark:text-white dark:focus:bg-[#000]" 
            required 
          />
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
        <div className='w-full flex justify-end gap-2'>
          <GoogleLoginButton onSuccess={onSuccess} />
         <button type="submit" className="bg-[#db5700] text-white rounded-xl w-20 py-1 hover:bg-[#c14d00] transition-all duration-150 ease-in hover:transition-[all 150ms ease-out]">{!loading ? <Loader color='border-black' width={5} height={5} borderSize={2}/>:'Login'}</button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Login;

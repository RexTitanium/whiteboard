// components/Toast.tsx
import React from 'react';

interface ToastProps {
  message: string;
  show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show }) => {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-sm text-white bg-black rounded shadow-md transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;

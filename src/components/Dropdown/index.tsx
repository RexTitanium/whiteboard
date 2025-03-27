import React, { useEffect, useRef, ReactNode } from 'react';

interface DropdownProps {
  children: ReactNode;
  onClose: () => void;
  label?: string;
  showDoneButton?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ children, onClose, label, showDoneButton=true }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-2 p-4 bg-white border border-gray-300 rounded shadow w-64"
    >
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div>{children}</div>
      {showDoneButton &&
        <button
        onClick={onClose}
        className="mt-3 px-3 py-1 text-sm rounded bg-stone-900 text-white hover:bg-stone-800 transition-all ease-in-out"
      >
        Done
      </button>
      }
    </div>
  );
};

export default Dropdown;

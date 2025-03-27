// File: components/Modal/TextModal.tsx
import React, { useEffect, useRef, useState } from 'react';

interface TextModalProps {
  initialValue?: string;
  fontSize?: number;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const TextModal: React.FC<TextModalProps> = ({ initialValue = '', fontSize = 16, onSubmit, onClose }) => {
  const [text, setText] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text.trim());
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded shadow-md w-[300px] flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Add Text</h2>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your text"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontSize }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSubmit(text.trim())}
            className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextModal;

import React from 'react';

type ToolButtonProps = {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  title: string;
};

const ToolButton: React.FC<ToolButtonProps> = ({ onClick, active, icon, title }) => (
  <button
    onClick={onClick}
    className={`p-1 rounded-lg hover:bg-gray-100 ${active ? 'bg-gray-200' : ''} dark:hover:bg-stone-800 dark:text-[#eee] dark:${active ? 'bg-stone-800' : 'bg-stone-900'} dark:text-[#606060] dark:hover:text-[#b1b1b1]`}
    title={title}
  >
    {icon}
  </button>
);

export default ToolButton;
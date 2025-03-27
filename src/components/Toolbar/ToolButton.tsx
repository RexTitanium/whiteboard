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
    className={`p-1 rounded-lg hover:bg-gray-100 ${active ? 'bg-gray-200' : ''} `}
    title={title}
  >
    {icon}
  </button>
);

export default ToolButton;
import React from 'react';
import Dropdown from '../Dropdown';

type ToolDropdownProps = {
  label: string;
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showDoneButton?: boolean;
};

const ToolDropdown: React.FC<ToolDropdownProps> = ({ label, show, onClose, children, showDoneButton=true }) => {
  if (!show) return null;
  return (
    <div className="absolute top-full mt-2 left-0 dark:bg-stone-900 dark:border-stone-800 dark:shadow-md">
      <Dropdown label={label} onClose={onClose} showDoneButton={showDoneButton}>
        {children}
      </Dropdown>
    </div>
  );
};

export default ToolDropdown;
import React from 'react';

interface BoardTabsProps {
  activeTab: string;
  setActiveTab: (tab: 'recent' | 'shared' | 'all') => void;
}

const tabs: ('recent' | 'shared' | 'all')[] = ['recent', 'shared', 'all'];

const BoardTabs: React.FC<BoardTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-4 border-b border-gray-200 dark:border-stone-700 pb-2 mb-4 text-sm font-medium">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`capitalize px-3 py-1 border-b-2 transition-all duration-150 ${
            activeTab === tab
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          {tab} boards
        </button>
      ))}
    </div>
  );
};

export default BoardTabs;

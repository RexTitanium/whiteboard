import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="w-full max-w-md mt-2">
      <input
        type="text"
        placeholder="Search boards..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 dark:bg-stone-900 dark:border-stone-700 dark:text-white"
      />
    </div>
  );
};

export default SearchBar;


import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative max-w-lg mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Rechercher un verbe (français ou néerlandais)..."
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
      />
    </div>
  );
};

export default SearchBar;
import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search query and filter controls component.
 */
const SearchFilterBar = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search...',
  filters = [],
  onReset
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex flex-wrap gap-4 items-center w-full">
      {/* Search Input */}
      <div className="relative flex-grow max-w-xs">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-emerald-500 text-xs text-slate-200"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-550" />
      </div>

      {/* Dynamic Filters */}
      {filters.map((filter) => (
        <div key={filter.name} className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">{filter.label}:</span>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-350 font-medium"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* Reset button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 transition-colors ml-auto"
        >
          Reset Filters
        </button>
      )}
    </form>
  );
};

export default SearchFilterBar;

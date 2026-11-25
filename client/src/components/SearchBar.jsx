import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  initialValue = '',
  placeholder = 'Search recipes, ingredients, cuisines...',
  onSearch,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-forest-green/60">
          <Search className="w-5 h-5 text-terracotta" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3.5 bg-white rounded-full border border-forest-green/20 text-charcoal text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta shadow-soft transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
        >
          <span>Find</span>
        </button>
      </div>
    </form>
  );
}

import React, { useState, useMemo } from 'react';
import { Search, X, Tag as TagIcon, Plus, Filter } from 'lucide-react';
import { Tag } from '../types';
import { cn } from '../lib/utils';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  allTags: Tag[];
  onNewStory: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  allTags,
  onNewStory
}) => {
  const [tagSearch, setTagSearch] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return allTags.slice(0, 20); // Show first 20 by default
    return allTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase())).slice(0, 50);
  }, [allTags, tagSearch]);

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 rounded-xl transition-all outline-none text-gray-900 dark:text-gray-100 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
        <button
          onClick={onNewStory}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline font-semibold text-sm">New Story</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <Filter className="w-3 h-3" />
            <span>Filter by Tags</span>
          </div>
          <button 
            onClick={() => setShowTagSearch(!showTagSearch)}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase tracking-wider"
          >
            {showTagSearch ? 'Hide Search' : 'Search Tags'}
          </button>
        </div>

        {showTagSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-xs focus:border-blue-500"
            />
          </div>
        )}

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 lg:gap-1.5 items-center">
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "px-2 lg:px-2.5 py-1 rounded-lg text-[9px] lg:text-[10px] font-bold uppercase tracking-wider transition-all border",
                  selectedTags.includes(tag.id)
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {tag.name}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] font-bold text-red-500 hover:underline ml-1 uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

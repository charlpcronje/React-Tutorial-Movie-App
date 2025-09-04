/**
 * DocumentationSearch Component - Search Across All Documentation
 * 
 * Provides powerful search functionality across all documentation with
 * real-time results, filtering, and intelligent suggestions.
 */

import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';

/**
 * DocumentationSearch Component
 */
const DocumentationSearch = forwardRef(function DocumentationSearch({
  query,
  onSearch,
  results = [],
  onDocumentSelect
}, searchInputRef) {
  
  const [recentSearches, setRecentSearches] = useLocalStorage('docs_recent_searches', []);
  const [searchFocus, setSearchFocus] = useState(false);
  
  /**
   * SEARCH HANDLERS
   */
  const handleSearchChange = useCallback((event) => {
    const newQuery = event.target.value;
    onSearch(newQuery);
  }, [onSearch]);
  
  const handleSearchSubmit = useCallback((event) => {
    event.preventDefault();
    if (query.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)];
        return updated.slice(0, 10); // Keep only last 10
      });
    }
  }, [query, setRecentSearches]);
  
  const selectRecentSearch = useCallback((recentQuery) => {
    onSearch(recentQuery);
  }, [onSearch]);
  
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);
  
  return (
    <div className="p-4 space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🔍 Search Documentation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Find exactly what you need across all educational resources
        </p>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className={clsx(
              'w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'border-gray-300 dark:border-gray-600',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              searchFocus && 'ring-2 ring-blue-500 border-blue-500'
            )}
            placeholder="Search documentation, guides, tutorials..."
            autoComplete="off"
          />
          
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <span className="text-gray-400 dark:text-gray-500">🔍</span>
          </div>
          
          {query && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Press <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Enter</kbd> to search
          </span>
          {results.length > 0 && (
            <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </form>
      
      {/* Search Results */}
      {query && results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            Search Results
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => onDocumentSelect(result.category.id, result.id)}
                className={clsx(
                  'w-full text-left p-3 rounded-lg border transition-all duration-150',
                  'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                  'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-lg mt-0.5" role="img">
                    {result.category.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {result.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      in {result.category.title}
                    </p>
                    <div className="mt-2">
                      <span className={clsx(
                        'inline-block px-2 py-1 rounded-full text-xs',
                        result.category.bgColor,
                        result.category.textColor
                      )}>
                        {result.category.title}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* No Results */}
      {query && results.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤔</div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            No Results Found
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Try different keywords or browse categories below
          </p>
          <Button size="small" variant="secondary" onClick={() => onSearch('')}>
            Clear Search
          </Button>
        </div>
      )}
      
      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Recent Searches
            </h4>
            <Button 
              size="small" 
              variant="ghost" 
              onClick={clearRecentSearches}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((recentQuery, index) => (
              <button
                key={index}
                onClick={() => selectRecentSearch(recentQuery)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs transition-all duration-150',
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                  'hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                {recentQuery}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Tips */}
      {!query && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 text-sm">
            💡 Search Tips
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Search by topic: "hooks", "components", "state"</li>
            <li>• Find specific guides: "setup", "testing", "deployment"</li>
            <li>• Look for patterns: "tutorial", "example", "demo"</li>
            <li>• Use quotes for exact phrases: "custom hooks"</li>
          </ul>
        </div>
      )}
    </div>
  );
});

export default DocumentationSearch;
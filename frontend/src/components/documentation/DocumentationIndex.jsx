/**
 * DocumentationIndex Component - Category-Based Documentation Navigation
 * 
 * Displays the documentation index with beautiful category organization,
 * progress tracking, and quick access to all educational resources.
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';

/**
 * DocumentationIndex Component
 */
export default function DocumentationIndex({
  categories,
  selectedCategory,
  onCategorySelect,
  onDocumentSelect
}) {
  // Track reading progress
  const [readDocuments, setReadDocuments] = useLocalStorage('docs_read_progress', []);
  const [expandedCategories, setExpandedCategories] = useState(
    selectedCategory ? [selectedCategory] : ['tutorial'] // Start with tutorial expanded
  );
  
  /**
   * CATEGORY MANAGEMENT
   */
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    onCategorySelect(categoryId);
  }, [onCategorySelect]);
  
  const handleDocumentClick = useCallback((categoryId, docId) => {
    // Mark as read
    const docKey = `${categoryId}/${docId}`;
    if (!readDocuments.includes(docKey)) {
      setReadDocuments(prev => [...prev, docKey]);
    }
    
    onDocumentSelect(categoryId, docId);
  }, [readDocuments, setReadDocuments, onDocumentSelect]);
  
  /**
   * PROGRESS CALCULATIONS
   */
  const totalDocs = categories.reduce((sum, cat) => sum + cat.docs.length, 0);
  const readProgress = Math.round((readDocuments.length / totalDocs) * 100);
  
  return (
    <div className="p-4 space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {readDocuments.length}/{totalDocs} docs
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${readProgress}%` }}
          />
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-300">
          {readProgress}% complete • Keep learning to master React!
        </p>
      </div>
      
      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          size="small" 
          variant="secondary" 
          onClick={() => handleDocumentClick('tutorial', 'letter')}
          className="text-left justify-start"
        >
          💝 Start Here
        </Button>
        <Button 
          size="small" 
          variant="secondary" 
          onClick={() => handleDocumentClick('setup', 'setup')}
          className="text-left justify-start"
        >
          🚀 Quick Setup
        </Button>
      </div>
      
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📚 Documentation Categories
        </h3>
        
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const categoryReadDocs = readDocuments.filter(doc => doc.startsWith(`${category.id}/`)).length;
          const categoryProgress = category.docs.length > 0 ? Math.round((categoryReadDocs / category.docs.length) * 100) : 0;
          
          return (
            <div key={category.id} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={clsx(
                  'w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200',
                  'hover:shadow-md hover:scale-[1.02]',
                  category.bgColor,
                  isExpanded ? 'ring-2 ring-current' : '',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl" role="img" aria-label={category.title}>
                    {category.icon}
                  </span>
                  <div className="text-left">
                    <h4 className={clsx('font-medium', category.textColor)}>
                      {category.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {category.docs.length} documents • {categoryProgress}% read
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {categoryProgress > 0 && (
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                        {categoryProgress}%
                      </span>
                    </div>
                  )}
                  
                  <span className={clsx(
                    'text-lg transition-transform duration-200',
                    isExpanded ? 'rotate-180' : 'rotate-0',
                    category.textColor
                  )}>
                    ▼
                  </span>
                </div>
              </button>
              
              {/* Category Documents */}
              {isExpanded && (
                <div className="ml-4 space-y-1 animate-fade-in">
                  {category.docs.map((doc) => {
                    const docKey = `${category.id}/${doc.id}`;
                    const isRead = readDocuments.includes(docKey);
                    
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleDocumentClick(category.id, doc.id)}
                        className={clsx(
                          'w-full flex items-center justify-between p-2 rounded-md transition-all duration-150',
                          'hover:bg-gray-100 dark:hover:bg-gray-700',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500',
                          'text-left group'
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={clsx(
                            'w-2 h-2 rounded-full',
                            isRead ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          )} />
                          <span className={clsx(
                            'text-sm',
                            isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'
                          )}>
                            {doc.title}
                          </span>
                        </div>
                        
                        <span className="text-gray-400 dark:text-gray-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer Stats */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="font-bold text-blue-600 dark:text-blue-400">{categories.length}</div>
            <div className="text-gray-500 dark:text-gray-400">Categories</div>
          </div>
          <div>
            <div className="font-bold text-green-600 dark:text-green-400">{totalDocs}</div>
            <div className="text-gray-500 dark:text-gray-400">Documents</div>
          </div>
          <div>
            <div className="font-bold text-purple-600 dark:text-purple-400">{readProgress}%</div>
            <div className="text-gray-500 dark:text-gray-400">Complete</div>
          </div>
        </div>
      </div>
      
      {/* Quick Tips */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2 text-sm">
          💡 Quick Tips
        </h4>
        <ul className="text-xs text-yellow-800 dark:text-yellow-300 space-y-1">
          <li>• Use <kbd className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">Cmd+F</kbd> to search documentation</li>
          <li>• Click category headers to expand/collapse sections</li>
          <li>• Green dots indicate documents you've read</li>
          <li>• Press <kbd className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">Esc</kbd> to close this sidebar</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPLEX STATE MANAGEMENT: Multiple state values working together
 * 2. LOCAL STORAGE PERSISTENCE: Reading progress tracking
 * 3. KEYBOARD NAVIGATION: Accessibility and power user features
 * 4. RESPONSIVE DESIGN: Adapts to different screen sizes
 * 5. CONDITIONAL RENDERING: Dynamic content based on state
 * 6. COMPONENT COMPOSITION: Building complex UIs from simple parts
 * 7. ACCESSIBILITY: Proper ARIA labels and keyboard support
 * 8. ANIMATION: Smooth transitions and visual feedback
 */
/**
 * DocumentationSidebar Component - Interactive Documentation System
 * 
 * A comprehensive sidebar that provides instant access to all educational
 * documentation from within the application. Features category-based
 * organization, search functionality, and beautiful markdown rendering.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import DocumentationViewer from './DocumentationViewer.jsx';
import { useReadingProgress } from '../../hooks/useReadingProgress.js';

/**
 * DOCUMENTATION CATEGORIES CONFIGURATION
 * 
 * Organized by learning progression with distinct visual identity
 */
const DOCUMENTATION_CATEGORIES = [
  {
    id: 'tutorial',
    title: 'Tutorial & Learning',
    icon: '🎓',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-700',
    docs: [
      { id: 'letter', title: '💝 A Letter to Developers', file: 'a-letter-to-developers.md' },
      { id: 'summary', title: '🎓 Educational Summary', file: 'final-educational-summary.md' },
      { id: 'implementation', title: '📋 Complete Implementation', file: 'complete-implementation-guide.md' },
      { id: 'narration', title: '🎙️ Tutorial Narration', file: 'tutorial-narration.md' },
      { id: 'tasks', title: '📝 Task Breakdown', file: 'tasks.md' }
    ]
  },
  {
    id: 'setup',
    title: 'Project Setup',
    icon: '🏗️',
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-700',
    docs: [
      { id: 'setup', title: '🚀 Project Setup Guide', file: 'setup.md' },
      { id: 'package', title: '📦 Package.json Breakdown', file: 'package-json.md' },
      { id: 'vite', title: '⚡ Vite Configuration', file: 'vite-config.md' },
      { id: 'structure', title: '📁 Project Structure', file: 'project-structure.md' }
    ]
  },
  {
    id: 'react',
    title: 'React Concepts',
    icon: '⚛️',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-700',
    docs: [
      { id: 'first-component', title: '🧩 First Component Tutorial', file: 'first-component-tutorial.md' },
      { id: 'components', title: '📦 Components Overview', file: 'components.md' },
      { id: 'props-state', title: '🔄 Props & State', file: 'props-and-state.md' },
      { id: 'hooks', title: '🪝 Hooks Deep Dive', file: 'hooks.md' },
      { id: 'events', title: '🎯 Event Handling', file: 'event-handling.md' },
      { id: 'conditional', title: '🔀 Conditional Rendering', file: 'conditional-rendering.md' },
      { id: 'lists', title: '📋 Lists & Keys', file: 'lists-and-keys.md' },
      { id: 'lifecycle', title: '♻️ Component Lifecycle', file: 'lifecycle.md' },
      { id: 'context', title: '🌐 Context API', file: 'context.md' },
      { id: 'error-boundaries', title: '🛡️ Error Boundaries', file: 'error-boundaries.md' }
    ]
  },
  {
    id: 'styling',
    title: 'UI & Styling',
    icon: '🎨',
    color: 'pink',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-700 dark:text-pink-300',
    borderColor: 'border-pink-200 dark:border-pink-700',
    docs: [
      { id: 'tailwind', title: '🌊 Tailwind CSS Setup', file: 'tailwind-setup.md' },
      { id: 'shadcn', title: '🎨 ShadCN UI Components', file: 'shadcn.md' },
      { id: 'responsive', title: '📱 Responsive Design', file: 'responsive-design.md' },
      { id: 'dark-mode-fixes', title: '🌙 Dark Mode Fixes', file: 'dark-mode-styling-fixes.md' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Patterns',
    icon: '🔧',
    color: 'indigo',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-700',
    docs: [
      { id: 'context-api', title: '🌐 Context API Implementation', file: 'context-api-guide.md' },
      { id: 'error-boundaries-guide', title: '🛡️ Error Boundaries Guide', file: 'error-boundaries-guide.md' },
      { id: 'advanced-patterns', title: '🎭 Advanced Patterns', file: 'advanced-patterns.md' },
      { id: 'performance', title: '⚡ Performance Guide', file: 'performance-guide.md' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend & Database',
    icon: '🗄️',
    color: 'yellow',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    docs: [
      { id: 'hono', title: '🚀 Hono Backend Setup', file: 'hono-backend.md' },
      { id: 'database', title: '💾 Database Guide', file: 'database-guide.md' },
      { id: 'api-service', title: '🌐 API Service Layer', file: 'api-service-guide.md' }
    ]
  },
  {
    id: 'testing',
    title: 'Testing & QA',
    icon: '🧪',
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-700',
    docs: [
      { id: 'testing-guide', title: '🧪 Complete Testing Guide', file: 'testing-guide.md' },
      { id: 'component-testing', title: '🔬 Component Testing', file: 'component-testing.md' },
      { id: 'hook-testing', title: '🪝 Hook Testing', file: 'hook-testing.md' }
    ]
  }
];

/**
 * DocumentationSidebar Component
 */
export default function DocumentationSidebar({ 
  isOpen, 
  onClose, 
  initialCategory = null,
  initialDocument = null,
  className = '' 
}) {
  const { isDarkMode } = useTheme();
  const { totalProgress, sessionProgress, getReadingStats } = useReadingProgress();
  
  // Sidebar state management
  const [currentView, setCurrentView] = useState('index'); // 'index', 'document', 'search'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDocument, setSelectedDocument] = useState(initialDocument);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Refs for focus management
  const sidebarRef = useRef(null);
  const searchInputRef = useRef(null);
  const closeButtonRef = useRef(null);
  
  /**
   * KEYBOARD NAVIGATION SUPPORT
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      // Close on Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      
      // Quick search with Cmd+F
      if (event.metaKey && event.key === 'f') {
        event.preventDefault();
        setCurrentView('search');
        setTimeout(() => searchInputRef.current?.focus(), 100);
        return;
      }
      
      // Back to index with Cmd+I
      if (event.metaKey && event.key === 'i') {
        event.preventDefault();
        setCurrentView('index');
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  /**
   * FOCUS MANAGEMENT
   */
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);
  
  /**
   * EVENT HANDLERS
   */
  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('index');
  }, []);
  
  const handleDocumentSelect = useCallback((categoryId, docId) => {
    setSelectedCategory(categoryId);
    setSelectedDocument(docId);
    setCurrentView('document');
  }, []);
  
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentView('search');
      // Simulate search - in real app, this would search actual docs
      const results = DOCUMENTATION_CATEGORIES
        .flatMap(cat => cat.docs.map(doc => ({ ...doc, category: cat })))
        .filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.file.toLowerCase().includes(query.toLowerCase())
        );
      setSearchResults(results);
    }
  }, []);
  
  const handleBackToIndex = useCallback(() => {
    setCurrentView('index');
    setSelectedDocument(null);
  }, []);
  
  const handleQuickStart = useCallback(() => {
    handleDocumentSelect('setup', 'setup');
  }, [handleDocumentSelect]);
  
  const handleFAQ = useCallback(() => {
    alert('FAQ: Common questions and answers coming soon! For now, check the documentation categories for specific topics.');
  }, []);
  
  const handleFeedback = useCallback(() => {
    const email = 'feedback@movieapp.com';
    const subject = 'Documentation Feedback';
    const body = 'Hi! I have feedback about the documentation:';
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }, []);
  
  /**
   * BACKDROP CLICK HANDLER
   */
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <>
      <style>{`
        .docs-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .docs-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 4px;
        }
        .docs-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
          border-radius: 4px;
        }
        .docs-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#4b5563' : '#6b7280'};
        }
      `}</style>
      <div 
        className="fixed inset-0 z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Documentation sidebar"
      >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 dark:bg-black/50 transition-opacity duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Sidebar Container */}
      <div className="absolute right-0 top-0 h-full max-w-full">
        <div
          ref={sidebarRef}
          className={clsx(
            'h-full transition-transform duration-300 ease-in-out transform flex flex-col',
            'bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700',
            'shadow-2xl',
            // Responsive width
            'w-96 md:w-[28rem] lg:w-[32rem]',
            // Mobile full-screen on small devices
            'sm:w-96',
            className
          )}
        >
          {/* Sidebar Header */}
          <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📖</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Documentation
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentView === 'index' && 'Browse by category'}
                  {currentView === 'document' && 'Reading documentation'}
                  {currentView === 'search' && `Search results for "${searchQuery}"`}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {currentView === 'document' && (
                <Button
                  size="small"
                  variant="ghost"
                  onClick={handleBackToIndex}
                  title="Back to index (Cmd+I)"
                >
                  ←
                </Button>
              )}
              
              <Button
                ref={closeButtonRef}
                size="small"
                variant="ghost"
                onClick={onClose}
                title="Close documentation (Esc)"
              >
                ✕
              </Button>
            </div>
          </header>
          
          {/* Quick Actions Bar */}
          <div className="flex-shrink-0 flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <Button
              size="small"
              variant={currentView === 'index' ? 'primary' : 'ghost'}
              onClick={() => setCurrentView('index')}
            >
              📋 Index
            </Button>
            
            <Button
              size="small"
              variant={currentView === 'search' ? 'primary' : 'ghost'}
              onClick={() => setCurrentView('search')}
            >
              🔍 Search
            </Button>
            
            <div className="flex-1" />
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">Cmd+F</kbd> Search
            </div>
          </div>
          
          {/* Sidebar Content */}
          <main 
            className="flex-1 overflow-y-auto p-4 docs-scrollbar min-h-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isDarkMode ? '#6b7280 #374151' : '#9ca3af #f3f4f6'
            }}
          >
            
            {/* Documentation Index */}
            {currentView === 'index' && (
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">📚 Documentation Hub</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalProgress}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${totalProgress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>Access all educational resources and guides</span>
                    {sessionProgress > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{sessionProgress} this session
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Categories */}
                <div className="space-y-3">
                  {DOCUMENTATION_CATEGORIES.map((category) => (
                    <div key={category.id} className={clsx(
                      'p-4 rounded-lg cursor-pointer transition-all duration-200',
                      'hover:shadow-md hover:scale-[1.02]',
                      category.bgColor,
                      category.borderColor,
                      'border'
                    )}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h4 className={clsx('font-medium', category.textColor)}>
                            {category.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {category.docs.length} documents available
                          </p>
                        </div>
                      </div>
                      
                      {/* Document List */}
                      <div className="mt-3 ml-8 space-y-1">
                        {category.docs.map((doc) => (
                          <div key={doc.id} className="text-sm">
                            <button
                              className="text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
                              onClick={() => handleDocumentSelect(category.id, doc.id)}
                            >
                              {doc.title}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search View */}
            {currentView === 'search' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🔍 Search Documentation
                  </h3>
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    // Simple search implementation
                    if (query.trim()) {
                      const results = DOCUMENTATION_CATEGORIES
                        .flatMap(cat => cat.docs.map(doc => ({ ...doc, category: cat })))
                        .filter(doc => 
                          doc.title.toLowerCase().includes(query.toLowerCase()) ||
                          doc.file.toLowerCase().includes(query.toLowerCase())
                        );
                      setSearchResults(results);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search documentation..."
                />
                
                {/* Search Results */}
                {searchQuery && (
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found:
                        </p>
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            className={clsx(
                              'p-3 rounded-lg border cursor-pointer transition-all duration-150',
                              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                              'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                            )}
                            onClick={() => {
                              handleDocumentSelect(result.category.id, result.id);
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{result.category.icon}</span>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {result.title}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  in {result.category.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Document View */}
            {currentView === 'document' && selectedCategory && selectedDocument && (
              <DocumentationViewer
                categoryId={selectedCategory}
                documentId={selectedDocument}
                onNavigate={handleDocumentSelect}
                onBackToIndex={handleBackToIndex}
              />
            )}
            
          </main>
          
          {/* Sidebar Footer */}
          <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Educational Movie App Documentation
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                  onClick={handleQuickStart}
                  title="Go to Project Setup Guide"
                >
                  🚀 Quick Start
                </button>
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                  onClick={handleFAQ}
                  title="Frequently Asked Questions"
                >
                  ❓ FAQ
                </button>
                <button 
                  className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                  onClick={handleFeedback}
                  title="Send feedback via email"
                >
                  📧 Feedback
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>
      </div>
    </>
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * BASIC USAGE:
 * ```jsx
 * const [showDocs, setShowDocs] = useState(false);
 * 
 * <DocumentationSidebar
 *   isOpen={showDocs}
 *   onClose={() => setShowDocs(false)}
 * />
 * ```
 * 
 * WITH INITIAL CONTEXT:
 * ```jsx
 * <DocumentationSidebar
 *   isOpen={showDocs}
 *   onClose={() => setShowDocs(false)}
 *   initialCategory="react"
 *   initialDocument="components"
 * />
 * ```
 */
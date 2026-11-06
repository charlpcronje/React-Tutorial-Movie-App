/**
 * useReadingProgress Hook - Track Documentation Reading Progress
 * 
 * Tracks which documentation pages have been viewed and calculates
 * overall reading progress across the entire documentation.
 */

import { useState, useEffect, useCallback } from 'react';

// All available documentation pages with weights
const DOCUMENTATION_PAGES = {
  // Tutorial & Learning (25%)
  'tutorial-letter': { weight: 5, title: 'A Letter to Developers' },
  'tutorial-summary': { weight: 4, title: 'Educational Summary' },
  'tutorial-implementation': { weight: 6, title: 'Complete Implementation' },
  'tutorial-narration': { weight: 4, title: 'Tutorial Narration' },
  'tutorial-tasks': { weight: 6, title: 'Task Breakdown' },

  // Project Setup (15%)
  'setup-setup': { weight: 5, title: 'Project Setup Guide' },
  'setup-package': { weight: 3, title: 'Package.json Breakdown' },
  'setup-vite': { weight: 3, title: 'Vite Configuration' },
  'setup-structure': { weight: 4, title: 'Project Structure' },

  // React Concepts (30%)
  'react-first-component': { weight: 4, title: 'First Component Tutorial' },
  'react-components': { weight: 5, title: 'Components Overview' },
  'react-props-state': { weight: 5, title: 'Props & State' },
  'react-hooks': { weight: 6, title: 'Hooks Deep Dive' },
  'react-events': { weight: 3, title: 'Event Handling' },
  'react-conditional': { weight: 3, title: 'Conditional Rendering' },
  'react-lists': { weight: 3, title: 'Lists & Keys' },
  'react-lifecycle': { weight: 4, title: 'Component Lifecycle' },
  'react-context': { weight: 5, title: 'Context API' },
  'react-error-boundaries': { weight: 2, title: 'Error Boundaries' },

  // UI & Styling (15%)
  'styling-tailwind': { weight: 5, title: 'Tailwind CSS Setup' },
  'styling-shadcn': { weight: 4, title: 'ShadCN UI Components' },
  'styling-responsive': { weight: 3, title: 'Responsive Design' },
  'styling-dark-mode-fixes': { weight: 3, title: 'Dark Mode Fixes' },

  // Advanced Patterns (11%)
  'advanced-context-api': { weight: 3, title: 'Context API Implementation' },
  'advanced-error-boundaries-guide': { weight: 2, title: 'Error Boundaries Guide' },
  'advanced-advanced-patterns': { weight: 3, title: 'Advanced Patterns' },
  'advanced-performance': { weight: 2, title: 'Performance Guide' },
  'advanced-comments-system': { weight: 1, title: 'Comments System' },

  // Backend & Database (3%)
  'backend-hono': { weight: 1, title: 'Hono Backend Setup' },
  'backend-database': { weight: 1, title: 'Database Guide' },
  'backend-api-service': { weight: 1, title: 'API Service Layer' },

  // Testing & QA (2%)
  'testing-testing-guide': { weight: 1, title: 'Complete Testing Guide' },
  'testing-component-testing': { weight: 0.5, title: 'Component Testing' },
  'testing-hook-testing': { weight: 0.5, title: 'Hook Testing' },

  // TypeScript Mastery (3%)
  'typescript-typescript-introduction': { weight: 1, title: 'TypeScript Introduction' },
  'typescript-basic-types': { weight: 1, title: 'Basic Types & React' },
  'typescript-advanced-typescript': { weight: 1, title: 'Advanced TypeScript Patterns' },
  'typescript-trpc-integration': { weight: 0.5, title: 'tRPC Integration' }
};

const STORAGE_KEY = 'documentation-reading-progress';

export function useReadingProgress() {
  const [viewedPages, setViewedPages] = useState(new Set());
  const [totalProgress, setTotalProgress] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        const pageSet = new Set(parsed.viewedPages || []);
        setViewedPages(pageSet);
        calculateProgress(pageSet);
      } catch (error) {
        console.warn('Failed to load reading progress:', error);
      }
    }
  }, []);

  // Calculate overall progress percentage
  const calculateProgress = useCallback((pages) => {
    const totalWeight = Object.values(DOCUMENTATION_PAGES).reduce((sum, page) => sum + page.weight, 0);
    const viewedWeight = Array.from(pages).reduce((sum, pageId) => {
      const page = DOCUMENTATION_PAGES[pageId];
      return sum + (page ? page.weight : 0);
    }, 0);
    
    const progress = Math.round((viewedWeight / totalWeight) * 100);
    setTotalProgress(progress);
    return progress;
  }, []);

  // Mark a page as viewed
  const markPageAsViewed = useCallback((categoryId, documentId) => {
    const pageId = `${categoryId}-${documentId}`;
    
    setViewedPages(prevPages => {
      const newPages = new Set(prevPages);
      const wasAlreadyViewed = newPages.has(pageId);
      
      if (!wasAlreadyViewed) {
        newPages.add(pageId);
        
        // Update session progress (pages viewed this session)
        setSessionProgress(prev => prev + 1);
        
        // Save to localStorage
        const progressData = {
          viewedPages: Array.from(newPages),
          lastUpdated: new Date().toISOString(),
          totalPages: Object.keys(DOCUMENTATION_PAGES).length
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        
        // Calculate new progress
        calculateProgress(newPages);
        
        return newPages;
      }
      
      return prevPages;
    });
  }, [calculateProgress]);

  // Get reading stats
  const getReadingStats = useCallback(() => {
    const totalPages = Object.keys(DOCUMENTATION_PAGES).length;
    const viewedCount = viewedPages.size;
    const remainingPages = totalPages - viewedCount;
    
    return {
      totalPages,
      viewedCount,
      remainingPages,
      progressPercentage: totalProgress,
      sessionProgress,
      isComplete: totalProgress === 100
    };
  }, [viewedPages, totalProgress, sessionProgress]);

  // Get category progress
  const getCategoryProgress = useCallback((categoryId) => {
    const categoryPages = Object.keys(DOCUMENTATION_PAGES).filter(pageId => 
      pageId.startsWith(categoryId)
    );
    const viewedInCategory = categoryPages.filter(pageId => viewedPages.has(pageId));
    
    return {
      total: categoryPages.length,
      viewed: viewedInCategory.length,
      percentage: categoryPages.length > 0 ? Math.round((viewedInCategory.length / categoryPages.length) * 100) : 0
    };
  }, [viewedPages]);

  // Reset progress (for debugging/testing)
  const resetProgress = useCallback(() => {
    setViewedPages(new Set());
    setTotalProgress(0);
    setSessionProgress(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if a specific page has been viewed
  const isPageViewed = useCallback((categoryId, documentId) => {
    const pageId = `${categoryId}-${documentId}`;
    return viewedPages.has(pageId);
  }, [viewedPages]);

  return {
    // Core functions
    markPageAsViewed,
    isPageViewed,
    
    // Progress data
    totalProgress,
    sessionProgress,
    viewedPages: Array.from(viewedPages),
    
    // Utility functions
    getReadingStats,
    getCategoryProgress,
    resetProgress,
    
    // Page data
    totalPages: Object.keys(DOCUMENTATION_PAGES).length,
    availablePages: DOCUMENTATION_PAGES
  };
}
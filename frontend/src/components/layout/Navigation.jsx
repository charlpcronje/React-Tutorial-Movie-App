/**
 * Navigation Component - Educational Router and State Management
 * 
 * This component demonstrates how to build navigation systems in React
 * without external routing libraries. It showcases:
 * 
 * 1. STATE-BASED ROUTING: Using React state to control which view is shown
 * 2. ACTIVE STATE MANAGEMENT: Highlighting current navigation item
 * 3. KEYBOARD NAVIGATION: Arrow keys and tab navigation
 * 4. RESPONSIVE DESIGN: Mobile-friendly navigation patterns
 * 5. ACCESSIBILITY: Proper ARIA labels and semantic HTML
 * 6. ANIMATION: Smooth transitions between states
 * 7. PERSISTENCE: Remembering the last visited section
 * 
 * This serves as a foundation before introducing React Router later.
 */

// React imports
import React, { useState, useEffect, useCallback } from 'react';

// Our custom hooks and components
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { useDisclosure } from '../../hooks/useToggle.js';

// Utilities
import { clsx } from 'clsx';

/**
 * NAVIGATION CONFIGURATION
 * 
 * We define our navigation structure as data, which makes it easy
 * to maintain and extend. This pattern scales well as apps grow.
 */
const NAVIGATION_ITEMS = [
  {
    id: 'welcome',
    title: 'Welcome',
    emoji: '👋',
    description: 'Introduction and basic React concepts',
    shortcut: '1',
  },
  {
    id: 'components',
    title: 'Components',
    emoji: '🧩', 
    description: 'Button component and props demonstration',
    shortcut: '2',
  },
  {
    id: 'reactivity',
    title: 'Reactivity',
    emoji: '⚡',
    description: 'State management and reactive updates',
    shortcut: '3',
  },
  {
    id: 'interactions',
    title: 'Interactions',
    emoji: '🎮',
    description: 'Complex interactions and user interface patterns',
    shortcut: '4',
  },
  {
    id: 'hooks',
    title: 'Custom Hooks',
    emoji: '🪝',
    description: 'Custom hooks and reusable logic patterns',
    shortcut: '5',
  },
  {
    id: 'api',
    title: 'API Integration',
    emoji: '🌐',
    description: 'Data fetching and service integration',
    shortcut: '6',
  },
];

/**
 * Navigation Component Definition
 * 
 * @param {Object} props - Component props
 * @param {string} props.currentSection - Currently active section
 * @param {Function} props.onSectionChange - Called when section changes
 * @param {string} props.className - Additional CSS classes
 */
function Navigation({ 
  currentSection, 
  onSectionChange, 
  className = '' 
}) {
  console.log('🧭 Navigation component rendering, current section:', currentSection);
  
  /**
   * MOBILE NAVIGATION STATE
   * 
   * We use our custom useDisclosure hook to manage mobile menu state.
   */
  const { 
    isDisclosed: isMobileMenuOpen, 
    toggle: toggleMobileMenu, 
    close: closeMobileMenu 
  } = useDisclosure(false);
  
  /**
   * NAVIGATION HISTORY
   * 
   * Track navigation history for educational purposes and potential
   * back/forward functionality.
   */
  const [navigationHistory, setNavigationHistory] = useLocalStorage('nav_history', []);
  
  /**
   * KEYBOARD NAVIGATION
   * 
   * Handle keyboard shortcuts for quick navigation.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle when not typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Number key shortcuts (1-6 for different sections)
      const numberKey = parseInt(event.key);
      if (numberKey >= 1 && numberKey <= NAVIGATION_ITEMS.length) {
        event.preventDefault();
        const targetItem = NAVIGATION_ITEMS[numberKey - 1];
        handleSectionChange(targetItem.id);
        console.log(`⌨️ Keyboard navigation to: ${targetItem.title}`);
        return;
      }
      
      // Arrow key navigation
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        
        const currentIndex = NAVIGATION_ITEMS.findIndex(item => item.id === currentSection);
        let newIndex;
        
        if (event.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : NAVIGATION_ITEMS.length - 1;
        } else {
          newIndex = currentIndex < NAVIGATION_ITEMS.length - 1 ? currentIndex + 1 : 0;
        }
        
        const targetItem = NAVIGATION_ITEMS[newIndex];
        handleSectionChange(targetItem.id);
        console.log(`⌨️ Arrow navigation to: ${targetItem.title}`);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSection]);
  
  /**
   * SECTION CHANGE HANDLER
   * 
   * Handles navigation with history tracking and callbacks.
   */
  const handleSectionChange = useCallback((sectionId) => {
    console.log(`🧭 Navigating from ${currentSection} to ${sectionId}`);
    
    // Add to navigation history
    setNavigationHistory(prev => [
      ...prev.slice(-19), // Keep last 19 entries
      {
        from: currentSection,
        to: sectionId,
        timestamp: Date.now(),
      }
    ]);
    
    // Close mobile menu if open
    closeMobileMenu();
    
    // Call parent handler
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  }, [currentSection, onSectionChange, setNavigationHistory, closeMobileMenu]);
  
  /**
   * RENDER NAVIGATION ITEMS
   * 
   * Creates the navigation item elements with proper accessibility.
   */
  const renderNavigationItem = useCallback((item, isMobile = false) => {
    const isActive = currentSection === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => handleSectionChange(item.id)}
        className={clsx(
          // Base styles
          'group flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
          'text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500',
          
          // Active state
          isActive ? [
            'bg-blue-600 text-white shadow-md',
            'hover:bg-blue-700'
          ] : [
            'text-gray-700 hover:bg-gray-100',
            'hover:text-gray-900'
          ],
          
          // Mobile specific
          isMobile && 'justify-center md:justify-start'
        )}
        aria-current={isActive ? 'page' : undefined}
        title={`${item.title} - ${item.description} (Press ${item.shortcut})`}
      >
        {/* Emoji Icon */}
        <span className="text-xl flex-shrink-0" role="img" aria-label={item.title}>
          {item.emoji}
        </span>
        
        {/* Text Content */}
        <div className={clsx('flex-1', isMobile && 'hidden md:block')}>
          <div className="font-medium">{item.title}</div>
          <div className={clsx(
            'text-xs mt-1',
            isActive ? 'text-blue-200' : 'text-gray-500 group-hover:text-gray-600'
          )}>
            {item.description}
          </div>
        </div>
        
        {/* Keyboard Shortcut Badge */}
        <div className={clsx(
          'hidden md:flex items-center justify-center w-6 h-6 rounded text-xs font-mono',
          isActive ? 'bg-blue-500 text-blue-100' : 'bg-gray-200 text-gray-600'
        )}>
          {item.shortcut}
        </div>
        
        {/* Active Indicator */}
        {isActive && (
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </button>
    );
  }, [currentSection, handleSectionChange]);
  
  /**
   * COMPONENT RENDER
   */
  return (
    <nav className={clsx('bg-white border-b border-gray-200', className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-4">
            {NAVIGATION_ITEMS.map(item => renderNavigationItem(item, false))}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Header */}
      <div className="md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Current Section Display */}
          <div className="flex items-center space-x-2">
            {(() => {
              const currentItem = NAVIGATION_ITEMS.find(item => item.id === currentSection);
              return currentItem ? (
                <>
                  <span className="text-xl">{currentItem.emoji}</span>
                  <span className="font-medium text-gray-900">{currentItem.title}</span>
                </>
              ) : (
                <span className="font-medium text-gray-900">Educational Movie App</span>
              );
            })()}
          </div>
          
          {/* Mobile Menu Toggle */}
          <Button
            size="small"
            variant="ghost"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-gray-50 animate-fade-in">
            <div className="px-4 py-3 space-y-2">
              {NAVIGATION_ITEMS.map(item => renderNavigationItem(item, true))}
            </div>
            
            {/* Mobile Navigation Footer */}
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Use number keys (1-6) for quick navigation
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Progress Indicator */}
      <div className="bg-gray-100 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-300 ease-out"
          style={{
            width: `${((NAVIGATION_ITEMS.findIndex(item => item.id === currentSection) + 1) / NAVIGATION_ITEMS.length) * 100}%`
          }}
        />
      </div>
      
      {/* Navigation History (Development Only) */}
      {import.meta.env.DEV && navigationHistory.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <details className="text-xs">
            <summary className="cursor-pointer text-yellow-800 font-medium">
              Navigation History ({navigationHistory.length} entries)
            </summary>
            <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
              {navigationHistory.slice(-10).map((entry, index) => (
                <div key={index} className="text-yellow-700">
                  {entry.from} → {entry.to} at {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </nav>
  );
}

export default Navigation;

/**
 * USAGE EXAMPLES:
 * 
 * BASIC NAVIGATION:
 * ```jsx
 * function App() {
 *   const [currentSection, setCurrentSection] = useState('welcome');
 *   
 *   return (
 *     <div>
 *       <Navigation
 *         currentSection={currentSection}
 *         onSectionChange={setCurrentSection}
 *       />
 *       
 *       <main>
 *         {currentSection === 'welcome' && <WelcomeSection />}
 *         {currentSection === 'components' && <ComponentsSection />}
 *         {currentSection === 'reactivity' && <ReactivitySection />}
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 * 
 * WITH ROUTE GUARDS:
 * ```jsx
 * function ProtectedNavigation({ currentSection, onSectionChange, user }) {
 *   const handleSectionChange = (sectionId) => {
 *     // Check if user has access to this section
 *     const protectedSections = ['admin', 'settings'];
 *     
 *     if (protectedSections.includes(sectionId) && !user?.isAdmin) {
 *       alert('Access denied: Admin privileges required');
 *       return;
 *     }
 *     
 *     onSectionChange(sectionId);
 *   };
 *   
 *   return (
 *     <Navigation
 *       currentSection={currentSection}
 *       onSectionChange={handleSectionChange}
 *     />
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL CONCEPTS:
 * 
 * 1. STATE-BASED ROUTING: Simple routing without external libraries
 * 2. COMPONENT COMMUNICATION: Parent-child communication via props
 * 3. KEYBOARD ACCESSIBILITY: Arrow keys and shortcuts
 * 4. RESPONSIVE PATTERNS: Different layouts for mobile/desktop
 * 5. LOCAL STORAGE: Persisting navigation state
 * 6. ANIMATION: Smooth transitions and visual feedback
 * 7. ACCESSIBILITY: Proper ARIA attributes and semantic HTML
 */
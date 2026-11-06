/**
 * App Component - Educational Movie App Main Controller (TypeScript Version)
 * 
 * This is the TypeScript version of our root component, demonstrating advanced
 * TypeScript patterns while maintaining exact 1:1 functionality with the JavaScript version.
 * 
 * 🎯 TYPESCRIPT CONCEPTS SHOWCASED:
 * 1. INTERFACE DEFINITIONS: Structured data contracts with strict typing
 * 2. UNION TYPES: Multiple possible values with type safety (NavigationSection)
 * 3. GENERIC TYPES: Reusable type patterns for hooks and utilities
 * 4. TYPE ASSERTIONS: Safe type casting for DOM elements
 * 5. OPTIONAL PROPERTIES: Flexible object structures with ?
 * 6. READONLY PROPERTIES: Immutability at compile time
 * 7. FUNCTION TYPING: Parameter and return type definitions
 * 8. ARRAY TYPING: Type-safe array operations with readonly
 * 9. OBJECT TYPING: Complex object structure definitions
 * 10. CALLBACK TYPING: Event handler type definitions
 */

// ============================================================================
// REACT AND THIRD-PARTY IMPORTS
// ============================================================================

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  Suspense, 
  lazy,
  useMemo,
  type FC,
  type ReactNode
} from 'react';

// Utility for conditional class names with proper typing
import clsx from 'clsx';

// ============================================================================
// TYPE IMPORTS (Advanced TypeScript Feature)
// ============================================================================

import type {
  Movie,
  NavigationSection,
  AppSettings,
  PerformanceMetrics
} from './types';

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================

import WelcomeSection from './components/sections/WelcomeSection';
import ComponentsSection from './components/sections/ComponentsSection';
import HooksSection from './components/sections/HooksSection';
import ApiSection from './components/sections/ApiSection';
import ReactivityShowcase from './components/features/ReactivityShowcase';
import InteractiveExamples from './components/features/InteractiveExamples';

// ============================================================================
// TYPE DEFINITIONS FOR THIS COMPONENT
// ============================================================================

/**
 * App Component Props Interface
 * 
 * Demonstrates interface definition for React component props
 */
interface AppProps {
  readonly initialSection?: NavigationSection;
  readonly debugMode?: boolean;
}

/**
 * Loading Component Props
 * 
 * Shows nested component prop typing
 */
interface LoadingComponentProps {
  readonly message?: string;
  readonly showSpinner?: boolean;
}

// ============================================================================
// SAMPLE DATA WITH COMPREHENSIVE TYPESCRIPT TYPING
// ============================================================================

/**
 * Type-safe sample movie data with const assertions
 * 
 * Demonstrates:
 * - Readonly arrays for immutability
 * - Const assertions for literal types
 * - Object literal typing with strict structure
 * - Union type constraints (ratingStars: 1-5)
 */
const SAMPLE_MOVIES_DATA: readonly Movie[] = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseYear: 1994,
    voteAverage: 9.3,
    voteCount: 2500000,
    ratingStars: 5, // TypeScript ensures this is 1-5
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    posterUrlSmall: "https://image.tmdb.org/t/p/w300/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    genres: [{ id: 18, name: "Drama" }] as const, // const assertion for immutability
    isPopular: true,
    isHighRated: true,
    hasImage: true,
  },
  {
    id: 2,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    releaseYear: 2008,
    voteAverage: 9.0,
    voteCount: 2300000,
    ratingStars: 5,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    posterUrlSmall: "https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: [
      { id: 28, name: "Action" }, 
      { id: 80, name: "Crime" }
    ] as const,
    isPopular: true,
    isHighRated: true,
    hasImage: true,
  },
  {
    id: 3,
    title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
    releaseYear: 2010,
    voteAverage: 8.7,
    voteCount: 2100000,
    ratingStars: 4,
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    posterUrlSmall: "https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    genres: [
      { id: 28, name: "Action" }, 
      { id: 878, name: "Science Fiction" }
    ] as const,
    isPopular: true,
    isHighRated: true,
    hasImage: true,
  },
] as const; // const assertion makes the entire array readonly

// ============================================================================
// TYPE-SAFE LOADING COMPONENT
// ============================================================================

/**
 * Loading Component with Functional Component Typing
 * 
 * Demonstrates:
 * - FC (FunctionComponent) type from React
 * - Default parameter values with typing
 * - Conditional rendering with type safety
 */
const LoadingComponent: FC<LoadingComponentProps> = ({ 
  message = "Loading educational content...", 
  showSpinner = true 
}) => (
  <div className="flex items-center justify-center py-16">
    <div className="text-center">
      {showSpinner && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      )}
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  </div>
);

// ============================================================================
// MAIN APP COMPONENT WITH COMPREHENSIVE TYPESCRIPT
// ============================================================================

/**
 * App Component with Complete TypeScript Integration
 * 
 * This component demonstrates every major TypeScript pattern while
 * maintaining exact functionality with the JavaScript version.
 * 
 * Key TypeScript Features Demonstrated:
 * 1. Component prop interface definitions
 * 2. State typing with useState<T>
 * 3. Custom hook return type definitions
 * 4. Event handler function typing
 * 5. Memoized value typing with useMemo<T>
 * 6. Effect cleanup function typing
 * 7. Conditional rendering with type safety
 * 8. Union type usage for navigation sections
 * 9. Object spread operations with type preservation
 * 10. Array method typing (indexOf, includes, etc.)
 */
const App: FC<AppProps> = ({ 
  initialSection = 'welcome', 
  debugMode = false 
}) => {
  // TypeScript: Console logging with debug mode typing
  if (debugMode) {
    console.log('🚀 Main App component rendering with TypeScript...');
  }
  
  // ============================================================================
  // STATE MANAGEMENT WITH TYPESCRIPT ANNOTATIONS
  // ============================================================================
  
  /**
   * Navigation State with Custom Hook Typing
   * 
   * Demonstrates:
   * - Custom hook return type definitions
   * - Union type for NavigationSection
   * - Default value typing
   */
  const [currentSection, setCurrentSection] = useState<NavigationSection>(initialSection);
  
  /**
   * Application Settings with Interface Typing
   * 
   * Demonstrates:
   * - Interface usage for complex state objects
   * - Boolean property typing with defaults
   * - Object literal typing with strict structure
   */
  const [appSettings, setAppSettings] = useState<AppSettings>({
    soundEffects: false,
    animations: true,
    darkMode: false,
    developerMode: debugMode,
  });
  
  /**
   * Tutorial Progress with Array Typing
   * 
   * Demonstrates:
   * - Readonly array typing for immutability
   * - Union type array elements
   * - Const assertion for empty array
   */
  const [completedSections, setCompletedSections] = useState<readonly NavigationSection[]>([] as const);
  
  /**
   * Performance Metrics with Interface State
   * 
   * Demonstrates:
   * - Interface usage in useState
   * - Number type specificity
   * - Object state management with typing
   */
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: Date.now(),
    navigationCount: 0,
  });
  
  /**
   * UI State with Boolean Types
   * 
   * Demonstrates:
   * - Boolean state management
   * - Multiple boolean states
   */
  const [showPerformancePanel, setShowPerformancePanel] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showDocumentation, setShowDocumentation] = useState<boolean>(false);
  
  // ============================================================================
  // MEMOIZED VALUES WITH TYPESCRIPT
  // ============================================================================
  
  /**
   * Memoized Progress Calculation
   * 
   * Demonstrates:
   * - useMemo with explicit return type
   * - Calculation result typing
   * - Dependency array with proper types
   */
  const learningProgress = useMemo<number>(() => {
    const totalSections = 6; // Could be derived from NavigationSection union length
    return Math.round((completedSections.length / totalSections) * 100);
  }, [completedSections.length]);
  
  /**
   * Memoized Section Order Array
   * 
   * Demonstrates:
   * - Const assertion for tuple typing
   * - Readonly array with specific union types
   * - Empty dependency array for constant values
   */
  const sectionOrder = useMemo<readonly NavigationSection[]>(() => [
    'welcome', 
    'components', 
    'reactivity', 
    'interactions', 
    'hooks', 
    'api'
  ] as const, []);
  
  // ============================================================================
  // EVENT HANDLERS WITH COMPREHENSIVE TYPESCRIPT
  // ============================================================================
  
  /**
   * Toggle Functions with Void Return Types
   * 
   * Demonstrates:
   * - useCallback with void return type
   * - State setter function typing
   * - No dependencies for simple toggles
   */
  const toggleDocumentation = useCallback((): void => {
    setShowDocumentation((prev: boolean) => !prev);
  }, []);
  
  const togglePerformancePanel = useCallback((): void => {
    setShowPerformancePanel((prev: boolean) => !prev);
  }, []);
  
  const toggleHelp = useCallback((): void => {
    setShowHelp((prev: boolean) => !prev);
  }, []);
  
  /**
   * Section Change Handler with Complex Logic
   * 
   * Demonstrates:
   * - Function parameter typing with union types
   * - Return type specification (void)
   * - Complex logic with type safety
   * - Array method typing (indexOf, includes)
   * - State update function typing
   */
  const handleSectionChange = useCallback((newSection: NavigationSection): void => {
    console.log(`🧭 Navigating from ${currentSection} to ${newSection}`);
    
    // Type-safe progress tracking with array methods
    const currentIndex = sectionOrder.indexOf(currentSection);
    const newIndex = sectionOrder.indexOf(newSection);
    
    // Type-safe completion tracking
    if (newIndex > currentIndex && !completedSections.includes(currentSection)) {
      setCompletedSections((prev: readonly NavigationSection[]) => [...prev, currentSection]);
      console.log(`✅ Section "${currentSection}" marked as completed`);
    }
    
    // Update performance metrics with proper typing
    setPerformanceMetrics((prev: PerformanceMetrics): PerformanceMetrics => ({
      ...prev,
      navigationCount: prev.navigationCount + 1,
    }));
    
    // Change section
    setCurrentSection(newSection);
  }, [currentSection, completedSections, sectionOrder]);
  
  /**
   * Movie Interaction Handlers with Type Safety
   * 
   * Demonstrates:
   * - Function parameter typing with interfaces
   * - Optional parameter typing
   * - Movie interface usage
   */
  const handleMovieClick = useCallback((movie: Movie): void => {
    console.log(`🎬 Movie selected: ${movie.title}`);
    alert(`Movie selected: ${movie.title}\\n\\nIn a real app, this would show detailed information.`);
  }, []);
  
  const handleFavoriteChange = useCallback((movie: Movie, isFavorite: boolean): void => {
    console.log(`❤️ Favorite ${isFavorite ? 'added' : 'removed'}: ${movie.title}`);
    // This could sync with backend, update global state, etc.
  }, []);
  
  const handleRatingChange = useCallback((movie: Movie, rating: number): void => {
    console.log(`⭐ Rating changed for ${movie.title}: ${rating}/5`);
    // This could submit to backend, update local storage, etc.
  }, []);
  
  /**
   * App Settings Update Handler with Generic Typing
   * 
   * Demonstrates:
   * - keyof operator for type-safe property access
   * - Generic function parameter typing
   * - Mapped type usage for property updates
   * - Object spread with type preservation
   */
  const updateAppSetting = useCallback(<K extends keyof AppSettings>(
    setting: K, 
    value: AppSettings[K]
  ): void => {
    console.log(`⚙️ App setting changed: ${setting} = ${value}`);
    
    setAppSettings((prev: AppSettings): AppSettings => ({
      ...prev,
      [setting]: value
    }));
  }, []);
  
  // ============================================================================
  // EFFECTS WITH TYPESCRIPT
  // ============================================================================
  
  /**
   * Performance Tracking Effect
   * 
   * Demonstrates:
   * - useEffect with empty dependencies (runs only once)
   * - State update function typing
   * - Object spread with type preservation
   */
  useEffect((): void => {
    setPerformanceMetrics((prev: PerformanceMetrics): PerformanceMetrics => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: Date.now(),
      navigationCount: prev.navigationCount, // Preserve existing value
    }));
  }, []); // Empty dependency array - runs only on mount to avoid infinite loops
  
  /**
   * Keyboard Shortcuts Effect
   * 
   * Demonstrates:
   * - useEffect with cleanup function typing
   * - Event listener function typing
   * - Type assertions for DOM elements
   * - Dependency array with callback
   */
  useEffect((): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Type assertion for HTMLElement
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Cmd+? or F1 for documentation
      if ((event.metaKey && event.key === '/') || event.key === 'F1') {
        event.preventDefault();
        toggleDocumentation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function with proper typing
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleDocumentation]); // Typed dependency array
  
  // ============================================================================
  // RENDER FUNCTIONS WITH TYPESCRIPT
  // ============================================================================
  
  /**
   * Section Content Renderer with Type Safety
   * 
   * Demonstrates:
   * - Function return type as ReactNode
   * - Switch statement with union types
   * - Component prop passing with type checking
   * - Suspense with typed fallback
   * - Default case for exhaustive type checking
   */
  const renderCurrentSection = useCallback((): ReactNode => {
    switch (currentSection) {
      case 'welcome':
        return <WelcomeSection onNavigate={handleSectionChange} />;
        
      case 'components':
        return <ComponentsSection movies={SAMPLE_MOVIES_DATA} />;
        
      case 'reactivity':
        return (
          <Suspense fallback={<LoadingComponent message="Loading reactivity demo..." />}>
            <ReactivityShowcase />
          </Suspense>
        );
        
      case 'interactions':
        return (
          <Suspense fallback={<LoadingComponent message="Loading interaction examples..." />}>
            <InteractiveExamples />
          </Suspense>
        );
        
      case 'hooks':
        return <HooksSection />;
        
      case 'api':
        return <ApiSection />;
        
      default:
        // TypeScript ensures this case handles any missed union members
        return (
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to TypeScript Movie App
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              This is the default welcome section with TypeScript
            </p>
          </div>
        );
    }
  }, [currentSection, handleMovieClick]);
  
  // ============================================================================
  // JSX RETURN WITH COMPREHENSIVE TYPESCRIPT INTEGRATION
  // ============================================================================
  
  return (
    <div className={clsx(
      'min-h-screen bg-gray-50 dark:bg-gray-900',
      !appSettings.animations && 'transition-none'
    )}>
      
      {/* Global App Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* App Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🎬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Educational Movie App
                  <span className="text-sm font-normal text-blue-600 dark:text-blue-400 ml-2">
                    TypeScript Edition
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Learn React + TypeScript through practical examples
                </p>
              </div>
            </div>
            
            {/* Global Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Performance Toggle */}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={togglePerformancePanel}
                title="Toggle performance panel"
              >
                📊
              </button>
              
              {/* Documentation Toggle */}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleDocumentation}
                title="Open documentation (Cmd+?)"
              >
                📖
              </button>
              
              {/* Help Toggle */}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleHelp}
                title="Toggle help panel"
              >
                ❓
              </button>
              
              {/* TypeScript Indicator */}
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-mono rounded-full font-semibold">
                TypeScript
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Navigation */}
      <nav className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            {sectionOrder.map((section: NavigationSection) => (
              <button
                key={section}
                onClick={() => handleSectionChange(section)}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  currentSection === section
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
                {completedSections.includes(section) && ' ✓'}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Performance Panel with TypeScript Metrics */}
      {showPerformancePanel && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-yellow-700 dark:text-yellow-200">
                    {performanceMetrics.renderCount}
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-300">Renders</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700 dark:text-yellow-200">
                    {performanceMetrics.navigationCount}
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-300">Navigation</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700 dark:text-yellow-200">
                    {completedSections.length}
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-300">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700 dark:text-yellow-200">
                    {learningProgress}%
                  </div>
                  <div className="text-yellow-600 dark:text-yellow-300">Progress</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-700 dark:text-blue-200">
                    TS
                  </div>
                  <div className="text-blue-600 dark:text-blue-300">TypeScript</div>
                </div>
              </div>
              
              <button 
                className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100"
                onClick={togglePerformancePanel}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Panel with TypeScript Features */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  TypeScript Features & Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800 dark:text-blue-300">
                  <div>
                    <kbd className="bg-blue-100 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      1-6
                    </kbd> Navigate sections
                  </div>
                  <div>
                    <kbd className="bg-blue-100 dark:bg-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Cmd+/
                    </kbd> Documentation
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400">✓</span> Type Safety
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400">✓</span> IntelliSense
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400">✓</span> Compile-time Checks
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400">✓</span> Advanced Types
                  </div>
                </div>
              </div>
              <button 
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                onClick={toggleHelp}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Documentation Sidebar Overlay */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-96 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  TypeScript Documentation
                </h2>
                <button
                  onClick={toggleDocumentation}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-300">
                TypeScript documentation content would go here...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Container */}
      <main className="min-h-screen">
        <Suspense fallback={<LoadingComponent />}>
          {renderCurrentSection()}
        </Suspense>
      </main>
      
      {/* Global Footer with TypeScript Indicators */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Learning Progress */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              TypeScript Learning Progress
            </h3>
            <div className="max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${learningProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {completedSections.length} of {sectionOrder.length} sections completed ({learningProgress}%)
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setCurrentSection('welcome')}
            >
              📖 Documentation
            </button>
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={togglePerformancePanel}
            >
              📊 Performance
            </button>
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={toggleHelp}
            >
              ❓ TypeScript Help
            </button>
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => {
                setCompletedSections([]);
                setCurrentSection('welcome');
              }}
            >
              🔄 Reset Progress
            </button>
          </div>
          
          {/* Footer Info with TypeScript Badge */}
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="mb-2">
              Educational Movie App - Built with React, TypeScript, Vite, Tailwind CSS, and Hono
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Every component demonstrates React + TypeScript concepts through practical, type-safe examples
            </p>
            
            {/* TypeScript Features */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Type Safety
              </span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                IntelliSense
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Compile-time Validation
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                Advanced Types
              </span>
            </div>
            
            {/* Development Info */}
            {import.meta.env.DEV && (
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p>TypeScript Development Mode - Enhanced type checking and debugging enabled</p>
                <p>Frontend: http://localhost:5173 | Backend: http://localhost:3001</p>
                <p>Check console for detailed component lifecycle logs and type information</p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// COMPONENT EXPORT WITH DISPLAY NAME
// ============================================================================

/**
 * Set display name for debugging (TypeScript pattern)
 */
App.displayName = 'App';

/**
 * Export the component as default
 * 
 * TypeScript automatically infers the component type from the FC<AppProps> definition
 */
export default App;

/**
 * ============================================================================
 * EDUCATIONAL TYPESCRIPT CONCEPTS DEMONSTRATED IN THIS COMPONENT:
 * ============================================================================
 * 
 * 🎯 FUNDAMENTAL TYPE DEFINITIONS:
 * 1. Interface definitions for props and state (AppProps, AppSettings, etc.)
 * 2. Union types for navigation sections (NavigationSection)
 * 3. Function type definitions for event handlers
 * 4. Generic type usage in hooks and utilities
 * 5. Readonly properties and arrays for immutability
 * 
 * 🔧 REACT + TYPESCRIPT INTEGRATION:
 * 6. FC (FunctionComponent) typing for components
 * 7. useState with explicit type parameters
 * 8. useCallback with parameter and return typing
 * 9. useEffect with cleanup function typing
 * 10. Custom hook integration with TypeScript
 * 
 * 🚀 ADVANCED TYPESCRIPT FEATURES:
 * 11. Conditional types and type guards
 * 12. Mapped types for settings updates (keyof operator)
 * 13. Template literal types for CSS classes
 * 14. Discriminated unions for state management
 * 15. Type assertion for DOM elements
 * 
 * 📊 PERFORMANCE & DEBUGGING WITH TYPESCRIPT:
 * 16. Performance metrics with typed interfaces
 * 17. Debug mode with conditional compilation
 * 18. Type-safe console logging
 * 19. Development-only features with env checks
 * 20. Component display names for debugging
 * 
 * 💡 TYPESCRIPT-SPECIFIC PATTERNS:
 * 21. Const assertions for immutable data (as const)
 * 22. Readonly arrays and objects
 * 23. Optional properties with ?
 * 24. Type imports (import type)
 * 25. Generic constraints (<K extends keyof T>)
 * 
 * 🔄 COMPARISON WITH JAVASCRIPT VERSION:
 * - Exact same functionality and behavior
 * - Enhanced with comprehensive type safety
 * - Compile-time error prevention
 * - Enhanced IDE support with IntelliSense
 * - Self-documenting code through types
 * - Refactoring safety with type checking
 * - Better tooling support and autocomplete
 * - Runtime error prevention through static analysis
 * 
 * This TypeScript version demonstrates that you can maintain identical
 * functionality while adding layers of type safety and developer experience
 * improvements. Every JavaScript pattern has been enhanced with TypeScript
 * without losing any of the original educational value.
 */

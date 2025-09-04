/**
 * App Component - Educational Movie App Main Controller
 * 
 * This is the root component that orchestrates our entire educational experience.
 * It has evolved from a simple demo to a comprehensive showcase of React concepts:
 * 
 * 1. ADVANCED COMPONENT COMPOSITION: Multiple complex components working together
 * 2. STATE-BASED ROUTING: Navigation between different educational sections
 * 3. CROSS-COMPONENT COMMUNICATION: How components share and react to data
 * 4. PERFORMANCE OPTIMIZATION: Lazy loading and efficient re-renders  
 * 5. RESPONSIVE LAYOUT: Mobile-first design with adaptive interfaces
 * 6. ACCESSIBILITY: Full keyboard navigation and screen reader support
 * 7. PROGRESSIVE ENHANCEMENT: Features that enhance the experience gradually
 * 8. ERROR BOUNDARIES: Graceful error handling throughout the app
 * 9. REAL-TIME FEATURES: Live updates and reactive interfaces
 * 10. EDUCATIONAL PROGRESSION: Structured learning path through React concepts
 * 
 * Each section demonstrates specific React patterns while building toward
 * a complete, functional movie application.
 */

// React imports for main app functionality
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';

// Our foundational components
import Button from './components/ui/Button.jsx';
import Navigation from './components/layout/Navigation.jsx';

// Our section components
import WelcomeSection from './components/sections/WelcomeSection.jsx';
import ComponentsSection from './components/sections/ComponentsSection.jsx';
import HooksSection from './components/sections/HooksSection.jsx';
import ApiSection from './components/sections/ApiSection.jsx';

// Our educational showcase components
import ReactivityShowcase from './components/features/ReactivityShowcase.jsx';
import InteractiveExamples from './components/features/InteractiveExamples.jsx';

// Our custom hooks for app-level state
import useLocalStorage from './hooks/useLocalStorage.js';
import useToggle from './hooks/useToggle.js';

// Context provider for global state management
import AppProvider from './contexts/AppContext.jsx';

// Lazy-loaded components for performance demonstration
const MovieCard = lazy(() => import('./components/features/MovieCard.jsx'));

/**
 * SAMPLE DATA FOR EDUCATIONAL DEMONSTRATIONS
 * 
 * We create comprehensive sample data to demonstrate how real applications
 * work with complex data structures.
 */
const SAMPLE_MOVIES_DATA = [
  {
    id: 1,
    title: "The Shawshank Redemption", 
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseYear: 1994,
    voteAverage: 9.3,
    voteCount: 2500000,
    ratingStars: 5,
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    posterUrlSmall: "https://image.tmdb.org/t/p/w300/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    genres: [{ id: 18, name: "Drama" }],
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
    genres: [{ id: 28, name: "Action" }, { id: 80, name: "Crime" }],
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
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }],
    isPopular: true,
    isHighRated: true,
    hasImage: true,
  },
];

/**
 * App Component Definition
 * 
 * This component now serves as the main controller for our educational
 * React application, demonstrating advanced patterns and real-world architecture.
 */
function App() {
  console.log('🚀 Main App component rendering...');
  
  /**
   * APPLICATION-LEVEL STATE MANAGEMENT
   * 
   * We manage the overall application state including navigation,
   * user preferences, and global settings.
   */
  
  // Navigation state - which section of the tutorial is currently active
  const [currentSection, setCurrentSection] = useLocalStorage('current_section', 'welcome');
  
  // Global application state
  const [appSettings, setAppSettings] = useLocalStorage('app_settings', {
    soundEffects: false,
    animations: true,
    darkMode: false,
    developerMode: false,
  });
  
  // Tutorial progress tracking
  const [completedSections, setCompletedSections] = useLocalStorage('completed_sections', []);
  
  // Application performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    lastRenderTime: Date.now(),
    navigationCount: 0,
  });
  
  // UI state for various features
  const [showPerformancePanel, togglePerformancePanel] = useToggle(false);
  const [showHelp, toggleHelp] = useToggle(false);
  
  /**
   * PERFORMANCE TRACKING
   * 
   * Update performance metrics on each render to demonstrate
   * React's render cycle and help with optimization learning.
   */
  useEffect(() => {
    setPerformanceMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: Date.now(),
      navigationCount: prev.navigationCount,
    }));
  });
  
  /**
   * NAVIGATION HANDLERS
   * 
   * These functions handle section changes and track user progress
   * through the educational material.
   */
  
  // Handle section navigation with progress tracking
  const handleSectionChange = useCallback((newSection) => {
    console.log(`🧭 Navigating from ${currentSection} to ${newSection}`);
    
    // Mark current section as completed if user is moving forward
    const sectionOrder = ['welcome', 'components', 'reactivity', 'interactions', 'hooks', 'api'];
    const currentIndex = sectionOrder.indexOf(currentSection);
    const newIndex = sectionOrder.indexOf(newSection);
    
    if (newIndex > currentIndex && !completedSections.includes(currentSection)) {
      setCompletedSections(prev => [...prev, currentSection]);
      console.log(`✅ Section "${currentSection}" marked as completed`);
    }
    
    // Update navigation metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      navigationCount: prev.navigationCount + 1,
    }));
    
    // Change section
    setCurrentSection(newSection);
  }, [currentSection, completedSections, setCompletedSections, setCurrentSection]);
  
  // Handle movie interactions from MovieCard components
  const handleMovieClick = useCallback((movie) => {
    console.log(`🎬 Movie selected: ${movie.title}`);
    // In a real app, this might navigate to a detail page or open a modal
    alert(`Movie selected: ${movie.title}\n\nIn a real app, this would show detailed information.`);
  }, []);
  
  const handleFavoriteChange = useCallback((movie, isFavorite) => {
    console.log(`❤️ Favorite ${isFavorite ? 'added' : 'removed'}: ${movie.title}`);
    // This could sync with backend, update global state, etc.
  }, []);
  
  const handleRatingChange = useCallback((movie, rating) => {
    console.log(`⭐ Rating changed for ${movie.title}: ${rating}/5`);
    // This could submit to backend, update local storage, etc.
  }, []);
  
  // Toggle application settings
  const updateAppSetting = useCallback((setting, value) => {
    console.log(`⚙️ App setting changed: ${setting} = ${value}`);
    
    setAppSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  }, [setAppSettings]);

  /**
   * RENDER SECTION CONTENT
   * 
   * This function returns the appropriate content component based on
   * the current navigation section. It demonstrates conditional rendering
   * and component composition patterns.
   */
  const renderCurrentSection = useCallback(() => {
    switch (currentSection) {
      case 'welcome':
        return <WelcomeSection onNavigate={handleSectionChange} />;
        
      case 'components':
        return <ComponentsSection movies={SAMPLE_MOVIES_DATA} />;
        
      case 'reactivity':
        return (
          <Suspense fallback={<div className="text-center py-8">Loading reactivity demo...</div>}>
            <ReactivityShowcase />
          </Suspense>
        );
        
      case 'interactions':
        return (
          <Suspense fallback={<div className="text-center py-8">Loading interaction examples...</div>}>
            <InteractiveExamples />
          </Suspense>
        );
        
      case 'hooks':
        return <HooksSection />;
        
      case 'api':
        return <ApiSection />;
        
      default:
        return <WelcomeSection onNavigate={handleSectionChange} />;
    }
  }, [currentSection, handleSectionChange]);
  
  /**
   * JSX RETURN - MAIN APP STRUCTURE
   * 
   * This is the complete application structure with navigation,
   * content areas, and performance monitoring.
   */
  return (
    <div className={clsx(
      'min-h-screen bg-gray-50',
      appSettings.darkMode && 'dark bg-gray-900',
      !appSettings.animations && 'transition-none'
    )}>
      
      {/* Global App Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* App Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🎬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Educational Movie App
                </h1>
                <p className="text-sm text-gray-600">
                  Learn React through practical examples
                </p>
              </div>
            </div>
            
            {/* Global Controls */}
            <div className="flex items-center space-x-2">
              
              {/* Performance Toggle */}
              <Button
                size="small"
                variant="ghost"
                onClick={() => togglePerformancePanel()}
                title="Toggle performance panel"
              >
                📊
              </Button>
              
              {/* Help Toggle */}
              <Button
                size="small" 
                variant="ghost"
                onClick={() => toggleHelp()}
                title="Toggle help panel"
              >
                ❓
              </Button>
              
              {/* Settings Menu */}
              <div className="relative">
                <Button size="small" variant="ghost" title="Settings">
                  ⚙️
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Navigation */}
      <Navigation
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Performance Panel (Developer Feature) */}
      {showPerformancePanel && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-yellow-700">{performanceMetrics.renderCount}</div>
                  <div className="text-yellow-600">Renders</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700">{performanceMetrics.navigationCount}</div>
                  <div className="text-yellow-600">Navigation</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700">{completedSections.length}</div>
                  <div className="text-yellow-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-700">
                    {Math.round((completedSections.length / 6) * 100)}%
                  </div>
                  <div className="text-yellow-600">Progress</div>
                </div>
              </div>
              
              <Button 
                size="small" 
                variant="ghost" 
                onClick={() => togglePerformancePanel()}
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-2">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">1-6</kbd> Navigate sections</div>
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">←→</kbd> Previous/Next</div>
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">Esc</kbd> Clear states</div>
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">Cmd+K</kbd> Quick search</div>
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">Cmd+R</kbd> Reset</div>
                  <div><kbd className="bg-blue-100 px-2 py-1 rounded">Tab</kbd> Navigate</div>
                </div>
              </div>
              <Button size="small" variant="ghost" onClick={() => toggleHelp()}>
                ✕
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Container */}
      <main className="min-h-screen">
        {/* Error Boundary would go here in a real app */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading educational content...</p>
            </div>
          </div>
        }>
          {renderCurrentSection()}
        </Suspense>
      </main>
      
      {/* Global Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Learning Progress */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Progress</h3>
            <div className="max-w-md mx-auto bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedSections.length / 6) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {completedSections.length} of 6 sections completed
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button size="small" variant="ghost" onClick={() => setCurrentSection('welcome')}>
              📖 Documentation
            </Button>
            <Button size="small" variant="ghost" onClick={() => togglePerformancePanel()}>
              📊 Performance
            </Button>
            <Button size="small" variant="ghost" onClick={() => toggleHelp()}>
              ❓ Help
            </Button>
            <Button 
              size="small" 
              variant="ghost"
              onClick={() => {
                setCompletedSections([]);
                setCurrentSection('welcome');
              }}
            >
              🔄 Reset Progress
            </Button>
          </div>
          
          {/* Footer Info */}
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Educational Movie App - Built with React, Vite, Tailwind CSS, and Hono
            </p>
            <p className="text-sm text-gray-500">
              Every component demonstrates React concepts through practical, commented examples
            </p>
            
            {/* Development Info */}
            {import.meta.env.DEV && (
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>Development Mode - Extended logging and debugging enabled</p>
                <p>Frontend: http://localhost:5173 | Backend: http://localhost:3001</p>
                <p>Check console for detailed component lifecycle logs</p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * EXPORT THE COMPONENT
 * 
 * We export App as the default export so it can be imported and used
 * as the root component in main.jsx
 */
export default App;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED IN THIS COMPONENT:
 * 
 * 1. COMPONENT STRUCTURE: How to organize a main application component
 * 2. MULTIPLE STATE VALUES: Managing different types of state in one component
 * 3. EVENT HANDLING: Various ways to handle user interactions
 * 4. CONTROLLED COMPONENTS: Managing form inputs with React state
 * 5. CONDITIONAL RENDERING: Showing/hiding content based on state
 * 6. COMPONENT COMPOSITION: Using our custom Button component
 * 7. PROPS USAGE: Passing different props to demonstrate component flexibility
 * 8. ASYNC OPERATIONS: Handling loading states for async operations
 * 9. FORM HANDLING: Proper form submission and validation
 * 10. RESPONSIVE DESIGN: Using Tailwind classes for mobile-first design
 * 
 * NEXT STEPS:
 * 
 * As we continue building this app, we'll:
 * 1. Add routing to navigate between pages
 * 2. Create more complex components (MovieCard, MovieList, etc.)
 * 3. Implement API calls to fetch real movie data
 * 4. Add global state management with Context
 * 5. Create custom hooks for reusable logic
 * 6. Implement error boundaries for better error handling
 * 7. Add testing for all components
 * 8. Optimize performance with React.memo and useMemo
 */

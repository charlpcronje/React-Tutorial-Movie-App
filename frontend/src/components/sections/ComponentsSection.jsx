/**
 * ComponentsSection - Comprehensive Component Showcase
 * 
 * This section provides an in-depth demonstration of React components,
 * showcasing our Button and MovieCard components along with advanced
 * component patterns. It serves as both education and practical example:
 * 
 * 1. COMPONENT VARIANTS: Different visual styles and behaviors
 * 2. COMPONENT COMPOSITION: Building complex UIs from simple components
 * 3. PROPS FLOW: How data flows through component hierarchies
 * 4. STATE MANAGEMENT: Local vs shared state patterns
 * 5. EVENT HANDLING: Component communication through callbacks
 * 6. PERFORMANCE: React.memo, useMemo, and useCallback in action
 * 7. ACCESSIBILITY: Screen readers, keyboard navigation, ARIA
 * 8. RESPONSIVE DESIGN: Components that work on all screen sizes
 * 9. ERROR HANDLING: Graceful degradation and error boundaries
 * 10. TESTING PATTERNS: How components should be designed for testing
 * 
 * Every pattern demonstrated here is commented extensively for learning.
 */

// React imports for advanced component patterns
import React, { useState, useCallback, useMemo, Suspense } from 'react';

// Our educational components
import Button from '../ui/Button.jsx';

// Custom hooks for state management  
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { useModal, useDisclosure } from '../../hooks/useToggle.js';

// Utilities
import { clsx } from 'clsx';

// Lazy load MovieCard for performance demonstration
const MovieCard = React.lazy(() => import('../features/MovieCard.jsx'));

/**
 * ComponentsSection Component Definition
 * 
 * @param {Object} props - Component props
 * @param {Array} props.movies - Array of movie objects for demonstration
 */
function ComponentsSection({ movies = [] }) {
  console.log('🧩 ComponentsSection component rendering with', movies.length, 'movies');
  
  /**
   * COMPONENT STATE MANAGEMENT
   * 
   * We manage various pieces of state to demonstrate different patterns
   * and show how components can control their own behavior.
   */
  
  // Button demonstration state
  const [buttonVariant, setButtonVariant] = useState('primary');
  const [buttonSize, setButtonSize] = useState('medium');
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  
  // MovieCard demonstration state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cardSize, setCardSize] = useState('medium');
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [enableCardAnimations, setEnableCardAnimations] = useState(true);
  
  // Interactive demo state
  const [favoriteMovies, setFavoriteMovies] = useLocalStorage('demo_favorites', []);
  const [movieRatings, setMovieRatings] = useLocalStorage('demo_ratings', {});
  
  // UI state
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();
  const { isDisclosed: showCode, toggle: toggleCode } = useDisclosure();
  
  /**
   * COMPUTED VALUES FOR DEMONSTRATIONS
   * 
   * These values demonstrate how React automatically updates derived state.
   */
  
  // Button configuration object (demonstrates object composition)
  const currentButtonConfig = useMemo(() => ({
    variant: buttonVariant,
    size: buttonSize,
    loading: isButtonLoading,
    disabled: isButtonDisabled,
    // Generate sample text based on config
    text: `${buttonSize.charAt(0).toUpperCase() + buttonSize.slice(1)} ${buttonVariant} Button`,
  }), [buttonVariant, buttonSize, isButtonLoading, isButtonDisabled]);
  
  // Movie statistics (demonstrates array processing)
  const movieStats = useMemo(() => {
    if (!movies.length) return null;
    
    const favoriteIds = favoriteMovies.map(m => m.id);
    const ratedMovies = Object.keys(movieRatings);
    
    return {
      total: movies.length,
      favorites: favoriteIds.length,
      rated: ratedMovies.length,
      averageRating: ratedMovies.length > 0 
        ? (Object.values(movieRatings).reduce((sum, rating) => sum + rating, 0) / ratedMovies.length).toFixed(1)
        : 0,
      highestRated: movies.reduce((highest, movie) => 
        movie.voteAverage > (highest?.voteAverage || 0) ? movie : highest, null
      ),
    };
  }, [movies, favoriteMovies, movieRatings]);
  
  /**
   * EVENT HANDLERS
   * 
   * These functions demonstrate component communication patterns
   * and state update strategies.
   */
  
  // Handle button configuration changes
  const handleButtonVariantChange = useCallback((newVariant) => {
    console.log(`🎨 Button variant changed to: ${newVariant}`);
    setButtonVariant(newVariant);
  }, []);
  
  const handleButtonSizeChange = useCallback((newSize) => {
    console.log(`📏 Button size changed to: ${newSize}`);
    setButtonSize(newSize);
  }, []);
  
  // Simulate loading state
  const simulateButtonLoading = useCallback(async () => {
    console.log('⏳ Simulating button loading state...');
    setIsButtonLoading(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsButtonLoading(false);
    console.log('✅ Button loading simulation completed');
  }, []);
  
  // Handle movie interactions
  const handleMovieClick = useCallback((movie) => {
    console.log(`🎬 Movie clicked: ${movie.title}`);
    setSelectedMovie(movie);
    openModal();
  }, [openModal]);
  
  const handleFavoriteChange = useCallback((movie, isFavorite) => {
    console.log(`❤️ Favorite ${isFavorite ? 'added' : 'removed'}: ${movie.title}`);
    
    setFavoriteMovies(prev => {
      if (isFavorite) {
        // Add to favorites if not already there
        return prev.some(fav => fav.id === movie.id) ? prev : [...prev, movie];
      } else {
        // Remove from favorites
        return prev.filter(fav => fav.id !== movie.id);
      }
    });
  }, [setFavoriteMovies]);
  
  const handleRatingChange = useCallback((movie, rating) => {
    console.log(`⭐ Rating changed for ${movie.title}: ${rating}/5`);
    
    setMovieRatings(prev => ({
      ...prev,
      [movie.id]: rating * 2 // Convert to 10-point scale
    }));
  }, [setMovieRatings]);
  
  /**
   * COMPONENT RENDER
   * 
   * The educational showcase with interactive examples and explanations.
   */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* Section Header */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          React Components Deep Dive
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Learn component architecture, props, state, and composition through interactive examples.
          Every pattern you see here is used in production React applications.
        </p>
      </header>
      
      {/* Button Component Showcase */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Button Component Showcase
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Explore our Button component's variants, sizes, and states.
              Notice how props control every aspect of the component's appearance and behavior.
            </p>
          </div>
          
          <Button size="small" variant="ghost" onClick={toggleCode}>
            {showCode ? 'Hide' : 'Show'} Code
          </Button>
        </div>
        
        {/* Interactive Button Configuration */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Configuration Panel */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interactive Configuration</h3>
            
            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Button Variant (changes color and style)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['primary', 'secondary', 'danger', 'ghost'].map(variant => (
                  <Button
                    key={variant}
                    size="small"
                    variant={buttonVariant === variant ? 'primary' : 'secondary'}
                    onClick={() => handleButtonVariantChange(variant)}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Button Size (changes padding and text size)
              </label>
              <div className="flex space-x-2">
                {['small', 'medium', 'large'].map(size => (
                  <Button
                    key={size}
                    size="small"
                    variant={buttonSize === size ? 'primary' : 'secondary'}
                    onClick={() => handleButtonSizeChange(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* State Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Button States (affects interaction and appearance)
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isButtonDisabled}
                    onChange={(e) => setIsButtonDisabled(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Disabled state</span>
                </label>
                
                <div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={simulateButtonLoading}
                    disabled={isButtonLoading}
                  >
                    {isButtonLoading ? 'Loading...' : 'Test Loading State'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Current Configuration Display */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Configuration:</h4>
              <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono">
{`<Button
  variant="${currentButtonConfig.variant}"
  size="${currentButtonConfig.size}"${isButtonLoading ? '\n  loading={true}' : ''}${isButtonDisabled ? '\n  disabled={true}' : ''}
  onClick={handleClick}
>
  ${currentButtonConfig.text}
</Button>`}
              </pre>
            </div>
          </div>
          
          {/* Live Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
            
            {/* Main Button Demo */}
            <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Button
                variant={buttonVariant}
                size={buttonSize}
                loading={isButtonLoading}
                disabled={isButtonDisabled}
                onClick={() => alert(`Button clicked!\nVariant: ${buttonVariant}\nSize: ${buttonSize}`)}
              >
                {currentButtonConfig.text}
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                ☝️ Click the button to see it in action
              </p>
            </div>
            
            {/* Size Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Size Comparison</h4>
              <div className="flex items-center justify-center space-x-4">
                <Button size="small" variant={buttonVariant}>Small</Button>
                <Button size="medium" variant={buttonVariant}>Medium</Button>
                <Button size="large" variant={buttonVariant}>Large</Button>
              </div>
            </div>
            
            {/* Variant Gallery */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Variant Gallery</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="primary" size={buttonSize}>Primary</Button>
                <Button variant="secondary" size={buttonSize}>Secondary</Button>
                <Button variant="danger" size={buttonSize}>Danger</Button>
                <Button variant="ghost" size={buttonSize}>Ghost</Button>
              </div>
            </div>
            
            {/* State Examples */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">State Examples</h4>
              <div className="space-y-2">
                <Button variant={buttonVariant} size={buttonSize} disabled>
                  Disabled Button
                </Button>
                <Button variant={buttonVariant} size={buttonSize} loading>
                  Loading Button
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Example */}
        {showCode && (
          <div className="mt-8 animate-fade-in">
            <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
              <h4 className="text-green-400 font-bold mb-4">// Button Component Usage Examples</h4>
              <pre className="text-sm">
{`// Basic usage with different variants
<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>  
<Button variant="danger">Delete Item</Button>
<Button variant="ghost">Skip Step</Button>

// Different sizes for different contexts
<Button size="small">Toolbar Action</Button>
<Button size="medium">Form Button</Button>
<Button size="large">Hero CTA</Button>

// Interactive states
<Button loading={isSubmitting} disabled={!isValid}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Event handling
<Button onClick={() => handleAction()}>
  Click Me
</Button>

// Form integration
<Button type="submit" variant="primary">
  Submit Form
</Button>`}
              </pre>
            </div>
          </div>
        )}
      </section>
      
      {/* MovieCard Component Showcase */}
      <section className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            MovieCard Component Showcase
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Our MovieCard component demonstrates complex component composition,
            multiple interaction patterns, and real-world data handling.
          </p>
        </div>
        
        {/* MovieCard Configuration */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Component Configuration</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Card Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Size
              </label>
              <div className="flex space-x-1">
                {['small', 'medium', 'large'].map(size => (
                  <Button
                    key={size}
                    size="small"
                    variant={cardSize === size ? 'primary' : 'secondary'}
                    onClick={() => setCardSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Feature Toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features
              </label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showCardDetails}
                    onChange={(e) => setShowCardDetails(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show details</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableCardAnimations}
                    onChange={(e) => setEnableCardAnimations(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable animations</span>
                </label>
              </div>
            </div>
            
            {/* Statistics Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demo Statistics
              </label>
              {movieStats && (
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <div>Total movies: {movieStats.total}</div>
                  <div>Favorites: {movieStats.favorites}</div>
                  <div>Rated: {movieStats.rated}</div>
                  {movieStats.averageRating > 0 && (
                    <div>Avg rating: {movieStats.averageRating}/10</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* MovieCard Grid Demonstration */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">
            Interactive Movie Grid
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              (Click movies to interact, try favoriting and rating)
            </span>
          </h3>
          
          {movies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🎬</div>
              <p>No movies available for demonstration</p>
              <p className="text-sm mt-2">Check the sample data in App.jsx</p>
            </div>
          ) : (
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80"></div>
                  </div>
                ))}
              </div>
            }>
              <div className={clsx(
                'grid gap-6 transition-all duration-300',
                cardSize === 'small' && 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6',
                cardSize === 'medium' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                cardSize === 'large' && 'grid-cols-1 md:grid-cols-2'
              )}>
                {movies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size={cardSize}
                    showDetails={showCardDetails}
                    enableAnimations={enableCardAnimations}
                    onMovieClick={handleMovieClick}
                    onFavoriteChange={handleFavoriteChange}
                    onRatingChange={handleRatingChange}
                    className="transform transition-all duration-200"
                  />
                ))}
              </div>
            </Suspense>
          )}
        </div>
        
        {/* Component Communication Demo */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Component Communication Demo</h4>
          <p className="text-sm text-blue-800 mb-3">
            Watch how parent components receive data from child components through callbacks.
            This is a fundamental React pattern for component communication.
          </p>
          
          {/* Recent Interactions Display */}
          <div className="bg-white p-3 rounded border">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recent Interactions:</h5>
            {favoriteMovies.length === 0 && Object.keys(movieRatings).length === 0 ? (
              <p className="text-sm text-gray-500">
                No interactions yet. Try clicking the heart icon or rating a movie above.
              </p>
            ) : (
              <div className="space-y-1 text-sm">
                {favoriteMovies.map(movie => (
                  <div key={`fav-${movie.id}`} className="flex items-center space-x-2">
                    <span className="text-red-500">❤️</span>
                    <span>Added "{movie.title}" to favorites</span>
                  </div>
                ))}
                {Object.entries(movieRatings).map(([movieId, rating]) => {
                  const movie = movies.find(m => m.id === parseInt(movieId));
                  return movie ? (
                    <div key={`rating-${movieId}`} className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span>Rated "{movie.title}" {rating}/10</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Component Composition Examples */}
      <section className="card">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Component Composition Patterns
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Learn how to build complex UIs by composing simple components together.
          This is the heart of React development - building large applications from small, focused pieces.
        </p>
        
        {/* Composition Examples */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Simple Composition */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Simple Composition</h3>
            
            {/* Alert Component (composed of multiple elements) */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Info Alert Component</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    This alert is composed of: icon + content + optional action button
                  </p>
                </div>
                <Button size="small" variant="ghost">
                  ✕
                </Button>
              </div>
            </div>
            
            {/* Card with Header/Body/Footer */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">Card Header</h4>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm">
                  This card demonstrates the header/body/footer composition pattern.
                  Each section has its own responsibility and styling.
                </p>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
                <Button size="small" variant="secondary">Cancel</Button>
                <Button size="small" variant="primary">Confirm</Button>
              </div>
            </div>
          </div>
          
          {/* Complex Composition */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Complex Composition</h3>
            
            {/* Feature Card with Multiple Components */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Feature Showcase</h4>
                    <p className="text-sm text-gray-500">Multiple components working together</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="small" variant="ghost" title="Refresh">🔄</Button>
                  <Button size="small" variant="ghost" title="Settings">⚙️</Button>
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Learning Progress</span>
                  <span className="text-sm text-gray-500">75%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
              </div>
              
              {/* Action Grid */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="small" variant="primary">Continue</Button>
                <Button size="small" variant="secondary">Review</Button>
                <Button size="small" variant="ghost">Skip</Button>
                <Button size="small" variant="ghost">Help</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Props and State Demonstration */}
      <section className="card">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Props vs State Demonstration
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Understanding the difference between props and state is crucial for React development.
          Props flow down from parent to child, while state is managed locally within components.
        </p>
        
        <PropsStateDemo />
      </section>
      
      {/* Modal Example */}
      {isModalOpen && selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMovie.title}
                </h2>
                <Button size="small" variant="ghost" onClick={closeModal}>
                  ✕
                </Button>
              </div>
              
              {/* Movie Details */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {selectedMovie.posterUrl ? (
                    <img
                      src={selectedMovie.posterUrl}
                      alt={`${selectedMovie.title} poster`}
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-80 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🎬</span>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Overview</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedMovie.overview}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Year:</span>
                        <span className="ml-2 text-gray-600">{selectedMovie.releaseYear}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Rating:</span>
                        <span className="ml-2 text-gray-600">{selectedMovie.voteAverage}/10</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-900">Genres:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedMovie.genres.map(genre => (
                          <span
                            key={genre.id}
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={closeModal}>
                  Close
                </Button>
                <Button variant="primary">
                  Watch Trailer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PropsStateDemo - Demonstrates props vs state patterns
 */
function PropsStateDemo() {
  // Parent state that will be passed as props to child components
  const [parentMessage, setParentMessage] = useState('Hello from parent!');
  const [parentCounter, setParentCounter] = useState(0);
  
  return (
    <div className="grid md:grid-cols-2 gap-8">
      
      {/* Parent Component Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Parent Component (manages state)
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Message (passed as props)
            </label>
            <input
              type="text"
              value={parentMessage}
              onChange={(e) => setParentMessage(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Counter: {parentCounter}
            </label>
            <div className="flex space-x-2">
              <Button
                size="small"
                onClick={() => setParentCounter(prev => prev + 1)}
              >
                Increment
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setParentCounter(0)}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Child Component Demo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Child Component (receives props)
        </h3>
        
        <ChildComponentDemo 
          message={parentMessage}
          counter={parentCounter}
          onCounterChange={setParentCounter}
        />
      </div>
    </div>
  );
}

/**
 * ChildComponentDemo - Demonstrates receiving and using props
 */
function ChildComponentDemo({ message, counter, onCounterChange }) {
  // Local state (not passed from parent)
  const [localState, setLocalState] = useState('Child local state');
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Child Component View</h4>
      
      <div className="space-y-3 text-sm">
        {/* Props from parent */}
        <div className="bg-green-100 p-2 rounded">
          <strong className="text-green-800">Props from parent:</strong>
          <div className="text-green-700 mt-1">
            <div>Message: "{message}"</div>
            <div>Counter: {counter}</div>
          </div>
        </div>
        
        {/* Local state */}
        <div className="bg-blue-100 p-2 rounded">
          <strong className="text-blue-800">Local state:</strong>
          <div className="text-blue-700 mt-1">
            <div>"{localState}"</div>
            <input
              type="text"
              value={localState}
              onChange={(e) => setLocalState(e.target.value)}
              className="form-input mt-1 text-xs"
            />
          </div>
        </div>
        
        {/* Communication back to parent */}
        <div className="bg-purple-100 p-2 rounded">
          <strong className="text-purple-800">Communicate to parent:</strong>
          <div className="mt-2 flex space-x-1">
            <Button
              size="small"
              onClick={() => onCounterChange(counter + 5)}
            >
              +5 to Parent
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => onCounterChange(0)}
            >
              Reset Parent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentsSection;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPONENT ARCHITECTURE:
 *    - Single responsibility principle
 *    - Clear component boundaries
 *    - Reusable component patterns
 * 
 * 2. PROPS FLOW:
 *    - Data flowing down through component trees
 *    - Props vs state distinction
 *    - Component communication patterns
 * 
 * 3. STATE MANAGEMENT:
 *    - Local component state with useState
 *    - Complex state with useReducer
 *    - State lifting and sharing
 * 
 * 4. EVENT HANDLING:
 *    - Callback props for parent-child communication
 *    - Event object handling
 *    - State updates in response to events
 * 
 * 5. CONDITIONAL RENDERING:
 *    - Showing/hiding content based on state
 *    - Dynamic class application
 *    - Progressive disclosure patterns
 * 
 * 6. PERFORMANCE PATTERNS:
 *    - React.memo for preventing unnecessary re-renders
 *    - useCallback for stable function references
 *    - useMemo for expensive computations
 * 
 * This section provides a comprehensive foundation for understanding
 * how React components work in isolation and composition.
 */
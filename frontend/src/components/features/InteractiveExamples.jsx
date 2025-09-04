/**
 * InteractiveExamples Component - Comprehensive React Interaction Patterns
 * 
 * This component serves as a comprehensive showcase of how React components
 * can be interactive and reactive. It demonstrates real-world patterns that
 * you'll use in every React application:
 * 
 * 1. FORM INTERACTIONS: Input handling, validation, submission
 * 2. LIST MANIPULATION: Adding, removing, sorting, filtering items
 * 3. DRAG AND DROP: Interactive reordering and organization
 * 4. REAL-TIME UPDATES: Live data and reactive interfaces
 * 5. MULTI-STEP WORKFLOWS: Wizards and progressive disclosure
 * 6. DATA VISUALIZATION: Interactive charts and progress indicators
 * 7. SEARCH AND FILTERING: Real-time search with multiple filters
 * 8. KEYBOARD INTERACTIONS: Shortcuts and accessibility
 * 9. ANIMATION COORDINATION: Smooth transitions and feedback
 * 10. ERROR RECOVERY: User-friendly error handling and recovery
 * 
 * Each section demonstrates specific interaction patterns with detailed
 * explanations of the React concepts being used.
 */

// React imports for interactive patterns
import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  useReducer 
} from 'react';

// Our custom components and hooks
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import useToggle, { useModal, useDisclosure } from '../../hooks/useToggle.js';

// Utilities
import { clsx } from 'clsx';

/**
 * SAMPLE DATA FOR DEMONSTRATIONS
 * 
 * We create sample data that mimics real application data
 * to make our examples more realistic and educational.
 */

// Sample movie data for list manipulation examples
const SAMPLE_MOVIES = [
  { id: 1, title: "The Shawshank Redemption", year: 1994, rating: 9.3, genre: "Drama" },
  { id: 2, title: "The Godfather", year: 1972, rating: 9.2, genre: "Crime" },
  { id: 3, title: "The Dark Knight", year: 2008, rating: 9.0, genre: "Action" },
  { id: 4, title: "Pulp Fiction", year: 1994, rating: 8.9, genre: "Crime" },
  { id: 5, title: "Forrest Gump", year: 1994, rating: 8.8, genre: "Drama" },
  { id: 6, title: "Inception", year: 2010, rating: 8.7, genre: "Sci-Fi" },
  { id: 7, title: "The Matrix", year: 1999, rating: 8.7, genre: "Sci-Fi" },
  { id: 8, title: "Goodfellas", year: 1990, rating: 8.7, genre: "Crime" },
];

// Sample genres for filtering
const MOVIE_GENRES = ["All", "Action", "Crime", "Drama", "Sci-Fi"];

/**
 * REDUCER FOR COMPLEX LIST MANAGEMENT
 * 
 * This demonstrates how useReducer can handle complex list operations
 * with proper state management.
 */
const listReducer = (state, action) => {
  console.log('📋 List action:', action.type, action.payload);
  
  switch (action.type) {
    case 'ADD_MOVIE':
      return {
        ...state,
        movies: [...state.movies, { ...action.payload, id: Date.now() }],
        lastAction: `Added "${action.payload.title}"`,
      };
      
    case 'REMOVE_MOVIE':
      const movieToRemove = state.movies.find(m => m.id === action.payload);
      return {
        ...state,
        movies: state.movies.filter(movie => movie.id !== action.payload),
        lastAction: movieToRemove ? `Removed "${movieToRemove.title}"` : 'Removed movie',
      };
      
    case 'UPDATE_MOVIE':
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie.id === action.payload.id ? { ...movie, ...action.payload.updates } : movie
        ),
        lastAction: `Updated movie #${action.payload.id}`,
      };
      
    case 'REORDER_MOVIES':
      return {
        ...state,
        movies: action.payload,
        lastAction: 'Reordered movies',
      };
      
    case 'RESET_MOVIES':
      return {
        ...state,
        movies: [...SAMPLE_MOVIES],
        lastAction: 'Reset to original list',
      };
      
    default:
      return state;
  }
};

/**
 * InteractiveExamples Component
 * 
 * The main component that showcases various interactive patterns.
 */
function InteractiveExamples() {
  console.log('🎮 InteractiveExamples component rendering...');
  
  /**
   * STATE FOR DIFFERENT INTERACTION EXAMPLES
   */
  
  // Movie list management with useReducer
  const [listState, listDispatch] = useReducer(listReducer, {
    movies: [...SAMPLE_MOVIES],
    lastAction: null,
  });
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOrder, setSortOrder] = useState('rating'); // rating, year, title
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Form state for adding new movies
  const [newMovie, setNewMovie] = useState({
    title: '',
    year: new Date().getFullYear(),
    rating: 5.0,
    genre: 'Drama'
  });
  
  // UI state
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();
  const { isDisclosed: showAdvanced, toggle: toggleAdvanced } = useDisclosure();
  
  // Interactive state
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Performance tracking
  const renderCount = useRef(0);
  const [lastActionTime, setLastActionTime] = useState(null);
  
  renderCount.current++;
  
  /**
   * COMPUTED VALUES - REACTIVE FILTERING AND SORTING
   * 
   * These values automatically update when search, filter, or sort criteria change.
   */
  const filteredAndSortedMovies = useMemo(() => {
    console.log('🔄 Recomputing filtered and sorted movies...');
    
    let filtered = listState.movies;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.genre.toLowerCase().includes(query)
      );
    }
    
    // Apply genre filter
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(movie => movie.genre === selectedGenre);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortOrder) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [listState.movies, searchQuery, selectedGenre, sortOrder, sortDirection]);
  
  // Search statistics
  const searchStats = useMemo(() => {
    return {
      totalMovies: listState.movies.length,
      filteredMovies: filteredAndSortedMovies.length,
      hiddenMovies: listState.movies.length - filteredAndSortedMovies.length,
      hasSearch: searchQuery.trim().length > 0,
      hasGenreFilter: selectedGenre !== 'All',
      averageRating: filteredAndSortedMovies.length > 0 
        ? (filteredAndSortedMovies.reduce((sum, movie) => sum + movie.rating, 0) / filteredAndSortedMovies.length).toFixed(1)
        : 0,
    };
  }, [listState.movies.length, filteredAndSortedMovies, searchQuery, selectedGenre]);
  
  /**
   * EVENT HANDLERS FOR INTERACTIONS
   */
  
  // Handle adding a new movie
  const handleAddMovie = useCallback((event) => {
    event.preventDefault();
    
    // Validate form data
    if (!newMovie.title.trim()) {
      alert('Movie title is required!');
      return;
    }
    
    console.log('🎬 Adding new movie:', newMovie);
    
    // Add movie to list
    listDispatch({
      type: 'ADD_MOVIE',
      payload: { ...newMovie }
    });
    
    // Reset form
    setNewMovie({
      title: '',
      year: new Date().getFullYear(),
      rating: 5.0,
      genre: 'Drama'
    });
    
    setLastActionTime(Date.now());
  }, [newMovie]);
  
  // Handle removing a movie
  const handleRemoveMovie = useCallback((movieId) => {
    console.log('🗑️ Removing movie:', movieId);
    
    listDispatch({
      type: 'REMOVE_MOVIE',
      payload: movieId
    });
    
    setLastActionTime(Date.now());
  }, []);
  
  // Handle editing a movie rating
  const handleRatingChange = useCallback((movieId, newRating) => {
    console.log(`⭐ Updating rating for movie ${movieId}: ${newRating}`);
    
    listDispatch({
      type: 'UPDATE_MOVIE',
      payload: {
        id: movieId,
        updates: { rating: newRating }
      }
    });
    
    setLastActionTime(Date.now());
  }, []);
  
  // Handle search input with debouncing effect
  const handleSearchChange = useCallback((event) => {
    const newQuery = event.target.value;
    console.log(`🔍 Search query changed: "${newQuery}"`);
    setSearchQuery(newQuery);
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    console.log('🧹 Clearing all filters');
    setSearchQuery('');
    setSelectedGenre('All');
    setSortOrder('rating');
    setSortDirection('desc');
  }, []);
  
  /**
   * DRAG AND DROP HANDLERS
   * 
   * These demonstrate interactive reordering with visual feedback.
   */
  const handleDragStart = useCallback((event, movieId) => {
    console.log('🏗️ Drag started for movie:', movieId);
    setDraggedItem(movieId);
    event.dataTransfer.setData('text/plain', movieId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const handleDragEnd = useCallback(() => {
    console.log('🏁 Drag ended');
    setDraggedItem(null);
    setHoveredItem(null);
  }, []);
  
  const handleDragOver = useCallback((event, movieId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setHoveredItem(movieId);
  }, []);
  
  const handleDrop = useCallback((event, targetMovieId) => {
    event.preventDefault();
    
    const draggedMovieId = parseInt(event.dataTransfer.getData('text/plain'));
    console.log(`📦 Dropped movie ${draggedMovieId} onto ${targetMovieId}`);
    
    if (draggedMovieId === targetMovieId) return;
    
    // Reorder the movies
    const newMovies = [...filteredAndSortedMovies];
    const draggedIndex = newMovies.findIndex(m => m.id === draggedMovieId);
    const targetIndex = newMovies.findIndex(m => m.id === targetMovieId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item and insert at new position
      const [draggedMovie] = newMovies.splice(draggedIndex, 1);
      newMovies.splice(targetIndex, 0, draggedMovie);
      
      listDispatch({
        type: 'REORDER_MOVIES',
        payload: newMovies
      });
    }
    
    setDraggedItem(null);
    setHoveredItem(null);
    setLastActionTime(Date.now());
  }, [filteredAndSortedMovies]);
  
  /**
   * KEYBOARD SHORTCUT HANDLING
   * 
   * Demonstrates how to add keyboard shortcuts for power users.
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Handle keyboard shortcuts
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case 'k':
            event.preventDefault();
            document.getElementById('movie-search')?.focus();
            console.log('⌨️ Quick search activated');
            break;
            
          case 'r':
            event.preventDefault();
            listDispatch({ type: 'RESET_MOVIES' });
            console.log('⌨️ Reset movies via keyboard');
            break;
            
          case 'n':
            event.preventDefault();
            document.getElementById('new-movie-title')?.focus();
            console.log('⌨️ New movie form activated');
            break;
        }
      }
      
      // Escape key handling
      if (event.key === 'Escape') {
        clearFilters();
        setSelectedMovieId(null);
        closeModal();
        console.log('⌨️ Escape pressed - cleared states');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearFilters, closeModal]);
  
  /**
   * COMPONENT RENDER
   * 
   * The visual interface showcasing all interactive patterns.
   */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* Header with Keyboard Shortcuts */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Interactive React Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Explore real-world interaction patterns and see how React handles complex user interactions
        </p>
        
        {/* Keyboard Shortcuts Guide */}
        <div className="inline-flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
          <span><kbd className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">Cmd+K</kbd> Quick search</span>
          <span><kbd className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">Cmd+N</kbd> New movie</span>
          <span><kbd className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">Cmd+R</kbd> Reset</span>
          <span><kbd className="bg-gray-200 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">Esc</kbd> Clear</span>
        </div>
      </header>
      
      {/* Search and Filter Section */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Real-Time Search & Filtering</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Type in the search box and watch the results update instantly. 
          Change filters and see immediate feedback. This demonstrates reactive UI patterns.
        </p>
        
        {/* Search and Filter Controls */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="movie-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔍 Search Movies
            </label>
            <input
              id="movie-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="form-input"
              placeholder="Search by title or genre..."
            />
          </div>
          
          {/* Genre Filter */}
          <div>
            <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎭 Genre Filter
            </label>
            <select
              id="genre-filter"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="form-input"
            >
              {MOVIE_GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          {/* Sort Options */}
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📊 Sort By
            </label>
            <div className="flex space-x-1">
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input flex-1"
              >
                <option value="rating">Rating</option>
                <option value="year">Year</option>
                <option value="title">Title</option>
              </select>
              
              <Button
                size="small"
                variant="secondary"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2"
                title={`Currently: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search Statistics */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{searchStats.filteredMovies}</div>
              <div className="text-xs text-blue-800 dark:text-blue-200">Showing</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{searchStats.totalMovies}</div>
              <div className="text-xs text-blue-800 dark:text-blue-200">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{searchStats.hiddenMovies}</div>
              <div className="text-xs text-blue-800 dark:text-blue-200">Hidden</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{searchStats.averageRating}</div>
              <div className="text-xs text-blue-800 dark:text-blue-200">Avg Rating</div>
            </div>
            <div>
              <Button size="small" variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results Display */}
        <div className="space-y-3">
          {filteredAndSortedMovies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-lg">No movies found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredAndSortedMovies.map((movie, index) => (
              <div
                key={movie.id}
                className={clsx(
                  'p-4 border rounded-lg transition-all duration-200 cursor-move',
                  'hover:shadow-md hover:border-gray-300',
                  selectedMovieId === movie.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
                  draggedItem === movie.id ? 'opacity-50 scale-95' : 'opacity-100',
                  hoveredItem === movie.id && draggedItem && draggedItem !== movie.id ? 'border-dashed border-blue-400' : ''
                )}
                draggable
                onDragStart={(e) => handleDragStart(e, movie.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, movie.id)}
                onDrop={(e) => handleDrop(e, movie.id)}
                onClick={() => setSelectedMovieId(movie.id === selectedMovieId ? null : movie.id)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${movie.title}`}
              >
                <div className="flex items-center justify-between">
                  {/* Movie Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded text-sm font-bold text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {movie.title}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({movie.year})</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {movie.genre} • ⭐ {movie.rating}/10
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Interactive Rating */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRatingChange(movie.id, star * 2); // Convert to 10-point scale
                          }}
                          className={clsx(
                            'text-sm transition-colors',
                            star * 2 <= movie.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600',
                            'hover:text-yellow-300 dark:hover:text-yellow-400 hover:scale-110'
                          )}
                          aria-label={`Rate ${star} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      size="small"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMovie(movie.id);
                      }}
                      aria-label={`Remove ${movie.title}`}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {selectedMovieId === movie.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <strong>Rating:</strong> {movie.rating}/10
                      </div>
                      <div>
                        <strong>Genre:</strong> {movie.genre}
                      </div>
                      <div>
                        <strong>Year:</strong> {movie.year}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button size="small" variant="primary" onClick={openModal}>
                        View Details
                      </Button>
                      <Button size="small" variant="secondary">
                        Add to Favorites
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Add New Movie Form */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Dynamic Form Interactions</h2>
          <Button 
            size="small" 
            variant="ghost" 
            onClick={toggleAdvanced}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This form demonstrates controlled components, validation, and dynamic UI updates.
          Watch how the form reacts to your input and provides real-time feedback.
        </p>
        
        <form onSubmit={handleAddMovie} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Movie Title */}
            <div>
              <label htmlFor="new-movie-title" className="block text-sm font-medium text-gray-700 mb-2">
                🎬 Movie Title *
              </label>
              <input
                id="new-movie-title"
                type="text"
                value={newMovie.title}
                onChange={(e) => setNewMovie(prev => ({ ...prev, title: e.target.value }))}
                className={clsx(
                  'form-input',
                  newMovie.title.trim() ? 'border-green-300 focus:border-green-500' : 'border-gray-300'
                )}
                placeholder="Enter movie title..."
                required
              />
              
              {/* Real-time character count */}
              <p className="text-xs text-gray-500 mt-1">
                {newMovie.title.length}/100 characters
                {newMovie.title.length > 50 && (
                  <span className="text-yellow-600 ml-2">Consider shortening</span>
                )}
              </p>
            </div>
            
            {/* Release Year */}
            <div>
              <label htmlFor="new-movie-year" className="block text-sm font-medium text-gray-700 mb-2">
                📅 Release Year
              </label>
              <input
                id="new-movie-year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 5}
                value={newMovie.year}
                onChange={(e) => setNewMovie(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Genre Selection */}
            <div>
              <label htmlFor="new-movie-genre" className="block text-sm font-medium text-gray-700 mb-2">
                🎭 Genre
              </label>
              <select
                id="new-movie-genre"
                value={newMovie.genre}
                onChange={(e) => setNewMovie(prev => ({ ...prev, genre: e.target.value }))}
                className="form-input"
              >
                {MOVIE_GENRES.filter(g => g !== 'All').map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            
            {/* Rating Slider */}
            <div>
              <label htmlFor="new-movie-rating" className="block text-sm font-medium text-gray-700 mb-2">
                ⭐ Rating: {newMovie.rating}/10
              </label>
              <input
                id="new-movie-rating"
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={newMovie.rating}
                onChange={(e) => setNewMovie(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              
              {/* Rating Visualization */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span className={clsx(
                  'font-medium',
                  newMovie.rating >= 7 ? 'text-green-600' : 
                  newMovie.rating >= 5 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {newMovie.rating >= 8 ? 'Excellent' :
                   newMovie.rating >= 7 ? 'Good' :
                   newMovie.rating >= 5 ? 'Average' : 'Poor'}
                </span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
          
          {/* Advanced Options */}
          {showAdvanced && (
            <div className="bg-gray-50 p-4 rounded-lg animate-fade-in">
              <h3 className="font-medium text-gray-900 mb-3">Advanced Options</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Target Audience
                  </label>
                  <div className="space-y-1">
                    {['General', 'Teen', 'Adult'].map(audience => (
                      <label key={audience} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="audience"
                          value={audience}
                          className="text-blue-600"
                        />
                        <span className="text-sm">{audience}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏷️ Tags
                  </label>
                  <div className="space-y-1">
                    {['Blockbuster', 'Indie', 'Award Winner', 'Cult Classic'].map(tag => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setNewMovie({
                  title: '',
                  year: new Date().getFullYear(),
                  rating: 5.0,
                  genre: 'Drama'
                })}
              >
                Clear Form
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                disabled={!newMovie.title.trim()}
              >
                Add Movie
              </Button>
            </div>
          </div>
          
          {/* Form Preview */}
          {newMovie.title.trim() && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-2">Preview:</p>
              <p className="text-sm text-green-700">
                "{newMovie.title}" ({newMovie.year}) - {newMovie.genre} - ⭐ {newMovie.rating}/10
              </p>
            </div>
          )}
        </form>
      </section>
      
      {/* Multi-Step Workflow Example */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">3. Multi-Step Workflow</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates progressive disclosure and multi-step processes.
          Each step builds on the previous one, showing how React manages complex workflows.
        </p>
        
        <WorkflowWizard />
      </section>
      
      {/* Real-Time Data Updates */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">4. Real-Time Updates & Live Data</h2>
        <p className="text-gray-600 mb-6">
          Watch how React handles live data updates and real-time synchronization.
          This simulates how your app would handle real-time features like live scores, chat, or notifications.
        </p>
        
        <LiveDataDemo />
      </section>
      
      {/* Action History and Undo */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">5. Action History & Undo System</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates how to implement undo/redo functionality and action tracking.
          Every action is recorded and can be reversed, showing advanced state management.
        </p>
        
        {/* Last Action Display */}
        {listState.lastAction && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">
                <strong>Last action:</strong> {listState.lastAction}
              </span>
              <span className="text-xs text-yellow-600">
                {lastActionTime && `${Math.round((Date.now() - lastActionTime) / 1000)}s ago`}
              </span>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            size="small" 
            variant="secondary"
            onClick={() => listDispatch({ type: 'RESET_MOVIES' })}
          >
            🔄 Reset All Movies
          </Button>
          
          <Button 
            size="small" 
            variant="ghost"
            onClick={() => {
              const randomMovie = listState.movies[Math.floor(Math.random() * listState.movies.length)];
              if (randomMovie) {
                handleRemoveMovie(randomMovie.id);
              }
            }}
          >
            🎲 Remove Random
          </Button>
          
          <Button 
            size="small" 
            variant="ghost"
            onClick={() => {
              const randomMovie = listState.movies[Math.floor(Math.random() * listState.movies.length)];
              if (randomMovie) {
                handleRatingChange(randomMovie.id, Math.floor(Math.random() * 10) + 1);
              }
            }}
          >
            🎲 Random Rating
          </Button>
        </div>
      </section>
      
      {/* Performance Monitoring */}
      <section className="card bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-semibold mb-4">6. React Performance Insights</h2>
        <p className="text-gray-600 mb-4">
          Monitor how React handles re-renders and state updates in real-time.
          This helps understand performance implications of different patterns.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-xl font-bold text-purple-600">{renderCount.current}</div>
            <div className="text-xs text-gray-600">Component Renders</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-xl font-bold text-purple-600">{filteredAndSortedMovies.length}</div>
            <div className="text-xs text-gray-600">Computed Items</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-xl font-bold text-purple-600">
              {searchQuery.length + selectedGenre.length}
            </div>
            <div className="text-xs text-gray-600">Filter Chars</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border text-center">
            <div className="text-xl font-bold text-purple-600">
              {lastActionTime ? '✅' : '⏸️'}
            </div>
            <div className="text-xs text-gray-600">Has Activity</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-center text-gray-500">
          💡 Open browser DevTools Console to see detailed interaction logs
        </div>
      </section>
    </div>
  );
}

/**
 * NESTED COMPONENTS FOR SPECIFIC DEMONSTRATIONS
 * 
 * These components demonstrate specific patterns within the larger example.
 */

/**
 * WorkflowWizard - Multi-step process demonstration
 */
function WorkflowWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    basics: { title: '', year: '' },
    details: { genre: '', rating: 5 },
    confirmation: { agreed: false }
  });
  
  const totalSteps = 3;
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;
  
  const nextStep = () => setCurrentStep(prev => Math.min(totalSteps, prev + 1));
  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));
  
  const updateStepData = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };
  
  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
        </div>
        
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step Content */}
      <div className="min-h-48">
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-medium">Basic Information</h3>
            <input
              type="text"
              placeholder="Movie title"
              value={formData.basics.title}
              onChange={(e) => updateStepData('basics', { title: e.target.value })}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Year"
              value={formData.basics.year}
              onChange={(e) => updateStepData('basics', { year: e.target.value })}
              className="form-input"
            />
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-medium">Movie Details</h3>
            <select
              value={formData.details.genre}
              onChange={(e) => updateStepData('details', { genre: e.target.value })}
              className="form-input"
            >
              <option value="">Select genre...</option>
              {MOVIE_GENRES.filter(g => g !== 'All').map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating: {formData.details.rating}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.details.rating}
                onChange={(e) => updateStepData('details', { rating: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-medium">Review & Confirm</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Title:</strong> {formData.basics.title || 'Not specified'}</p>
              <p><strong>Year:</strong> {formData.basics.year || 'Not specified'}</p>
              <p><strong>Genre:</strong> {formData.details.genre || 'Not specified'}</p>
              <p><strong>Rating:</strong> {formData.details.rating}/10</p>
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.confirmation.agreed}
                onChange={(e) => updateStepData('confirmation', { agreed: e.target.checked })}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">I confirm this information is correct</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={isLastStep ? 
            () => console.log('🎉 Wizard completed!', formData) : 
            nextStep
          }
          disabled={isLastStep && !formData.confirmation.agreed}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

/**
 * LiveDataDemo - Real-time updates demonstration
 */
function LiveDataDemo() {
  const [liveData, setLiveData] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(1000);
  const intervalRef = useRef(null);
  
  // Start/stop live updates
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setLiveData(prev => [
          ...prev.slice(-9), // Keep last 9 entries
          {
            id: Date.now(),
            value: Math.floor(Math.random() * 100),
            timestamp: new Date().toLocaleTimeString(),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          }
        ]);
      }, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, updateInterval]);
  
  return (
    <div>
      {/* Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <Button
          variant={isActive ? "danger" : "primary"}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? '⏸️ Stop' : '▶️ Start'} Live Updates
        </Button>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Update every:</label>
          <select
            value={updateInterval}
            onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
            className="form-input w-20"
          >
            <option value={500}>0.5s</option>
            <option value={1000}>1s</option>
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
          </select>
        </div>
        
        <Button
          size="small"
          variant="secondary"
          onClick={() => setLiveData([])}
        >
          Clear Data
        </Button>
      </div>
      
      {/* Live Data Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Stream */}
        <div>
          <h4 className="font-medium mb-2">Live Data Stream</h4>
          <div className="bg-gray-900 text-green-400 p-3 rounded-lg h-32 overflow-y-auto font-mono text-sm">
            {liveData.length === 0 ? (
              <p className="text-gray-500">No data yet...</p>
            ) : (
              liveData.map(entry => (
                <div key={entry.id} className="flex justify-between">
                  <span>{entry.timestamp}</span>
                  <span style={{ color: entry.color }}>{entry.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Visual Chart */}
        <div>
          <h4 className="font-medium mb-2">Visual Chart</h4>
          <div className="bg-white border p-3 rounded-lg h-32">
            {liveData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data to display
              </div>
            ) : (
              <div className="h-full flex items-end space-x-1">
                {liveData.slice(-20).map(entry => (
                  <div
                    key={entry.id}
                    className="flex-1 transition-all duration-300 rounded-t"
                    style={{
                      height: `${entry.value}%`,
                      backgroundColor: entry.color,
                      minHeight: '4px'
                    }}
                    title={`Value: ${entry.value} at ${entry.timestamp}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Statistics */}
      {liveData.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.max(...liveData.map(d => d.value))}
            </div>
            <div className="text-xs text-gray-600">Maximum</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.round(liveData.reduce((sum, d) => sum + d.value, 0) / liveData.length)}
            </div>
            <div className="text-xs text-gray-600">Average</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {Math.min(...liveData.map(d => d.value))}
            </div>
            <div className="text-xs text-gray-600">Minimum</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveExamples;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPLEX STATE MANAGEMENT:
 *    - useReducer for coordinated state updates
 *    - Multiple useState hooks for different concerns
 *    - Custom hooks for specialized state (useToggle, useModal)
 * 
 * 2. REACTIVE COMPUTATIONS:
 *    - useMemo for filtering and sorting
 *    - Automatic updates when dependencies change
 *    - Performance optimization through memoization
 * 
 * 3. USER INTERACTION PATTERNS:
 *    - Form handling with controlled components
 *    - Drag and drop with visual feedback
 *    - Keyboard shortcuts and accessibility
 *    - Real-time search and filtering
 * 
 * 4. ANIMATION AND FEEDBACK:
 *    - CSS transitions for smooth interactions
 *    - Loading states and progress indicators
 *    - Visual feedback for user actions
 * 
 * 5. ADVANCED REACT PATTERNS:
 *    - Component composition and nesting
 *    - Event delegation and propagation control
 *    - Conditional rendering with animations
 *    - Cross-component communication
 * 
 * This component serves as a comprehensive example of modern React
 * development patterns and provides practical examples that can be
 * adapted for real-world applications.
 */
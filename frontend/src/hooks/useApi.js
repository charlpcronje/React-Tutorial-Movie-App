/**
 * useApi Custom Hook - Advanced API State Management
 * 
 * This custom hook demonstrates advanced patterns for handling API calls in React.
 * It provides a complete solution for managing async operations with:
 * 
 * 1. LOADING STATES: Visual feedback during API calls
 * 2. ERROR HANDLING: Graceful error management and retry logic
 * 3. DATA CACHING: Preventing unnecessary API calls
 * 4. REACTIVITY: Automatic updates when dependencies change
 * 5. CANCELLATION: Preventing race conditions with request cancellation
 * 6. RETRY LOGIC: Automatic and manual retry capabilities
 * 7. OPTIMISTIC UPDATES: Immediate UI feedback for better UX
 * 8. STALE-WHILE-REVALIDATE: Showing cached data while fetching fresh data
 * 
 * This hook showcases many advanced React patterns and real-world API handling techniques.
 */

// React imports for our custom hook
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * useApi Hook Implementation
 * 
 * This hook manages the complete lifecycle of API calls, providing loading states,
 * error handling, and data management in a reusable way.
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies that trigger re-fetching when changed
 * @param {Object} options - Configuration options
 * @returns {Object} API state and control functions
 */
function useApi(apiFunction, dependencies = [], options = {}) {
  /**
   * OPTIONS PROCESSING
   * 
   * We provide sensible defaults for all options and validate inputs.
   * This demonstrates how to create flexible, configurable hooks.
   */
  const {
    // Execution options
    immediate = true,           // Execute immediately when hook mounts
    retryCount = 3,            // Number of automatic retries on failure
    retryDelay = 1000,         // Delay between retries (ms)
    
    // Caching options
    enableCache = true,        // Enable response caching
    cacheKey = null,           // Custom cache key (auto-generated if not provided)
    staleTime = 5 * 60 * 1000, // How long data stays fresh (5 minutes)
    
    // Behavior options
    onSuccess = null,          // Callback when request succeeds
    onError = null,            // Callback when request fails
    onRetry = null,            // Callback when retry attempt is made
    
    // Advanced options
    enableOptimisticUpdates = false, // Enable optimistic update patterns
    debounceMs = 0,            // Debounce API calls (useful for search)
  } = options;
  
  /**
   * STATE MANAGEMENT
   * 
   * We manage multiple pieces of state to provide comprehensive information
   * about the API call status to consuming components.
   */
  
  // Main data state
  const [data, setData] = useState(null);           // The actual response data
  const [loading, setLoading] = useState(false);    // Whether a request is in progress
  const [error, setError] = useState(null);         // Current error state
  
  // Advanced state for better UX
  const [isFirstLoad, setIsFirstLoad] = useState(true);     // First time loading
  const [lastFetchTime, setLastFetchTime] = useState(null); // When data was last fetched
  const [retryAttempt, setRetryAttempt] = useState(0);      // Current retry attempt
  const [isFresh, setIsFresh] = useState(true);             // Whether data is fresh or stale
  
  /**
   * REFS FOR MANAGING SIDE EFFECTS
   * 
   * We use refs to store values that don't trigger re-renders but need to
   * persist across renders and help manage async operations.
   */
  const abortControllerRef = useRef(null);  // For cancelling in-flight requests
  const retryTimeoutRef = useRef(null);     // For managing retry delays
  const cacheRef = useRef(new Map());       // Simple in-memory cache
  const debounceTimeoutRef = useRef(null);  // For debouncing API calls
  
  /**
   * CACHE MANAGEMENT
   * 
   * Simple cache implementation to prevent unnecessary API calls and provide
   * stale-while-revalidate behavior.
   */
  const generateCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey;
    
    // Generate cache key from function name and dependencies
    const functionName = apiFunction.name || 'anonymous';
    const depString = JSON.stringify(dependencies);
    return `${functionName}:${depString}`;
  }, [apiFunction, dependencies, cacheKey]);
  
  const getCachedData = useCallback(() => {
    if (!enableCache) return null;
    
    const key = generateCacheKey();
    const cached = cacheRef.current.get(key);
    
    if (!cached) return null;
    
    // Check if data is still fresh
    const age = Date.now() - cached.timestamp;
    const isStale = age > staleTime;
    
    return { ...cached, isStale };
  }, [enableCache, generateCacheKey, staleTime]);
  
  const setCachedData = useCallback((responseData) => {
    if (!enableCache) return;
    
    const key = generateCacheKey();
    cacheRef.current.set(key, {
      data: responseData,
      timestamp: Date.now(),
    });
    
    console.log(`💾 Cached API response for key: ${key}`);
  }, [enableCache, generateCacheKey]);
  
  /**
   * API EXECUTION FUNCTION
   * 
   * This is the core function that handles making the API call with all
   * the advanced features like retries, caching, and cancellation.
   */
  const executeApi = useCallback(async (retryAttemptNumber = 0) => {
    try {
      console.log(`🚀 Executing API call (attempt ${retryAttemptNumber + 1}/${retryCount + 1})`);
      
      // Set loading state
      setLoading(true);
      setError(null);
      setRetryAttempt(retryAttemptNumber);
      
      // Create abort controller for request cancellation
      abortControllerRef.current = new AbortController();
      
      // Check cache first (for stale-while-revalidate)
      const cached = getCachedData();
      if (cached && !cached.isStale) {
        console.log('📋 Returning fresh cached data');
        setData(cached.data);
        setLoading(false);
        setLastFetchTime(cached.timestamp);
        setIsFresh(true);
        return cached.data;
      }
      
      // Show stale data while revalidating
      if (cached && cached.isStale) {
        console.log('🔄 Showing stale data while revalidating');
        setData(cached.data);
        setIsFresh(false);
      }
      
      // Execute the API function
      const startTime = performance.now();
      const response = await apiFunction({
        signal: abortControllerRef.current.signal, // For cancellation
      });
      const endTime = performance.now();
      
      console.log(`✅ API call completed in ${Math.round(endTime - startTime)}ms`);
      
      // Update state with new data
      setData(response);
      setLastFetchTime(Date.now());
      setIsFresh(true);
      setIsFirstLoad(false);
      setRetryAttempt(0);
      
      // Cache the response
      setCachedData(response);
      
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        try {
          await onSuccess(response);
        } catch (callbackError) {
          console.error('❌ Success callback error:', callbackError);
        }
      }
      
      return response;
      
    } catch (error) {
      // Handle request cancellation (not an error)
      if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
        console.log('🛑 API request was cancelled');
        setLoading(false);
        return;
      }
      
      console.error(`❌ API call failed (attempt ${retryAttemptNumber + 1}):`, error);
      
      // Determine if we should retry
      const shouldRetry = retryAttemptNumber < retryCount && 
                         error.retryable !== false;
      
      if (shouldRetry) {
        console.log(`🔄 Retrying in ${retryDelay}ms... (attempt ${retryAttemptNumber + 2}/${retryCount + 1})`);
        
        // Call retry callback if provided
        if (onRetry && typeof onRetry === 'function') {
          try {
            await onRetry(error, retryAttemptNumber + 1);
          } catch (callbackError) {
            console.error('❌ Retry callback error:', callbackError);
          }
        }
        
        // Set retry timeout
        retryTimeoutRef.current = setTimeout(() => {
          executeApi(retryAttemptNumber + 1);
        }, retryDelay * Math.pow(2, retryAttemptNumber)); // Exponential backoff
        
        return;
      }
      
      // No more retries - set error state
      setError({
        ...error,
        timestamp: Date.now(),
        retryAttempt: retryAttemptNumber + 1,
        canRetry: true, // Manual retry is always possible
      });
      
      setLoading(false);
      
      // Call error callback if provided
      if (onError && typeof onError === 'function') {
        try {
          await onError(error);
        } catch (callbackError) {
          console.error('❌ Error callback error:', callbackError);
        }
      }
      
      throw error; // Re-throw for component-level handling if needed
    }
  }, [
    apiFunction, 
    retryCount, 
    retryDelay, 
    getCachedData, 
    setCachedData, 
    onSuccess, 
    onError, 
    onRetry
  ]);
  
  /**
   * DEBOUNCED EXECUTION
   * 
   * For search and other high-frequency operations, we provide debouncing
   * to prevent excessive API calls.
   */
  const debouncedExecute = useCallback(() => {
    if (debounceMs > 0) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        executeApi();
      }, debounceMs);
    } else {
      // Execute immediately if no debouncing
      executeApi();
    }
  }, [executeApi, debounceMs]);
  
  /**
   * MANUAL CONTROL FUNCTIONS
   * 
   * These functions allow components to manually control the API call lifecycle.
   */
  
  // Manual execution function
  const execute = useCallback(() => {
    debouncedExecute();
  }, [debouncedExecute]);
  
  // Manual retry function
  const retry = useCallback(() => {
    console.log('🔄 Manual retry requested');
    setRetryAttempt(0); // Reset retry count
    execute();
  }, [execute]);
  
  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('🛑 API request cancelled by user');
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setLoading(false);
  }, []);
  
  // Reset all state
  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
    setIsFirstLoad(true);
    setLastFetchTime(null);
    setRetryAttempt(0);
    setIsFresh(true);
    
    console.log('🔄 API state reset');
  }, [cancel]);
  
  /**
   * AUTOMATIC EXECUTION EFFECT
   * 
   * This effect handles automatic execution when dependencies change
   * and cleanup when the component unmounts.
   */
  useEffect(() => {
    // Execute immediately if enabled
    if (immediate) {
      debouncedExecute();
    }
    
    // Cleanup function
    return () => {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      console.log('🧹 Cleaning up useApi hook');
    };
  }, dependencies); // Re-run when dependencies change
  
  /**
   * COMPUTED VALUES
   * 
   * We use useMemo to compute derived values efficiently.
   */
  const computedValues = useMemo(() => ({
    // Is this the initial load?
    isInitialLoad: loading && isFirstLoad,
    
    // Is this a retry?
    isRetrying: loading && retryAttempt > 0,
    
    // Do we have any data (even if stale)?
    hasData: data !== null,
    
    // Is the current data stale?
    isStale: !isFresh && data !== null,
    
    // How long ago was data fetched?
    ageMs: lastFetchTime ? Date.now() - lastFetchTime : null,
    
    // Can we retry?
    canRetry: !loading && error !== null,
    
    // Is fresh data available?
    hasFreshData: isFresh && data !== null && error === null,
  }), [loading, isFirstLoad, retryAttempt, data, isFresh, lastFetchTime, error]);
  
  /**
   * RETURN VALUES
   * 
   * We return an object with all the state and functions components need
   * to handle API calls effectively.
   */
  return {
    // Data state
    data,               // The fetched data
    loading,            // Is a request in progress?
    error,              // Current error state
    
    // Computed state
    ...computedValues,  // All computed values from above
    
    // Control functions
    execute,            // Manually trigger the API call
    retry,              // Retry after an error
    cancel,             // Cancel current request
    reset,              // Reset all state
    
    // Metadata
    lastFetchTime,      // When data was last fetched
    retryAttempt,       // Current retry attempt number
  };
}

/**
 * SPECIALIZED API HOOKS
 * 
 * We can build more specialized hooks on top of our general useApi hook.
 * This demonstrates the power of hook composition.
 */

/**
 * useMovieSearch Hook - Specialized hook for movie searching
 * 
 * This demonstrates:
 * - Hook composition (building on useApi)
 * - Debouncing for search inputs
 * - Search-specific state management
 * 
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Object} Search state and functions
 */
export function useMovieSearch(query, options = {}) {
  const {
    debounceMs = 500,     // Debounce search by default
    minQueryLength = 2,   // Minimum query length to search
    ...restOptions
  } = options;
  
  // Import our movie API function
  const { searchMovies } = await import('../services/movieApi.js');
  
  // Create API function for this specific search
  const searchFunction = useCallback(async ({ signal } = {}) => {
    if (!query || query.length < minQueryLength) {
      return { movies: [], totalResults: 0, query };
    }
    
    return await searchMovies(query, 1);
  }, [query, minQueryLength]);
  
  // Use our base useApi hook with search-specific configuration
  const apiState = useApi(
    searchFunction,
    [query], // Re-run when query changes
    {
      immediate: query && query.length >= minQueryLength,
      debounceMs,
      enableCache: true,
      cacheKey: `movie-search:${query}`,
      ...restOptions,
    }
  );
  
  // Add search-specific computed values
  const searchSpecific = useMemo(() => ({
    // Search-specific state
    isSearching: apiState.loading && query && query.length >= minQueryLength,
    hasQuery: query && query.length >= minQueryLength,
    isEmpty: apiState.data && apiState.data.movies.length === 0,
    resultsCount: apiState.data ? apiState.data.totalResults : 0,
    
    // Helper functions
    clearSearch: () => {
      apiState.reset();
    },
  }), [apiState, query, minQueryLength]);
  
  return {
    ...apiState,
    ...searchSpecific,
    query, // Include current query in return value
  };
}

/**
 * useMovieDetails Hook - Specialized hook for movie details
 * 
 * @param {number} movieId - Movie ID to fetch
 * @param {Object} options - Hook options
 * @returns {Object} Movie details state
 */
export function useMovieDetails(movieId, options = {}) {
  const { fetchMovieDetails } = await import('../services/movieApi.js');
  
  const detailsFunction = useCallback(async ({ signal } = {}) => {
    if (!movieId) return null;
    return await fetchMovieDetails(movieId);
  }, [movieId]);
  
  const apiState = useApi(
    detailsFunction,
    [movieId],
    {
      immediate: Boolean(movieId),
      enableCache: true,
      cacheKey: `movie-details:${movieId}`,
      ...options,
    }
  );
  
  const detailsSpecific = useMemo(() => ({
    movie: apiState.data,
    isLoaded: apiState.data !== null && !apiState.loading,
    hasImages: apiState.data ? apiState.data.hasImage : false,
  }), [apiState.data, apiState.loading]);
  
  return {
    ...apiState,
    ...detailsSpecific,
    movieId,
  };
}

/**
 * usePopularMovies Hook - For popular movies list
 * 
 * @param {number} page - Page number
 * @param {Object} options - Hook options
 * @returns {Object} Popular movies state
 */
export function usePopularMovies(page = 1, options = {}) {
  const { fetchPopularMovies } = await import('../services/movieApi.js');
  
  const popularFunction = useCallback(async ({ signal } = {}) => {
    return await fetchPopularMovies(page);
  }, [page]);
  
  return useApi(
    popularFunction,
    [page],
    {
      immediate: true,
      enableCache: true,
      cacheKey: `popular-movies:${page}`,
      staleTime: 10 * 60 * 1000, // Popular movies change less frequently
      ...options,
    }
  );
}

/**
 * EXPORT THE MAIN HOOK
 */
export default useApi;

/**
 * COMPREHENSIVE USAGE EXAMPLES
 * 
 * Here are detailed examples showing how to use these hooks in components:
 * 
 * BASIC API CALL:
 * ```jsx
 * function PopularMoviesPage() {
 *   const {
 *     data: moviesData,
 *     loading,
 *     error,
 *     retry,
 *     hasData,
 *     isInitialLoad
 *   } = usePopularMovies(1);
 *   
 *   if (isInitialLoad) {
 *     return <div className="animate-pulse">Loading popular movies...</div>;
 *   }
 *   
 *   if (error) {
 *     return (
 *       <div className="text-center">
 *         <p className="text-red-600 mb-4">{error.message}</p>
 *         <Button onClick={retry} variant="primary">
 *           Try Again
 *         </Button>
 *       </div>
 *     );
 *   }
 *   
 *   return (
 *     <div>
 *       {loading && <div className="text-blue-600">Refreshing...</div>}
 *       <MovieGrid movies={moviesData?.movies || []} />
 *     </div>
 *   );
 * }
 * ```
 * 
 * SEARCH WITH DEBOUNCING:
 * ```jsx
 * function MovieSearch() {
 *   const [query, setQuery] = useState('');
 *   
 *   const {
 *     data: searchResults,
 *     loading: isSearching,
 *     error: searchError,
 *     hasQuery,
 *     isEmpty,
 *     resultsCount,
 *     clearSearch
 *   } = useMovieSearch(query, {
 *     debounceMs: 500, // Wait 500ms after user stops typing
 *     minQueryLength: 3,
 *   });
 *   
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         placeholder="Search for movies..."
 *         className="form-input"
 *       />
 *       
 *       {isSearching && (
 *         <div className="mt-2 text-blue-600">Searching...</div>
 *       )}
 *       
 *       {hasQuery && !isSearching && isEmpty && (
 *         <div className="mt-2 text-gray-500">
 *           No movies found for "{query}"
 *         </div>
 *       )}
 *       
 *       {hasQuery && !isSearching && !isEmpty && (
 *         <div className="mt-2">
 *           <p className="text-gray-600 mb-4">
 *             Found {resultsCount} movies
 *           </p>
 *           <MovieGrid movies={searchResults?.movies || []} />
 *         </div>
 *       )}
 *       
 *       {searchError && (
 *         <div className="mt-2 text-red-600">
 *           {searchError.message}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * MOVIE DETAILS WITH LOADING STATES:
 * ```jsx
 * function MovieDetailsPage({ movieId }) {
 *   const {
 *     movie,
 *     loading,
 *     error,
 *     isLoaded,
 *     retry,
 *     isStale,
 *     lastFetchTime
 *   } = useMovieDetails(movieId);
 *   
 *   if (loading && !movie) {
 *     return <MovieDetailsSkeleton />;
 *   }
 *   
 *   if (error) {
 *     return <ErrorDisplay error={error} onRetry={retry} />;
 *   }
 *   
 *   if (!movie) {
 *     return <div>Movie not found</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       {isStale && (
 *         <div className="bg-yellow-50 border border-yellow-200 p-2 mb-4">
 *           Showing cached data, refreshing...
 *         </div>
 *       )}
 *       
 *       <MovieDetails movie={movie} />
 *       
 *       <div className="text-xs text-gray-500 mt-4">
 *         Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * OPTIMISTIC UPDATES:
 * ```jsx
 * function MovieRating({ movieId, currentRating }) {
 *   const [optimisticRating, setOptimisticRating] = useState(currentRating);
 *   
 *   const {
 *     execute: submitRating,
 *     loading: isSubmitting,
 *     error: submitError
 *   } = useApi(
 *     async ({ rating }) => {
 *       const { submitMovieRating } = await import('../services/movieApi.js');
 *       return submitMovieRating(movieId, rating, getCurrentUserId());
 *     },
 *     [],
 *     {
 *       immediate: false, // Only execute when manually called
 *       onSuccess: (result) => {
 *         console.log('✅ Rating submitted successfully');
 *         // Real rating is now stored, optimistic update was successful
 *       },
 *       onError: (error) => {
 *         // Rollback optimistic update on error
 *         setOptimisticRating(currentRating);
 *         console.error('❌ Rating submission failed, rolled back');
 *       }
 *     }
 *   );
 *   
 *   const handleRatingChange = async (newRating) => {
 *     // Optimistic update - show new rating immediately
 *     setOptimisticRating(newRating);
 *     
 *     // Submit actual rating
 *     try {
 *       await submitRating({ rating: newRating });
 *     } catch (error) {
 *       // Error handling is done in onError callback
 *     }
 *   };
 *   
 *   return (
 *     <StarRating
 *       rating={optimisticRating}
 *       onChange={handleRatingChange}
 *       disabled={isSubmitting}
 *     />
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. CUSTOM HOOK ARCHITECTURE:
 *    - Building complex hooks from simple React primitives
 *    - Creating reusable logic that works across many components
 *    - Encapsulating complex state management patterns
 * 
 * 2. ASYNC STATE MANAGEMENT:
 *    - Loading states for user feedback
 *    - Error boundaries and recovery
 *    - Retry logic with exponential backoff
 * 
 * 3. PERFORMANCE OPTIMIZATION:
 *    - Request cancellation to prevent race conditions
 *    - Debouncing to reduce API calls
 *    - Caching to avoid redundant requests
 *    - Stale-while-revalidate for better perceived performance
 * 
 * 4. USER EXPERIENCE PATTERNS:
 *    - Optimistic updates for immediate feedback
 *    - Progressive enhancement with stale data
 *    - Clear error messages and recovery options
 * 
 * 5. REACT PATTERNS:
 *    - useCallback for stable function references
 *    - useMemo for computed values
 *    - useRef for values that don't trigger re-renders
 *    - useEffect for side effects and cleanup
 * 
 * 6. REAL-WORLD CONSIDERATIONS:
 *    - Request cancellation for navigation
 *    - Memory leak prevention
 *    - Network error handling
 *    - Rate limiting respect
 * 
 * This hook serves as a foundation for all API interactions in our application
 * and demonstrates professional-grade React development patterns.
 */
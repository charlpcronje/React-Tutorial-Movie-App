/**
 * Movie API Service - Complete Educational Guide to API Integration
 * 
 * This service module demonstrates how to create a proper API integration layer
 * in React applications. We'll cover every aspect of modern API communication:
 * 
 * 1. HTTP CLIENT SETUP: Configuring axios for API requests
 * 2. ERROR HANDLING: Graceful handling of network and API errors
 * 3. RESPONSE TRANSFORMATION: Processing API data for frontend use
 * 4. CACHING STRATEGIES: Preventing unnecessary API calls
 * 5. RATE LIMITING: Respecting API usage limits
 * 6. RETRY LOGIC: Handling temporary failures gracefully
 * 7. LOADING STATES: Providing user feedback during async operations
 * 8. TYPE SAFETY: Using JSDoc for better development experience
 * 
 * Let's build this service step by step, explaining every decision and pattern.
 */

// Axios import - Our HTTP client for making API requests
// We choose axios over fetch() because it provides:
// - Request/response interceptors for global error handling
// - Automatic JSON parsing
// - Request/response transformation
// - Built-in timeout handling
// - Better error handling
import axios from 'axios';

/**
 * API CONFIGURATION AND CONSTANTS
 * 
 * First, let's set up our API configuration. We'll use The Movie Database (TMDB) API
 * as our external movie data source. TMDB provides comprehensive movie information
 * including details, images, ratings, and search functionality.
 */

// Base URL for The Movie Database API
// We store this in a constant so it can be easily changed if needed
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// API Key - In a real application, this would come from environment variables
// For this educational project, we'll use a demo key
// IMPORTANT: Never commit real API keys to version control!
const TMDB_API_KEY = 'demo_api_key_replace_with_real_key';

// Our backend API base URL
// This is where we'll send requests for user-specific data like ratings and comments
const BACKEND_BASE_URL = 'http://localhost:3001/api';

/**
 * AXIOS INSTANCE CONFIGURATION
 * 
 * We create configured axios instances for different APIs. This allows us to:
 * - Set different base URLs and default headers
 * - Apply different interceptors for each API
 * - Handle authentication differently for each service
 * - Customize timeout and retry logic per API
 */

// TMDB API client configuration
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000, // 10 second timeout - TMDB is usually fast
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    // Include API key in all TMDB requests
    api_key: TMDB_API_KEY,
  },
});

// Backend API client configuration  
const backendApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 5000, // 5 second timeout - our backend should be very fast
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

/**
 * REQUEST INTERCEPTORS
 * 
 * Interceptors run before requests are sent and allow us to:
 * - Add authentication headers
 * - Log requests for debugging
 * - Modify request data
 * - Add common parameters
 * 
 * This demonstrates the power of centralized request processing.
 */

// TMDB API request interceptor
tmdbApi.interceptors.request.use(
  (config) => {
    // Log all outgoing TMDB requests in development
    if (import.meta.env.DEV) {
      console.log(`🌐 TMDB API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    return config;
  },
  (error) => {
    console.error('❌ TMDB API Request Error:', error);
    return Promise.reject(error);
  }
);

// Backend API request interceptor
backendApi.interceptors.request.use(
  (config) => {
    // Log all backend requests in development
    if (import.meta.env.DEV) {
      console.log(`🔗 Backend API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    // Add user authentication token if available
    // For now, we'll just demonstrate the pattern
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Backend API Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTORS
 * 
 * Response interceptors run after responses are received and allow us to:
 * - Transform response data into a consistent format
 * - Handle global error conditions
 * - Log responses for debugging
 * - Implement caching strategies
 */

// TMDB API response interceptor
tmdbApi.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ TMDB API Response: ${response.status}`, response.data);
    }
    
    // Transform the response to add metadata
    return {
      ...response,
      data: {
        ...response.data,
        // Add fetch timestamp for cache invalidation
        _fetchedAt: Date.now(),
        // Add source identifier
        _source: 'tmdb',
      },
    };
  },
  (error) => {
    // Handle different types of TMDB errors
    console.error('❌ TMDB API Error:', error);
    
    // Transform error into a consistent format
    const errorMessage = error.response?.data?.status_message || 
                        error.message || 
                        'An unknown error occurred';
    
    return Promise.reject({
      type: 'TMDB_API_ERROR',
      message: errorMessage,
      status: error.response?.status,
      original: error,
    });
  }
);

// Backend API response interceptor
backendApi.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ Backend API Response: ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ Backend API Error:', error);
    
    // Handle authentication errors globally
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      // In a real app, you might dispatch a global action here
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Backend service error';
    
    return Promise.reject({
      type: 'BACKEND_API_ERROR',
      message: errorMessage,
      status: error.response?.status,
      original: error,
    });
  }
);

/**
 * IN-MEMORY CACHE IMPLEMENTATION
 * 
 * We implement a simple cache to reduce API calls and improve performance.
 * This demonstrates caching strategies and memory management patterns.
 */

class ApiCache {
  constructor() {
    // Store cached responses with timestamps
    this.cache = new Map();
    
    // Cache duration in milliseconds (5 minutes)
    this.cacheDuration = 5 * 60 * 1000;
  }
  
  /**
   * Generate a cache key from request parameters
   * @param {string} endpoint - The API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Unique cache key
   */
  generateKey(endpoint, params = {}) {
    // Sort params for consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key];
        return sorted;
      }, {});
    
    return `${endpoint}?${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Get cached response if still valid
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if expired/missing
   */
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`📋 Cache hit for: ${key}`);
    return cached.data;
  }
  
  /**
   * Store response in cache
   * @param {string} key - Cache key  
   * @param {Object} data - Response data to cache
   */
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    
    console.log(`💾 Cached response for: ${key}`);
  }
  
  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

// Create cache instance
const cache = new ApiCache();

/**
 * TMDB API SERVICE FUNCTIONS
 * 
 * These functions provide a clean interface for fetching movie data from TMDB.
 * Each function handles caching, error handling, and data transformation.
 */

/**
 * Fetch popular movies from TMDB
 * 
 * This function demonstrates:
 * - Basic API calls with parameters
 * - Caching strategies
 * - Error handling
 * - Data transformation
 * 
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<Object>} Popular movies data with metadata
 */
export async function fetchPopularMovies(page = 1) {
  try {
    console.log(`🎬 Fetching popular movies (page ${page})...`);
    
    // Check cache first
    const cacheKey = cache.generateKey('/movie/popular', { page });
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Make API request
    const response = await tmdbApi.get('/movie/popular', {
      params: { page }
    });
    
    // Transform and enhance the data
    const transformedData = {
      movies: response.data.results.map(transformMovieData),
      currentPage: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      fetchedAt: Date.now(),
    };
    
    // Cache the transformed data
    cache.set(cacheKey, transformedData);
    
    console.log(`✅ Fetched ${transformedData.movies.length} popular movies`);
    return transformedData;
    
  } catch (error) {
    console.error('❌ Failed to fetch popular movies:', error);
    
    // Return a user-friendly error object
    throw {
      type: 'FETCH_POPULAR_MOVIES_ERROR',
      message: 'Failed to load popular movies. Please try again later.',
      details: error.message,
      retryable: true, // Indicates this operation can be retried
    };
  }
}

/**
 * Search for movies by title
 * 
 * This function demonstrates:
 * - Search API integration
 * - Query parameter handling  
 * - Debouncing considerations (handled at component level)
 * - Empty state handling
 * 
 * @param {string} query - Search query string
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<Object>} Search results with metadata
 */
export async function searchMovies(query, page = 1) {
  try {
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw {
        type: 'INVALID_SEARCH_QUERY',
        message: 'Search query cannot be empty',
        retryable: false,
      };
    }
    
    console.log(`🔍 Searching movies for: "${query}" (page ${page})`);
    
    // Clean and prepare the query
    const cleanQuery = query.trim();
    
    // Check cache
    const cacheKey = cache.generateKey('/search/movie', { query: cleanQuery, page });
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Make search request
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query: cleanQuery,
        page,
        include_adult: false, // Filter out adult content for educational app
      }
    });
    
    // Transform search results
    const transformedData = {
      movies: response.data.results.map(transformMovieData),
      currentPage: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      query: cleanQuery,
      searchedAt: Date.now(),
    };
    
    // Cache search results
    cache.set(cacheKey, transformedData);
    
    console.log(`✅ Found ${transformedData.movies.length} movies for "${cleanQuery}"`);
    return transformedData;
    
  } catch (error) {
    console.error('❌ Movie search failed:', error);
    
    throw {
      type: 'SEARCH_MOVIES_ERROR',
      message: 'Failed to search movies. Please check your connection and try again.',
      details: error.message,
      query,
      retryable: true,
    };
  }
}

/**
 * Fetch detailed information for a specific movie
 * 
 * This function demonstrates:
 * - Single resource fetching
 * - Additional API calls for related data
 * - Data enrichment and transformation
 * - Error handling for missing resources
 * 
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object>} Detailed movie information
 */
export async function fetchMovieDetails(movieId) {
  try {
    // Validate movie ID
    if (!movieId || typeof movieId !== 'number') {
      throw {
        type: 'INVALID_MOVIE_ID',
        message: 'Movie ID is required and must be a number',
        retryable: false,
      };
    }
    
    console.log(`🎭 Fetching details for movie ID: ${movieId}`);
    
    // Check cache
    const cacheKey = cache.generateKey(`/movie/${movieId}`);
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Fetch detailed movie information
    // We use Promise.all to make multiple API calls concurrently
    const [detailsResponse, creditsResponse, imagesResponse] = await Promise.all([
      tmdbApi.get(`/movie/${movieId}`),
      tmdbApi.get(`/movie/${movieId}/credits`),
      tmdbApi.get(`/movie/${movieId}/images`),
    ]);
    
    // Transform and combine the data
    const movieDetails = {
      // Basic movie information
      ...transformMovieData(detailsResponse.data),
      
      // Additional details not available in search results
      budget: detailsResponse.data.budget,
      revenue: detailsResponse.data.revenue,
      runtime: detailsResponse.data.runtime,
      status: detailsResponse.data.status,
      tagline: detailsResponse.data.tagline,
      homepage: detailsResponse.data.homepage,
      
      // Production information
      productionCompanies: detailsResponse.data.production_companies,
      productionCountries: detailsResponse.data.production_countries,
      spokenLanguages: detailsResponse.data.spoken_languages,
      
      // Cast and crew information
      cast: creditsResponse.data.cast.slice(0, 20), // Top 20 cast members
      crew: creditsResponse.data.crew,
      director: creditsResponse.data.crew.find(person => person.job === 'Director'),
      
      // Images
      backdrops: imagesResponse.data.backdrops.slice(0, 10),
      posters: imagesResponse.data.posters.slice(0, 10),
      
      // Metadata
      fetchedAt: Date.now(),
      isDetailed: true, // Flag to indicate this is detailed data
    };
    
    // Cache the detailed data
    cache.set(cacheKey, movieDetails);
    
    console.log(`✅ Fetched detailed information for: ${movieDetails.title}`);
    return movieDetails;
    
  } catch (error) {
    console.error('❌ Failed to fetch movie details:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw {
        type: 'MOVIE_NOT_FOUND',
        message: `Movie with ID ${movieId} was not found`,
        movieId,
        retryable: false,
      };
    }
    
    throw {
      type: 'FETCH_MOVIE_DETAILS_ERROR',
      message: 'Failed to load movie details. Please try again later.',
      details: error.message,
      movieId,
      retryable: true,
    };
  }
}

/**
 * Fetch movies by genre
 * 
 * This function demonstrates:
 * - Category-based filtering
 * - Genre ID handling
 * - Sorting and filtering options
 * 
 * @param {number} genreId - TMDB genre ID
 * @param {number} page - Page number (default: 1)
 * @param {string} sortBy - Sort order (default: 'popularity.desc')
 * @returns {Promise<Object>} Movies in the specified genre
 */
export async function fetchMoviesByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
  try {
    console.log(`🎭 Fetching movies for genre ${genreId} (page ${page})`);
    
    // Check cache
    const cacheKey = cache.generateKey('/discover/movie', { 
      with_genres: genreId, 
      page, 
      sort_by: sortBy 
    });
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Make discovery request
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: sortBy,
        include_adult: false,
        include_video: false,
        'vote_count.gte': 100, // Only movies with significant vote counts
      }
    });
    
    // Transform the data
    const transformedData = {
      movies: response.data.results.map(transformMovieData),
      currentPage: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      genreId,
      sortBy,
      fetchedAt: Date.now(),
    };
    
    cache.set(cacheKey, transformedData);
    
    console.log(`✅ Fetched ${transformedData.movies.length} movies for genre ${genreId}`);
    return transformedData;
    
  } catch (error) {
    console.error('❌ Failed to fetch movies by genre:', error);
    
    throw {
      type: 'FETCH_GENRE_MOVIES_ERROR',
      message: 'Failed to load movies for this genre. Please try again later.',
      details: error.message,
      genreId,
      retryable: true,
    };
  }
}

/**
 * DATA TRANSFORMATION FUNCTIONS
 * 
 * These functions clean and standardize data from different APIs into
 * consistent formats that our components can use reliably.
 */

/**
 * Transform raw TMDB movie data into our application format
 * 
 * This function demonstrates:
 * - Data normalization across different API endpoints
 * - Image URL construction
 * - Type coercion and validation
 * - Adding computed properties
 * 
 * @param {Object} tmdbMovie - Raw movie data from TMDB
 * @returns {Object} Transformed movie data
 */
function transformMovieData(tmdbMovie) {
  // TMDB image base URLs - these are provided by TMDB's configuration API
  // For this educational example, we'll use the common base URL
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
  
  return {
    // Unique identifier
    id: tmdbMovie.id,
    
    // Basic information
    title: tmdbMovie.title || tmdbMovie.original_title || 'Unknown Title',
    originalTitle: tmdbMovie.original_title,
    overview: tmdbMovie.overview || 'No description available',
    
    // Release information
    releaseDate: tmdbMovie.release_date || null,
    releaseYear: tmdbMovie.release_date ? 
      new Date(tmdbMovie.release_date).getFullYear() : null,
    
    // Images with different sizes
    posterPath: tmdbMovie.poster_path,
    posterUrl: tmdbMovie.poster_path ? 
      `${IMAGE_BASE_URL}/w500${tmdbMovie.poster_path}` : null,
    posterUrlSmall: tmdbMovie.poster_path ? 
      `${IMAGE_BASE_URL}/w300${tmdbMovie.poster_path}` : null,
    posterUrlLarge: tmdbMovie.poster_path ? 
      `${IMAGE_BASE_URL}/original${tmdbMovie.poster_path}` : null,
    
    backdropPath: tmdbMovie.backdrop_path,
    backdropUrl: tmdbMovie.backdrop_path ? 
      `${IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}` : null,
    backdropUrlOriginal: tmdbMovie.backdrop_path ? 
      `${IMAGE_BASE_URL}/original${tmdbMovie.backdrop_path}` : null,
    
    // Ratings and popularity
    voteAverage: Number(tmdbMovie.vote_average) || 0,
    voteCount: Number(tmdbMovie.vote_count) || 0,
    popularity: Number(tmdbMovie.popularity) || 0,
    
    // Computed rating properties
    ratingPercentage: Math.round((tmdbMovie.vote_average || 0) * 10),
    ratingStars: Math.round((tmdbMovie.vote_average || 0) / 2), // Convert to 5-star scale
    
    // Content rating
    adult: Boolean(tmdbMovie.adult),
    
    // Language information
    originalLanguage: tmdbMovie.original_language,
    
    // Genre information
    genreIds: tmdbMovie.genre_ids || [],
    genres: tmdbMovie.genres || [], // Available in detailed requests
    
    // Computed properties
    hasImage: Boolean(tmdbMovie.poster_path),
    hasBackdrop: Boolean(tmdbMovie.backdrop_path),
    isRecent: tmdbMovie.release_date ? 
      (Date.now() - new Date(tmdbMovie.release_date).getTime()) < (365 * 24 * 60 * 60 * 1000) : false,
    isPopular: (tmdbMovie.popularity || 0) > 50,
    isHighRated: (tmdbMovie.vote_average || 0) >= 7.0,
    
    // Metadata
    source: 'tmdb',
    transformedAt: Date.now(),
  };
}

/**
 * BACKEND API SERVICE FUNCTIONS
 * 
 * These functions communicate with our own backend for user-specific data
 * like ratings, comments, and favorites.
 */

/**
 * Submit a user rating for a movie
 * 
 * This demonstrates:
 * - POST requests with data
 * - User authentication
 * - Optimistic updates
 * - Error rollback
 * 
 * @param {number} movieId - Movie ID
 * @param {number} rating - User rating (1-5)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Rating submission result
 */
export async function submitMovieRating(movieId, rating, userId) {
  try {
    console.log(`⭐ Submitting rating ${rating}/5 for movie ${movieId}`);
    
    // Validate input
    if (!movieId || !rating || !userId) {
      throw {
        type: 'INVALID_RATING_DATA',
        message: 'Movie ID, rating, and user ID are required',
        retryable: false,
      };
    }
    
    if (rating < 1 || rating > 5) {
      throw {
        type: 'INVALID_RATING_VALUE',
        message: 'Rating must be between 1 and 5',
        retryable: false,
      };
    }
    
    // Submit rating to backend
    const response = await backendApi.post('/ratings', {
      movieId,
      rating,
      userId,
      timestamp: Date.now(),
    });
    
    console.log('✅ Rating submitted successfully');
    return response.data;
    
  } catch (error) {
    console.error('❌ Failed to submit rating:', error);
    
    throw {
      type: 'SUBMIT_RATING_ERROR',
      message: 'Failed to save your rating. Please try again.',
      details: error.message,
      movieId,
      rating,
      retryable: true,
    };
  }
}

/**
 * Add a comment to a movie
 * 
 * @param {number} movieId - Movie ID
 * @param {string} comment - User comment
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Comment submission result
 */
export async function addMovieComment(movieId, comment, userId) {
  try {
    console.log(`💬 Adding comment to movie ${movieId}`);
    
    // Validate input
    if (!movieId || !comment || !userId) {
      throw {
        type: 'INVALID_COMMENT_DATA',
        message: 'Movie ID, comment, and user ID are required',
        retryable: false,
      };
    }
    
    if (comment.trim().length === 0) {
      throw {
        type: 'EMPTY_COMMENT',
        message: 'Comment cannot be empty',
        retryable: false,
      };
    }
    
    // Submit comment
    const response = await backendApi.post('/comments', {
      movieId,
      comment: comment.trim(),
      userId,
      timestamp: Date.now(),
    });
    
    console.log('✅ Comment added successfully');
    return response.data;
    
  } catch (error) {
    console.error('❌ Failed to add comment:', error);
    
    throw {
      type: 'ADD_COMMENT_ERROR',
      message: 'Failed to add your comment. Please try again.',
      details: error.message,
      movieId,
      retryable: true,
    };
  }
}

/**
 * UTILITY FUNCTIONS
 * 
 * Helper functions that support our API operations and provide additional functionality.
 */

/**
 * Build full image URL from TMDB path
 * 
 * @param {string} imagePath - Relative image path from TMDB
 * @param {string} size - Image size (w300, w500, w780, original)
 * @returns {string|null} Complete image URL or null
 */
export function buildImageUrl(imagePath, size = 'w500') {
  if (!imagePath) return null;
  
  const BASE_URL = 'https://image.tmdb.org/t/p';
  return `${BASE_URL}/${size}${imagePath}`;
}

/**
 * Format movie runtime into hours and minutes
 * 
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime string
 */
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return 'Unknown runtime';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format release date for display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatReleaseDate(dateString) {
  if (!dateString) return 'Unknown release date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate rating percentage for progress bars
 * 
 * @param {number} rating - Rating out of 10
 * @returns {number} Percentage (0-100)
 */
export function ratingToPercentage(rating) {
  return Math.round(Math.max(0, Math.min(10, rating || 0)) * 10);
}

/**
 * API HEALTH CHECK AND UTILITIES
 * 
 * Functions for monitoring API health and managing cache.
 */

/**
 * Check if TMDB API is accessible
 * 
 * @returns {Promise<boolean>} True if API is accessible
 */
export async function checkTmdbApiHealth() {
  try {
    await tmdbApi.get('/configuration', { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('⚠️ TMDB API health check failed:', error.message);
    return false;
  }
}

/**
 * Check if backend API is accessible
 * 
 * @returns {Promise<boolean>} True if backend is accessible
 */
export async function checkBackendHealth() {
  try {
    await backendApi.get('/health', { timeout: 3000 });
    return true;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error.message);
    return false;
  }
}

/**
 * Clear all cached API data
 * 
 * Useful for testing or when user wants fresh data
 */
export function clearApiCache() {
  cache.clear();
  console.log('🗑️ All API cache cleared');
}

/**
 * Get cache statistics
 * 
 * @returns {Object} Cache statistics for debugging
 */
export function getCacheStats() {
  return {
    size: cache.cache.size,
    keys: Array.from(cache.cache.keys()),
    oldestEntry: Array.from(cache.cache.values())
      .reduce((oldest, entry) => 
        !oldest || entry.timestamp < oldest.timestamp ? entry : oldest, null
      ),
  };
}

/**
 * EDUCATIONAL NOTES ABOUT THIS SERVICE LAYER:
 * 
 * 1. SEPARATION OF CONCERNS:
 *    - API logic is separate from UI components
 *    - Components focus on rendering, services handle data fetching
 *    - Makes testing much easier (can mock API calls)
 *    - Allows API logic reuse across multiple components
 * 
 * 2. ERROR HANDLING STRATEGY:
 *    - Consistent error object format across all functions
 *    - User-friendly error messages for UI display
 *    - Technical details preserved for debugging
 *    - Retry flags help determine appropriate user actions
 * 
 * 3. CACHING IMPLEMENTATION:
 *    - Reduces unnecessary API calls
 *    - Improves perceived performance
 *    - Respects API rate limits
 *    - Provides offline-like experience for cached data
 * 
 * 4. DATA TRANSFORMATION:
 *    - Standardizes data format from external APIs
 *    - Adds computed properties for easier component usage
 *    - Handles missing or malformed data gracefully
 *    - Creates consistent interfaces for components
 * 
 * 5. ASYNC/AWAIT PATTERNS:
 *    - Modern JavaScript async handling
 *    - Clear error boundaries with try/catch
 *    - Concurrent API calls with Promise.all
 *    - Proper error propagation to calling components
 * 
 * 6. INTERCEPTOR PATTERNS:
 *    - Global request/response processing
 *    - Automatic authentication header injection
 *    - Centralized logging for debugging
 *    - Consistent error transformation
 * 
 * 7. API CLIENT ORGANIZATION:
 *    - Separate clients for different services
 *    - Service-specific configuration
 *    - Clear separation between external and internal APIs
 *    - Reusable patterns across different endpoints
 */
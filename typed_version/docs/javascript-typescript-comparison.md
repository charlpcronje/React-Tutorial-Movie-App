# 🔄 JavaScript vs TypeScript: Complete Side-by-Side Comparison

This comprehensive guide shows you exactly how every JavaScript pattern in our movie app is enhanced with TypeScript. Follow along to understand the transformation from dynamic JavaScript to type-safe TypeScript.

## 📋 Quick Reference Table

| Concept | JavaScript | TypeScript | Benefits |
|---------|------------|------------|----------|
| **Variables** | `let name = "Movie"` | `let name: string = "Movie"` | Type safety, IntelliSense |
| **Functions** | `function add(a, b) { return a + b }` | `function add(a: number, b: number): number` | Parameter validation, return type |
| **Objects** | `const movie = { title: "..." }` | `const movie: Movie = { title: "..." }` | Structure validation, autocomplete |
| **Arrays** | `const items = []` | `const items: string[] = []` | Element type safety |
| **Components** | `function Button({ onClick })` | `const Button: FC<ButtonProps> = ({ onClick })` | Prop validation, JSX safety |
| **API Calls** | `fetch('/api').then(res => res.json())` | `api.get<Movie[]>('/movies')` | Response type safety |
| **State** | `const [count, setCount] = useState(0)` | `const [count, setCount] = useState<number>(0)` | State type safety |
| **Events** | `onClick={(e) => handle(e)}` | `onClick={(e: React.MouseEvent) => handle(e)}` | Event type safety |

---

## 🎬 Component Comparison: MovieCard

### JavaScript Version
```jsx
// MovieCard.jsx
import React from 'react';

function MovieCard({ movie, onRate, onFavorite, className, showActions }) {
  const handleRating = (rating) => {
    if (onRate) {
      onRate(movie, rating);
    }
  };

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite(movie);
    }
  };

  return (
    <div className={`movie-card ${className || ''}`}>
      <img 
        src={movie.posterUrl || '/placeholder.jpg'} 
        alt={movie.title}
        onError={(e) => {
          e.target.src = '/placeholder.jpg';
        }}
      />
      
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="year">{movie.releaseYear}</p>
        <p className="overview">{movie.overview}</p>
        
        <div className="rating">
          {'★'.repeat(movie.ratingStars || 0)}
          <span className="average">({movie.voteAverage})</span>
        </div>

        {showActions && (
          <div className="actions">
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map(rating => (
                <button 
                  key={rating}
                  onClick={() => handleRating(rating)}
                  className={rating <= (movie.userRating || 0) ? 'active' : ''}
                >
                  ★
                </button>
              ))}
            </div>
            
            <button 
              className={`favorite ${movie.isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              ❤️ {movie.isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
```

### TypeScript Version
```tsx
// MovieCard.tsx
import React, { type FC, type MouseEvent, type SyntheticEvent } from 'react';
import type { Movie, MovieWithUserData } from '@/types';

/**
 * MovieCard Component Props
 * 
 * Demonstrates comprehensive prop typing with optional properties,
 * function signatures, and union types.
 */
interface MovieCardProps {
  readonly movie: MovieWithUserData;
  readonly onRate?: (movie: Movie, rating: number) => void;
  readonly onFavorite?: (movie: Movie) => void;
  readonly className?: string;
  readonly showActions?: boolean;
  readonly size?: 'small' | 'medium' | 'large';
  readonly variant?: 'card' | 'list' | 'grid';
}

/**
 * MovieCard Component with Complete TypeScript Integration
 * 
 * This component demonstrates:
 * 1. FC (FunctionComponent) typing with props interface
 * 2. Event handler typing with specific event types
 * 3. Conditional rendering with type safety
 * 4. Optional prop handling with default values
 * 5. Union type usage for variants
 */
const MovieCard: FC<MovieCardProps> = ({
  movie,
  onRate,
  onFavorite,
  className = '',
  showActions = true,
  size = 'medium',
  variant = 'card'
}) => {
  /**
   * Handle Rating Click
   * 
   * Demonstrates:
   * - Function parameter typing (rating: number)
   * - Optional callback invocation with type safety
   * - Void return type
   */
  const handleRating = (rating: number): void => {
    if (onRate) {
      onRate(movie, rating);
    }
  };

  /**
   * Handle Favorite Toggle
   * 
   * Demonstrates:
   * - MouseEvent typing for click handlers
   * - Event parameter usage with type safety
   */
  const handleFavorite = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation(); // Prevent event bubbling
    if (onFavorite) {
      onFavorite(movie);
    }
  };

  /**
   * Handle Image Error
   * 
   * Demonstrates:
   * - SyntheticEvent typing for image events
   * - DOM element type assertion
   * - Error handling with type safety
   */
  const handleImageError = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = event.target as HTMLImageElement;
    target.src = '/placeholder.jpg';
  };

  /**
   * Generate CSS Classes
   * 
   * Demonstrates:
   * - Template literal usage with types
   * - Union type handling in conditional logic
   * - String manipulation with type safety
   */
  const cssClasses: string = [
    'movie-card',
    `movie-card--${size}`,
    `movie-card--${variant}`,
    movie.isFavorite ? 'movie-card--favorited' : '',
    className
  ].filter(Boolean).join(' ');

  /**
   * Rating Stars Array Generation
   * 
   * Demonstrates:
   * - Array.from with type inference
   * - Tuple type usage for rating range
   * - Type-safe array operations
   */
  const ratingStars: readonly number[] = Array.from(
    { length: 5 }, 
    (_, index) => index + 1
  );

  return (
    <div className={cssClasses}>
      <img 
        src={movie.posterUrl || '/placeholder.jpg'} 
        alt={`${movie.title} poster`}
        onError={handleImageError}
        loading="lazy" // Performance optimization
      />
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-year">{movie.releaseYear}</p>
        <p className="movie-overview">{movie.overview}</p>
        
        {/* Rating Display */}
        <div className="movie-rating">
          <span className="stars">
            {'★'.repeat(movie.ratingStars)}
            {'☆'.repeat(5 - movie.ratingStars)}
          </span>
          <span className="average">
            ({movie.voteAverage.toFixed(1)})
          </span>
          {movie.userRating && (
            <span className="user-rating">
              Your rating: {movie.userRating}/5
            </span>
          )}
        </div>

        {/* Genre Tags */}
        {movie.genres.length > 0 && (
          <div className="movie-genres">
            {movie.genres.map((genre) => (
              <span key={genre.id} className="genre-tag">
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="movie-actions">
            <div className="rating-buttons">
              <span className="rating-label">Rate this movie:</span>
              {ratingStars.map((rating: number) => (
                <button 
                  key={rating}
                  type="button"
                  onClick={() => handleRating(rating)}
                  className={`rating-button ${
                    rating <= (movie.userRating || 0) ? 'active' : ''
                  }`}
                  aria-label={`Rate ${movie.title} ${rating} out of 5 stars`}
                  title={`${rating} star${rating !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <button 
              type="button"
              className={`favorite-button ${movie.isFavorite ? 'active' : ''}`}
              onClick={handleFavorite}
              aria-label={
                movie.isFavorite 
                  ? `Remove ${movie.title} from favorites`
                  : `Add ${movie.title} to favorites`
              }
            >
              ❤️ {movie.isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component display name for debugging
MovieCard.displayName = 'MovieCard';

export default MovieCard;

/**
 * TYPESCRIPT ENHANCEMENTS DEMONSTRATED:
 * 
 * 1. COMPONENT TYPING:
 *    - FC<Props> for functional component type
 *    - Interface definition for props with readonly modifier
 *    - Optional properties with ? syntax
 *    - Union types for variant options
 * 
 * 2. EVENT HANDLING:
 *    - MouseEvent<HTMLButtonElement> for click events
 *    - SyntheticEvent<HTMLImageElement> for image events
 *    - Event parameter typing and usage
 *    - preventDefault/stopPropagation with type safety
 * 
 * 3. FUNCTION TYPING:
 *    - Parameter type annotations (rating: number)
 *    - Return type annotations (: void)
 *    - Optional callback handling with type safety
 *    - Arrow function typing
 * 
 * 4. DATA MANIPULATION:
 *    - Array operations with type inference
 *    - String template literals with type safety
 *    - Number methods (toFixed) with proper typing
 *    - Conditional logic with type guards
 * 
 * 5. ACCESSIBILITY:
 *    - Proper ARIA attributes with string literals
 *    - Type-safe title and label generation
 *    - Semantic HTML with TypeScript validation
 * 
 * 6. PERFORMANCE:
 *    - Memoization-ready with consistent prop types
 *    - Type-safe optimizations (loading="lazy")
 *    - Efficient re-render prevention
 */
```

---

## 🎣 Custom Hook Comparison: useMovies

### JavaScript Version
```javascript
// useMovies.js
import { useState, useEffect, useCallback } from 'react';
import { movieAPI } from '../services/api';

function useMovies(initialPage = 1) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = useCallback(async (pageNum, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await movieAPI.getMovies(pageNum);
      
      if (append) {
        setMovies(prev => [...prev, ...response.data]);
      } else {
        setMovies(response.data);
      }
      
      setHasMore(response.pagination.hasNext);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMovies(page + 1, true);
    }
  }, [loading, hasMore, page, fetchMovies]);

  const retry = useCallback(() => {
    fetchMovies(page);
  }, [page, fetchMovies]);

  const addMovie = useCallback(async (movieData) => {
    try {
      const response = await movieAPI.createMovie(movieData);
      setMovies(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Failed to add movie');
    }
  }, []);

  useEffect(() => {
    fetchMovies(initialPage);
  }, [fetchMovies, initialPage]);

  return {
    movies,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    retry,
    addMovie,
    refetch: () => fetchMovies(1)
  };
}

export default useMovies;
```

### TypeScript Version
```typescript
// useMovies.ts
import { useState, useEffect, useCallback, type DependencyList } from 'react';
import type { Movie, ApiResponse, PaginatedResponse, ApiError } from '@/types';
import { movieAPI } from '@/services/api';

/**
 * Hook State Interface
 * 
 * Demonstrates comprehensive state typing for complex hooks.
 */
interface UseMoviesState {
  readonly movies: readonly Movie[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly page: number;
  readonly hasMore: boolean;
}

/**
 * Hook Return Type Interface
 * 
 * Defines the complete API surface of the hook with proper typing.
 */
interface UseMoviesReturn extends UseMoviesState {
  readonly loadMore: () => void;
  readonly retry: () => void;
  readonly addMovie: (movieData: Omit<Movie, 'id'>) => Promise<Movie>;
  readonly refetch: () => void;
  readonly updateMovie: (id: number, updates: Partial<Movie>) => Promise<Movie>;
  readonly deleteMovie: (id: number) => Promise<void>;
}

/**
 * Hook Options Interface
 * 
 * Configurable options for the hook with sensible defaults.
 */
interface UseMoviesOptions {
  readonly initialPage?: number;
  readonly pageSize?: number;
  readonly autoFetch?: boolean;
  readonly onError?: (error: ApiError) => void;
  readonly onSuccess?: (movies: readonly Movie[]) => void;
}

/**
 * Error Handling Utility
 * 
 * Demonstrates error type narrowing and message extraction.
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * useMovies Hook with Complete TypeScript Integration
 * 
 * This hook demonstrates:
 * 1. Complex state typing with readonly modifiers
 * 2. Generic function typing with constraints
 * 3. Async operation typing with error handling
 * 4. Callback typing with proper parameters
 * 5. Effect dependency typing
 * 6. Promise return type specifications
 * 7. Optional parameter handling
 * 8. Interface composition and extension
 */
function useMovies(options: UseMoviesOptions = {}): UseMoviesReturn {
  const {
    initialPage = 1,
    pageSize = 20,
    autoFetch = true,
    onError,
    onSuccess
  } = options;

  // State with comprehensive typing
  const [state, setState] = useState<UseMoviesState>({
    movies: [],
    loading: false,
    error: null,
    page: initialPage,
    hasMore: true
  });

  /**
   * Fetch Movies Function
   * 
   * Demonstrates:
   * - Async function typing with Promise return
   * - Parameter typing with optional parameters
   * - State update function typing
   * - Error handling with type narrowing
   * - API response typing
   */
  const fetchMovies = useCallback(async (
    pageNum: number, 
    append: boolean = false
  ): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: PaginatedResponse<Movie> = await movieAPI.getMovies(pageNum, pageSize);
      
      const newMovies: readonly Movie[] = append 
        ? [...state.movies, ...response.data]
        : response.data;
      
      setState(prev => ({
        ...prev,
        movies: newMovies,
        loading: false,
        hasMore: response.pagination.hasNext,
        page: pageNum
      }));

      // Optional success callback
      onSuccess?.(newMovies);
      
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Optional error callback
      onError?.(error as ApiError);
    }
  }, [state.movies, pageSize, onError, onSuccess]);

  /**
   * Load More Movies
   * 
   * Demonstrates:
   * - Conditional logic with type safety
   * - State-based operation control
   * - Void return type for action functions
   */
  const loadMore = useCallback((): void => {
    if (!state.loading && state.hasMore) {
      fetchMovies(state.page + 1, true);
    }
  }, [state.loading, state.hasMore, state.page, fetchMovies]);

  /**
   * Retry Failed Request
   * 
   * Demonstrates:
   * - Simple action function typing
   * - State-dependent operations
   */
  const retry = useCallback((): void => {
    fetchMovies(state.page);
  }, [state.page, fetchMovies]);

  /**
   * Add New Movie
   * 
   * Demonstrates:
   * - Omit utility type for creating new entities
   * - Promise return typing for async operations
   * - Error propagation with type safety
   * - State update with type preservation
   */
  const addMovie = useCallback(async (
    movieData: Omit<Movie, 'id'>
  ): Promise<Movie> => {
    try {
      const response: ApiResponse<Movie> = await movieAPI.createMovie(movieData);
      
      setState(prev => ({
        ...prev,
        movies: [response.data, ...prev.movies]
      }));
      
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  /**
   * Update Existing Movie
   * 
   * Demonstrates:
   * - Partial utility type for updates
   * - Array method typing (map with type preservation)
   * - Conditional logic with type safety
   */
  const updateMovie = useCallback(async (
    id: number, 
    updates: Partial<Movie>
  ): Promise<Movie> => {
    try {
      const response: ApiResponse<Movie> = await movieAPI.updateMovie(id, updates);
      
      setState(prev => ({
        ...prev,
        movies: prev.movies.map(movie => 
          movie.id === id ? response.data : movie
        )
      }));
      
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  /**
   * Delete Movie
   * 
   * Demonstrates:
   * - Void Promise for delete operations
   * - Array filtering with type safety
   * - State update with type preservation
   */
  const deleteMovie = useCallback(async (id: number): Promise<void> => {
    try {
      await movieAPI.deleteMovie(id);
      
      setState(prev => ({
        ...prev,
        movies: prev.movies.filter(movie => movie.id !== id)
      }));
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  /**
   * Refetch Movies
   * 
   * Demonstrates:
   * - Simple wrapper function typing
   * - First page reset functionality
   */
  const refetch = useCallback((): void => {
    fetchMovies(1);
  }, [fetchMovies]);

  /**
   * Auto-fetch Effect
   * 
   * Demonstrates:
   * - Effect with conditional execution
   * - Dependency array typing
   * - Cleanup function (though not needed here)
   */
  useEffect((): void => {
    if (autoFetch) {
      fetchMovies(initialPage);
    }
  }, [fetchMovies, initialPage, autoFetch] as const); // const assertion for readonly dependency array

  // Return complete hook API
  return {
    ...state,
    loadMore,
    retry,
    addMovie,
    updateMovie,
    deleteMovie,
    refetch
  };
}

export default useMovies;

/**
 * ADVANCED TYPESCRIPT PATTERNS DEMONSTRATED:
 * 
 * 1. INTERFACE COMPOSITION:
 *    - UseMoviesState for internal state
 *    - UseMoviesReturn extends state with methods
 *    - UseMoviesOptions for configuration
 * 
 * 2. UTILITY TYPES:
 *    - Omit<Movie, 'id'> for new movie creation
 *    - Partial<Movie> for updates
 *    - readonly modifiers for immutability
 * 
 * 3. GENERIC CONSTRAINTS:
 *    - API response typing with generics
 *    - State update function typing
 *    - Promise typing with specific return types
 * 
 * 4. ERROR HANDLING:
 *    - Type narrowing for error messages
 *    - Custom error extraction utility
 *    - Optional error callbacks with proper typing
 * 
 * 5. FUNCTIONAL PATTERNS:
 *    - useCallback with comprehensive dependency typing
 *    - State updates with type preservation
 *    - Immutable operations with type safety
 * 
 * 6. CONFIGURATION:
 *    - Options pattern with sensible defaults
 *    - Optional callbacks with proper signatures
 *    - Conditional behavior with type safety
 */

/**
 * USAGE EXAMPLES:
 * 
 * // Basic usage
 * const { movies, loading, error, loadMore } = useMovies();
 * 
 * // With options
 * const movieHook = useMovies({
 *   initialPage: 2,
 *   pageSize: 10,
 *   onError: (error) => console.error('Movie fetch failed:', error),
 *   onSuccess: (movies) => console.log('Loaded movies:', movies.length)
 * });
 * 
 * // Add new movie
 * const handleAddMovie = async () => {
 *   try {
 *     const newMovie = await movieHook.addMovie({
 *       title: 'New Movie',
 *       overview: 'A great movie',
 *       releaseYear: 2023,
 *       voteAverage: 8.5,
 *       ratingStars: 4,
 *       genres: [],
 *       isPopular: true
 *     });
 *     console.log('Added movie:', newMovie);
 *   } catch (error) {
 *     console.error('Failed to add movie:', error);
 *   }
 * };
 */
```

---

## 🌐 API Service Comparison

### JavaScript Version
```javascript
// api.js
class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getMovies(page = 1) {
    return this.request(`/movies?page=${page}`);
  }

  async getMovie(id) {
    return this.request(`/movies/${id}`);
  }

  async searchMovies(query) {
    return this.request(`/movies/search?q=${encodeURIComponent(query)}`);
  }

  async rateMovie(id, rating) {
    return this.request(`/movies/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  }
}

export const movieAPI = new APIClient('http://localhost:3001/api');
```

### TypeScript Version
```typescript
// api.ts
import type { 
  Movie, 
  ApiResponse, 
  PaginatedResponse, 
  MovieSearchFilters,
  ApiError,
  HttpMethod 
} from '@/types';

/**
 * API Client Configuration
 */
interface APIClientConfig {
  readonly baseUrl: string;
  readonly timeout?: number;
  readonly headers?: Record<string, string>;
  readonly interceptors?: {
    request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    response?: (response: Response) => Response | Promise<Response>;
  };
}

/**
 * Request Configuration
 */
interface RequestConfig extends RequestInit {
  readonly endpoint: string;
  readonly params?: Record<string, string | number | boolean>;
  readonly timeout?: number;
}

/**
 * Comprehensive API Client with Full TypeScript Integration
 */
class APIClient {
  private readonly config: APIClientConfig;

  constructor(config: APIClientConfig) {
    this.config = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    };
  }

  /**
   * Generic Request Method
   * 
   * Demonstrates:
   * - Generic type parameters for response typing
   * - Complex parameter handling with type safety
   * - Error handling with custom error types
   * - Promise typing with specific return types
   */
  private async request<T>(config: RequestConfig): Promise<T> {
    const { endpoint, params, timeout = this.config.timeout, ...options } = config;
    
    // Build URL with query parameters
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Apply request interceptor
    const finalConfig = await this.config.interceptors?.request?.(config) ?? config;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let response = await fetch(url.toString(), {
        headers: {
          ...this.config.headers,
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });

      // Apply response interceptor
      response = await this.config.interceptors?.response?.(response) ?? response;

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }

      throw error instanceof APIError ? error : new APIError(
        'Network request failed',
        0,
        { originalError: error }
      );
    }
  }

  /**
   * Get Movies with Pagination
   * 
   * Demonstrates specific return type annotation.
   */
  async getMovies(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Movie>> {
    return this.request<PaginatedResponse<Movie>>({
      endpoint: '/movies',
      params: { page, limit }
    });
  }

  /**
   * Get Single Movie
   * 
   * Demonstrates API response wrapper typing.
   */
  async getMovie(id: number): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>({
      endpoint: `/movies/${id}`
    });
  }

  /**
   * Search Movies
   * 
   * Demonstrates complex parameter typing with optional filters.
   */
  async searchMovies(
    query: string, 
    filters?: MovieSearchFilters,
    page: number = 1
  ): Promise<PaginatedResponse<Movie>> {
    return this.request<PaginatedResponse<Movie>>({
      endpoint: '/movies/search',
      params: {
        q: query,
        page,
        ...(filters && { filters: JSON.stringify(filters) })
      }
    });
  }

  /**
   * Rate Movie
   * 
   * Demonstrates POST request with typed body.
   */
  async rateMovie(id: number, rating: number): Promise<ApiResponse<{ newAverage: number }>> {
    return this.request<ApiResponse<{ newAverage: number }>>({
      endpoint: `/movies/${id}/rate`,
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  }

  /**
   * Create Movie
   * 
   * Demonstrates Omit utility type for creation.
   */
  async createMovie(movieData: Omit<Movie, 'id'>): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>({
      endpoint: '/movies',
      method: 'POST',
      body: JSON.stringify(movieData)
    });
  }

  /**
   * Update Movie
   * 
   * Demonstrates Partial utility type for updates.
   */
  async updateMovie(id: number, updates: Partial<Movie>): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>({
      endpoint: `/movies/${id}`,
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Delete Movie
   * 
   * Demonstrates void Promise for delete operations.
   */
  async deleteMovie(id: number): Promise<void> {
    await this.request<void>({
      endpoint: `/movies/${id}`,
      method: 'DELETE'
    });
  }
}

/**
 * Custom API Error Class
 */
class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Export configured API client
export const movieAPI = new APIClient({
  baseUrl: 'http://localhost:3001/api',
  timeout: 10000,
  interceptors: {
    request: async (config) => {
      // Add authentication token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        return {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        };
      }
      return config;
    },
    response: async (response) => {
      // Handle global response logic
      if (response.status === 401) {
        // Handle authentication errors
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      return response;
    }
  }
});

export { APIClient, APIError };
```

---

## 📊 State Management Comparison

### JavaScript Version
```javascript
// AppContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_MOVIES':
      return { ...state, movies: action.payload };
    case 'ADD_MOVIE':
      return { ...state, movies: [...state.movies, action.payload] };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload]
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    movies: [],
    favorites: [],
    loading: false,
    error: null
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
```

### TypeScript Version
```typescript
// AppContext.tsx
import React, { 
  createContext, 
  useContext, 
  useReducer, 
  type FC, 
  type ReactNode, 
  type Dispatch 
} from 'react';
import type { Movie } from '@/types';

/**
 * Application State Interface
 * 
 * Defines the complete shape of application state.
 */
interface AppState {
  readonly movies: readonly Movie[];
  readonly favorites: readonly number[]; // Movie IDs
  readonly loading: boolean;
  readonly error: string | null;
  readonly user: User | null;
  readonly theme: 'light' | 'dark';
  readonly filters: MovieFilters;
}

/**
 * User Interface
 */
interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly preferences: UserPreferences;
}

/**
 * User Preferences Interface
 */
interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly autoplay: boolean;
  readonly notifications: boolean;
}

/**
 * Movie Filters Interface
 */
interface MovieFilters {
  readonly genre?: string;
  readonly year?: number;
  readonly rating?: number;
  readonly search?: string;
}

/**
 * Action Type Definitions
 * 
 * Demonstrates discriminated union for type-safe actions.
 */
type AppAction = 
  | { type: 'SET_MOVIES'; payload: readonly Movie[] }
  | { type: 'ADD_MOVIE'; payload: Movie }
  | { type: 'UPDATE_MOVIE'; payload: { id: number; updates: Partial<Movie> } }
  | { type: 'DELETE_MOVIE'; payload: number }
  | { type: 'TOGGLE_FAVORITE'; payload: number }
  | { type: 'SET_FAVORITES'; payload: readonly number[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_FILTERS'; payload: Partial<MovieFilters> }
  | { type: 'RESET_STATE' };

/**
 * Context Value Interface
 * 
 * Defines the complete context API.
 */
interface AppContextValue {
  readonly state: AppState;
  readonly dispatch: Dispatch<AppAction>;
  readonly actions: {
    readonly setMovies: (movies: readonly Movie[]) => void;
    readonly addMovie: (movie: Movie) => void;
    readonly updateMovie: (id: number, updates: Partial<Movie>) => void;
    readonly deleteMovie: (id: number) => void;
    readonly toggleFavorite: (movieId: number) => void;
    readonly setLoading: (loading: boolean) => void;
    readonly setError: (error: string | null) => void;
    readonly setUser: (user: User | null) => void;
    readonly setTheme: (theme: 'light' | 'dark') => void;
    readonly setFilters: (filters: Partial<MovieFilters>) => void;
    readonly resetState: () => void;
  };
}

/**
 * Initial State
 */
const initialState: AppState = {
  movies: [],
  favorites: [],
  loading: false,
  error: null,
  user: null,
  theme: 'light',
  filters: {}
};

/**
 * Type-Safe Reducer Function
 * 
 * Demonstrates exhaustive action handling with TypeScript.
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MOVIES':
      return { 
        ...state, 
        movies: action.payload,
        error: null 
      };

    case 'ADD_MOVIE':
      return { 
        ...state, 
        movies: [action.payload, ...state.movies] 
      };

    case 'UPDATE_MOVIE':
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie.id === action.payload.id
            ? { ...movie, ...action.payload.updates }
            : movie
        )
      };

    case 'DELETE_MOVIE':
      return {
        ...state,
        movies: state.movies.filter(movie => movie.id !== action.payload),
        favorites: state.favorites.filter(id => id !== action.payload)
      };

    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.includes(action.payload)
          ? state.favorites.filter(id => id !== action.payload)
          : [...state.favorites, action.payload]
      };

    case 'SET_FAVORITES':
      return { 
        ...state, 
        favorites: action.payload 
      };

    case 'SET_LOADING':
      return { 
        ...state, 
        loading: action.payload 
      };

    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        loading: false 
      };

    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload 
      };

    case 'SET_THEME':
      return { 
        ...state, 
        theme: action.payload 
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case 'RESET_STATE':
      return initialState;

    default:
      // TypeScript ensures all cases are handled
      const exhaustiveCheck: never = action;
      return state;
  }
}

/**
 * Context Creation with Strict Typing
 */
const AppContext = createContext<AppContextValue | null>(null);

/**
 * Provider Component with Action Creators
 * 
 * Demonstrates comprehensive context provider with typed actions.
 */
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators for better DX
  const actions: AppContextValue['actions'] = {
    setMovies: (movies: readonly Movie[]): void => {
      dispatch({ type: 'SET_MOVIES', payload: movies });
    },

    addMovie: (movie: Movie): void => {
      dispatch({ type: 'ADD_MOVIE', payload: movie });
    },

    updateMovie: (id: number, updates: Partial<Movie>): void => {
      dispatch({ type: 'UPDATE_MOVIE', payload: { id, updates } });
    },

    deleteMovie: (id: number): void => {
      dispatch({ type: 'DELETE_MOVIE', payload: id });
    },

    toggleFavorite: (movieId: number): void => {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: movieId });
    },

    setLoading: (loading: boolean): void => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | null): void => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    setUser: (user: User | null): void => {
      dispatch({ type: 'SET_USER', payload: user });
    },

    setTheme: (theme: 'light' | 'dark'): void => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },

    setFilters: (filters: Partial<MovieFilters>): void => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    },

    resetState: (): void => {
      dispatch({ type: 'RESET_STATE' });
    }
  };

  const contextValue: AppContextValue = {
    state,
    dispatch,
    actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom Hook for Context Consumption
 * 
 * Demonstrates context hook with proper error handling.
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

/**
 * Selector Hook for Performance
 * 
 * Demonstrates advanced context usage with selectors.
 */
export function useAppSelector<T>(
  selector: (state: AppState) => T
): T {
  const { state } = useAppContext();
  return selector(state);
}

// Export types for external usage
export type { AppState, AppAction, User, MovieFilters };
```

---

## 🎯 Key Differences Summary

| Aspect | JavaScript | TypeScript | Benefits |
|--------|------------|------------|----------|
| **Type Safety** | Runtime errors | Compile-time errors | Catch bugs early |
| **IDE Support** | Basic autocomplete | Full IntelliSense | Better DX |
| **Refactoring** | Find/replace | Safe rename | No broken references |
| **Documentation** | Comments only | Types + comments | Self-documenting |
| **API Contracts** | Trust the docs | Enforced interfaces | Guaranteed compatibility |
| **State Management** | Any shape | Strict structure | Predictable state |
| **Event Handling** | Generic events | Typed events | Proper event usage |
| **Error Handling** | Try/catch everything | Type-safe errors | Better error info |

---

## 🚀 Migration Strategy

### **1. Gradual Adoption**
```typescript
// Start with .ts files for new code
// Rename .js to .tsx/.ts gradually
// Add `// @ts-check` to JS files for basic checking
```

### **2. Type Safety Levels**
```typescript
// Level 1: Basic annotations
let count: number = 0;

// Level 2: Interface definitions  
interface Props { name: string; }

// Level 3: Advanced patterns
type Result<T> = Success<T> | Error;
```

### **3. Common Patterns**
```typescript
// Any to proper types
const data: any = {}; // ❌ Avoid
const data: User = {}; // ✅ Better

// Prop drilling to context
// JavaScript: Pass props down multiple levels
// TypeScript: Type-safe context with selectors
```

This comparison shows how TypeScript enhances every aspect of React development while maintaining identical functionality. The type system catches errors early, improves development experience, and makes code more maintainable and self-documenting.

Ready to make the switch? Start with our TypeScript version and experience the difference! 🎉
# 🎓 Comprehensive TypeScript Tutorial: From JavaScript to Advanced Types

Welcome to the most comprehensive TypeScript tutorial ever created! This guide takes you from JavaScript familiarity to TypeScript mastery through practical, real-world examples in our educational movie app.

## 🎯 Tutorial Overview

This tutorial is designed to teach TypeScript through **direct comparison** with JavaScript, showing you exactly how to enhance your existing knowledge with TypeScript's powerful type system.

### **Learning Approach**
- 📊 **Side-by-side comparisons** between JavaScript and TypeScript
- 🔄 **Progressive complexity** from basic types to advanced patterns  
- 🎬 **Real-world context** using our movie app
- 💡 **Practical examples** for every concept
- 🧪 **Interactive learning** with runnable code

---

## 📚 Chapter 1: TypeScript Fundamentals

### **1.1 Why TypeScript?**

TypeScript adds static type checking to JavaScript, catching errors at compile time rather than runtime.

```javascript
// JavaScript - Runtime Error 💥
function greet(name) {
  return "Hello, " + name.toUpperCase();
}

greet(null); // TypeError: Cannot read property 'toUpperCase' of null
```

```typescript
// TypeScript - Compile Time Error ✅
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}

greet(null); // ❌ Argument of type 'null' is not assignable to parameter of type 'string'
```

### **1.2 Basic Type Annotations**

#### **Primitive Types**
```typescript
// Basic type annotations
let movieTitle: string = "The Dark Knight";
let releaseYear: number = 2008;
let isPopular: boolean = true;
let posterUrl: string | null = null; // Union type
```

#### **Array Types**
```typescript
// Array typing options
let genres: string[] = ["Action", "Drama"];
let ratings: Array<number> = [8.5, 9.2, 7.8];
let mixed: (string | number)[] = ["Action", 8.5];
```

#### **Object Types**
```typescript
// Object type annotation
let movie: {
  title: string;
  year: number;
  rating?: number; // Optional property
} = {
  title: "Inception",
  year: 2010
};
```

### **1.3 Function Typing**

```javascript
// JavaScript
function calculateRating(votes, total) {
  return votes / total;
}
```

```typescript
// TypeScript - Explicit typing
function calculateRating(votes: number, total: number): number {
  return votes / total;
}

// Arrow function with types
const calculateAverage = (ratings: number[]): number => {
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

// Optional parameters
function formatTitle(title: string, year?: number): string {
  return year ? `${title} (${year})` : title;
}

// Default parameters
function createMovie(title: string, genre: string = "Drama"): Movie {
  return { title, genre, id: Math.random() };
}
```

---

## 📚 Chapter 2: Interfaces and Type Aliases

### **2.1 Interface Definitions**

Interfaces define the shape of objects and provide contracts for your code.

```typescript
/**
 * Movie Interface - Complete type definition
 */
interface Movie {
  readonly id: number;           // Readonly property
  title: string;
  overview: string;
  releaseYear: number;
  voteAverage: number;
  ratingStars: 1 | 2 | 3 | 4 | 5; // Union of literal types
  posterUrl?: string;            // Optional property
  genres: readonly Genre[];      // Readonly array
  isPopular: boolean;
}

/**
 * Genre Interface
 */
interface Genre {
  readonly id: number;
  readonly name: string;
}
```

#### **Interface Extension**
```typescript
// Extending interfaces
interface MovieWithUserData extends Movie {
  userRating?: number;
  isFavorite?: boolean;
  watchedDate?: Date;
  userNotes?: string;
}

// Multiple inheritance
interface TimestampedMovie extends Movie, Timestamped {
  // Combines both interfaces
}

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}
```

### **2.2 Type Aliases vs Interfaces**

```typescript
// Type alias - good for unions, primitives, computed types
type NavigationSection = 'welcome' | 'components' | 'hooks' | 'api';
type Status = 'loading' | 'success' | 'error';
type EventHandler<T> = (event: T) => void;

// Interface - good for object shapes, extensible
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// When to use which?
// ✅ Use interface for object shapes that might be extended
// ✅ Use type alias for unions, primitives, and computed types
```

### **2.3 Optional vs Required Properties**

```typescript
interface MovieFormData {
  title: string;           // Required
  overview?: string;       // Optional
  releaseYear: number;     // Required
  genres: Genre[];         // Required
}

// Making all properties optional
type PartialMovieFormData = Partial<MovieFormData>;
// Result: { title?: string; overview?: string; ... }

// Making all properties required
type RequiredMovieFormData = Required<MovieFormData>;
// Result: { title: string; overview: string; ... }
```

---

## 📚 Chapter 3: Advanced Type Patterns

### **3.1 Union Types**

Union types allow a value to be one of several types.

```typescript
// Simple union
type Theme = 'light' | 'dark' | 'auto';

// Union with different types
type ID = string | number;

// Discriminated union for state management
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Usage with type guards
function handleMovieState(state: AsyncState<Movie[]>) {
  switch (state.status) {
    case 'idle':
      return <div>Ready to load movies</div>;
    case 'loading':
      return <div>Loading movies...</div>;
    case 'success':
      // TypeScript knows 'data' exists here
      return <MovieList movies={state.data} />;
    case 'error':
      // TypeScript knows 'error' exists here
      return <div>Error: {state.error}</div>;
  }
}
```

### **3.2 Intersection Types**

Intersection types combine multiple types.

```typescript
// Combining types with intersection
type MovieWithTimestamps = Movie & {
  createdAt: Date;
  updatedAt: Date;
};

type SearchableMovie = Movie & {
  searchScore: number;
  matchedFields: string[];
};

// Utility for adding common properties
type WithID<T> = T & { id: string };
type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

type TimestampedMovie = WithTimestamps<Movie>;
```

### **3.3 Generic Types**

Generics provide reusable type patterns.

```typescript
// Generic interface
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// Generic function
function createApiResponse<T>(data: T, success: boolean = true): ApiResponse<T> {
  return {
    data,
    success,
    timestamp: new Date().toISOString()
  };
}

// Usage
const movieResponse = createApiResponse<Movie[]>([movie1, movie2]);
const userResponse = createApiResponse<User>(currentUser);

// Generic constraints
interface Identifiable {
  id: string | number;
}

function updateEntity<T extends Identifiable>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
```

### **3.4 Conditional Types**

Conditional types enable type logic based on conditions.

```typescript
// Basic conditional type
type ApiResult<T> = T extends string ? { message: T } : { data: T };

// Practical example
type EventPayload<T extends string> = 
  T extends 'user-login' ? { userId: string; timestamp: Date } :
  T extends 'movie-rated' ? { movieId: number; rating: number } :
  T extends 'search-performed' ? { query: string; resultCount: number } :
  never;

// Extract array element type
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
type MovieGenre = ArrayElement<Movie['genres']>; // Result: Genre

// Extract Promise type
type PromiseValue<T> = T extends Promise<infer U> ? U : T;
type MovieData = PromiseValue<Promise<Movie>>; // Result: Movie
```

### **3.5 Mapped Types**

Mapped types transform existing types.

```typescript
// Make all properties optional
type PartialMovie = {
  [K in keyof Movie]?: Movie[K];
};

// Make all properties readonly
type ReadonlyMovie = {
  readonly [K in keyof Movie]: Movie[K];
};

// Transform property types
type MovieStrings = {
  [K in keyof Movie]: string;
};

// Conditional mapped types
type MovieFlags = {
  [K in keyof Movie]: Movie[K] extends string ? boolean : never;
};

// Pick specific properties
type MovieSummary = Pick<Movie, 'id' | 'title' | 'releaseYear'>;

// Omit specific properties
type MovieWithoutDates = Omit<Movie, 'createdAt' | 'updatedAt'>;
```

### **3.6 Template Literal Types**

Template literal types enable string manipulation at the type level.

```typescript
// CSS custom properties
type CSSVariable<T extends string> = `--${T}`;
type ThemeColor = 'primary' | 'secondary' | 'accent';
type ThemeColorVar = CSSVariable<`color-${ThemeColor}`>;
// Result: "--color-primary" | "--color-secondary" | "--color-accent"

// API endpoint types
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint<T extends string> = `/${T}`;
type MovieEndpoints = APIEndpoint<`movies/${'popular' | 'trending' | 'search'}`>;
// Result: "/movies/popular" | "/movies/trending" | "/movies/search"

// Event naming patterns
type EventName<T extends string, U extends string> = `${T}:${U}`;
type MovieEvent = EventName<'movie', 'rated' | 'favorited' | 'shared'>;
// Result: "movie:rated" | "movie:favorited" | "movie:shared"
```

---

## 📚 Chapter 4: React + TypeScript Patterns

### **4.1 Component Typing**

```jsx
// JavaScript Component
function MovieCard({ movie, onRate, onFavorite }) {
  return (
    <div onClick={() => onRate(movie, 5)}>
      <h3>{movie.title}</h3>
      <button onClick={() => onFavorite(movie)}>
        ❤️
      </button>
    </div>
  );
}
```

```tsx
// TypeScript Component
import { FC } from 'react';

interface MovieCardProps {
  readonly movie: Movie;
  readonly onRate?: (movie: Movie, rating: number) => void;
  readonly onFavorite?: (movie: Movie) => void;
  readonly className?: string;
  readonly showActions?: boolean;
}

const MovieCard: FC<MovieCardProps> = ({
  movie,
  onRate,
  onFavorite,
  className,
  showActions = true
}) => {
  return (
    <div 
      className={className}
      onClick={() => onRate?.(movie, 5)}
    >
      <h3>{movie.title}</h3>
      {showActions && (
        <button onClick={() => onFavorite?.(movie)}>
          ❤️
        </button>
      )}
    </div>
  );
};
```

### **4.2 Hook Typing**

```typescript
// Custom hook with comprehensive typing
interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<Movie>;
  updateMovie: (id: number, updates: Partial<Movie>) => Promise<Movie>;
  deleteMovie: (id: number) => Promise<void>;
}

function useMovies(): UseMoviesReturn {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getMovies();
      setMovies(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMovie = useCallback(async (movieData: Omit<Movie, 'id'>): Promise<Movie> => {
    const response = await api.createMovie(movieData);
    setMovies(prev => [...prev, response.data]);
    return response.data;
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return {
    movies,
    loading,
    error,
    refetch: fetchMovies,
    addMovie,
    updateMovie: async (id, updates) => {
      const response = await api.updateMovie(id, updates);
      setMovies(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    },
    deleteMovie: async (id) => {
      await api.deleteMovie(id);
      setMovies(prev => prev.filter(m => m.id !== id));
    }
  };
}
```

### **4.3 Context API Typing**

```typescript
// Movie context with TypeScript
interface MovieContextValue {
  movies: Movie[];
  favorites: Movie[];
  addToFavorites: (movie: Movie) => void;
  removeFromFavorites: (movieId: number) => void;
  rateMovie: (movieId: number, rating: number) => void;
  searchMovies: (query: string) => Promise<Movie[]>;
}

const MovieContext = createContext<MovieContextValue | null>(null);

// Custom hook for consuming context
function useMovieContext(): MovieContextValue {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
}

// Provider component
const MovieProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);

  const addToFavorites = useCallback((movie: Movie): void => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === movie.id)) return prev;
      return [...prev, movie];
    });
  }, []);

  const contextValue: MovieContextValue = useMemo(() => ({
    movies,
    favorites,
    addToFavorites,
    removeFromFavorites: (movieId: number) => {
      setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    },
    rateMovie: async (movieId: number, rating: number) => {
      await api.rateMovie(movieId, rating);
      setMovies(prev => prev.map(movie => 
        movie.id === movieId 
          ? { ...movie, userRating: rating }
          : movie
      ));
    },
    searchMovies: api.searchMovies
  }), [movies, favorites, addToFavorites]);

  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};
```

### **4.4 Event Handling**

```typescript
// Event handler typing
interface MovieFormProps {
  onSubmit: (movie: Omit<Movie, 'id'>) => void;
  onCancel: () => void;
}

const MovieForm: FC<MovieFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    releaseYear: new Date().getFullYear()
  });

  // Form submission handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({
      ...formData,
      id: 0, // Will be assigned by server
      voteAverage: 0,
      ratingStars: 1,
      genres: [],
      isPopular: false
    });
  };

  // Input change handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  // Select change handler
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData(prev => ({
      ...prev,
      genre: event.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

## 📚 Chapter 5: API and RPC Communication

### **5.1 HTTP Client Typing**

```typescript
// API Response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// HTTP Client class
class APIClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
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

  // Type-safe API methods
  async getMovies(page: number = 1): Promise<PaginatedResponse<Movie>> {
    return this.request<PaginatedResponse<Movie>>(`/movies?page=${page}`);
  }

  async getMovie(id: number): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>(`/movies/${id}`);
  }

  async createMovie(movie: Omit<Movie, 'id'>): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>('/movies', {
      method: 'POST',
      body: JSON.stringify(movie)
    });
  }

  async updateMovie(id: number, updates: Partial<Movie>): Promise<ApiResponse<Movie>> {
    return this.request<ApiResponse<Movie>>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async searchMovies(query: string): Promise<PaginatedResponse<Movie>> {
    return this.request<PaginatedResponse<Movie>>(`/movies/search?q=${encodeURIComponent(query)}`);
  }
}
```

### **5.2 RPC Client Implementation**

Our TypeScript version includes a complete RPC system. Here's a simplified example:

```typescript
// RPC Method definitions
interface MovieRPCMethods {
  'movies.getPopular': {
    params: { page?: number; limit?: number };
    result: PaginatedResponse<Movie>;
  };
  'movies.search': {
    params: { query: string; filters?: SearchFilters };
    result: PaginatedResponse<Movie>;
  };
  'movies.rate': {
    params: { movieId: number; rating: number };
    result: { success: boolean; newAverage: number };
  };
}

// RPC Client interface
interface RPCClient {
  call<T extends keyof MovieRPCMethods>(
    method: T,
    params: MovieRPCMethods[T]['params']
  ): Promise<MovieRPCMethods[T]['result']>;
}

// Usage
const rpcClient: RPCClient = new WebSocketRPCClient('ws://localhost:3001');

// Type-safe RPC calls
const movies = await rpcClient.call('movies.getPopular', { page: 1 });
const searchResults = await rpcClient.call('movies.search', { query: 'action' });
const ratingResult = await rpcClient.call('movies.rate', { movieId: 123, rating: 5 });

// Compile-time errors for invalid calls
await rpcClient.call('movies.getPopular', { page: '1' }); // ❌ Type error
await rpcClient.call('invalid.method', {}); // ❌ Method doesn't exist
```

---

## 📚 Chapter 6: Error Handling and Validation

### **6.1 Error Type Hierarchy**

```typescript
// Base error types
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error types
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(
    message: string, 
    public readonly field: string,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
}

class ApiError extends AppError {
  readonly code = 'API_ERROR';
  
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

// Error result types
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function fetchMovie(id: number): Promise<Result<Movie, NotFoundError | ApiError>> {
  try {
    const response = await api.getMovie(id);
    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ApiError) {
      return { success: false, error };
    }
    return { 
      success: false, 
      error: new ApiError('Unexpected error occurred') 
    };
  }
}
```

### **6.2 Runtime Validation with Zod**

```typescript
import { z } from 'zod';

// Zod schemas for runtime validation
const MovieSchema = z.object({
  id: z.number().positive(),
  title: z.string().min(1).max(255),
  overview: z.string(),
  releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 10),
  voteAverage: z.number().min(0).max(10),
  ratingStars: z.number().int().min(1).max(5),
  posterUrl: z.string().url().optional(),
  genres: z.array(z.object({
    id: z.number(),
    name: z.string()
  })),
  isPopular: z.boolean()
});

// Infer TypeScript type from Zod schema
type Movie = z.infer<typeof MovieSchema>;

// Validation function
function validateMovie(data: unknown): Result<Movie, ValidationError> {
  try {
    const movie = MovieSchema.parse(data);
    return { success: true, data: movie };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: new ValidationError(
          firstError.message,
          firstError.path.join('.'),
          { zodError: error }
        )
      };
    }
    return {
      success: false,
      error: new ValidationError('Invalid data format', 'unknown')
    };
  }
}
```

---

## 📚 Chapter 7: Advanced TypeScript Patterns

### **7.1 Branded Types**

Branded types add compile-time safety to primitive types.

```typescript
// Create branded types for IDs
type UserId = number & { readonly __brand: 'UserId' };
type MovieId = number & { readonly __brand: 'MovieId' };
type GenreId = number & { readonly __brand: 'GenreId' };

// Helper functions to create branded types
function createUserId(id: number): UserId {
  return id as UserId;
}

function createMovieId(id: number): MovieId {
  return id as MovieId;
}

// Usage - prevents mixing up different ID types
function getUserById(id: UserId): Promise<User> { /* */ }
function getMovieById(id: MovieId): Promise<Movie> { /* */ }

const userId = createUserId(123);
const movieId = createMovieId(456);

getUserById(movieId); // ❌ Compile error - wrong ID type!
getUserById(userId);  // ✅ Correct
```

### **7.2 State Machines with Discriminated Unions**

```typescript
// State machine for movie loading
type MovieLoadingState = 
  | { status: 'idle' }
  | { status: 'loading'; startTime: Date }
  | { status: 'success'; data: Movie[]; loadTime: number }
  | { status: 'error'; error: string; retryCount: number };

// State transitions
class MovieLoader {
  private state: MovieLoadingState = { status: 'idle' };

  getState(): MovieLoadingState {
    return this.state;
  }

  async loadMovies(): Promise<void> {
    this.state = { status: 'loading', startTime: new Date() };

    try {
      const response = await api.getMovies();
      const loadTime = Date.now() - this.state.startTime.getTime();
      
      this.state = {
        status: 'success',
        data: response.data,
        loadTime
      };
    } catch (error) {
      this.state = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0
      };
    }
  }

  retry(): void {
    if (this.state.status === 'error') {
      this.state = {
        ...this.state,
        retryCount: this.state.retryCount + 1
      };
      this.loadMovies();
    }
  }
}
```

### **7.3 Builder Patterns**

```typescript
// Movie builder with fluent interface
class MovieBuilder {
  private movie: Partial<Movie> = {};

  setTitle(title: string): this {
    this.movie.title = title;
    return this;
  }

  setOverview(overview: string): this {
    this.movie.overview = overview;
    return this;
  }

  setYear(year: number): this {
    this.movie.releaseYear = year;
    return this;
  }

  addGenre(genre: Genre): this {
    this.movie.genres = [...(this.movie.genres || []), genre];
    return this;
  }

  setRating(rating: 1 | 2 | 3 | 4 | 5): this {
    this.movie.ratingStars = rating;
    return this;
  }

  build(): Movie {
    // Validation
    if (!this.movie.title || !this.movie.overview || !this.movie.releaseYear) {
      throw new Error('Movie must have title, overview, and release year');
    }

    return {
      id: Math.random(), // Would be generated by server
      title: this.movie.title,
      overview: this.movie.overview,
      releaseYear: this.movie.releaseYear,
      voteAverage: 0,
      ratingStars: this.movie.ratingStars || 3,
      genres: this.movie.genres || [],
      isPopular: false
    };
  }
}

// Usage
const movie = new MovieBuilder()
  .setTitle("The Matrix")
  .setOverview("A computer programmer discovers reality is a simulation")
  .setYear(1999)
  .setRating(5)
  .addGenre({ id: 1, name: "Sci-Fi" })
  .addGenre({ id: 2, name: "Action" })
  .build();
```

### **7.4 Functional Programming Patterns**

```typescript
// Option type for null handling
type Option<T> = Some<T> | None;

interface Some<T> {
  readonly kind: 'some';
  readonly value: T;
}

interface None {
  readonly kind: 'none';
}

// Helper functions
function some<T>(value: T): Option<T> {
  return { kind: 'some', value };
}

function none<T = never>(): Option<T> {
  return { kind: 'none' };
}

// Option methods
function map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {
  return option.kind === 'some' ? some(fn(option.value)) : none();
}

function flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  return option.kind === 'some' ? fn(option.value) : none();
}

function getOrElse<T>(option: Option<T>, defaultValue: T): T {
  return option.kind === 'some' ? option.value : defaultValue;
}

// Usage
function findMovieById(id: MovieId, movies: Movie[]): Option<Movie> {
  const movie = movies.find(m => m.id === id);
  return movie ? some(movie) : none();
}

const movieTitle = map(
  findMovieById(createMovieId(123), allMovies),
  movie => movie.title
);

const titleOrDefault = getOrElse(movieTitle, 'Unknown Movie');
```

---

## 📚 Chapter 8: Performance and Best Practices

### **8.1 TypeScript Performance Tips**

```typescript
// 1. Prefer interfaces over type aliases for object shapes
interface Movie {  // ✅ Better for objects
  id: number;
  title: string;
}

type Movie = {     // ❌ Less performant for complex objects
  id: number;
  title: string;
};

// 2. Use const assertions for readonly data
const MOVIE_GENRES = ['Action', 'Comedy', 'Drama'] as const;
type MovieGenre = typeof MOVIE_GENRES[number]; // 'Action' | 'Comedy' | 'Drama'

// 3. Prefer specific types over any
function processMovieData(data: unknown): Movie {  // ✅ Better than any
  if (isMovie(data)) {
    return data;
  }
  throw new Error('Invalid movie data');
}

// 4. Use type guards efficiently
function isMovie(value: unknown): value is Movie {
  return typeof value === 'object' && 
         value !== null && 
         'id' in value && 
         'title' in value;
}
```

### **8.2 Code Organization**

```
src/
├── types/              # Type definitions
│   ├── index.ts        # Main application types
│   ├── api.ts          # API-related types
│   └── components.ts   # Component prop types
├── utils/
│   ├── type-guards.ts  # Runtime type checking
│   └── validators.ts   # Validation functions
├── hooks/
│   ├── useMovies.ts    # Movie-related hooks
│   └── useApi.ts       # API hooks
└── services/
    ├── api.ts          # HTTP client
    └── rpc.ts          # RPC client
```

### **8.3 Testing TypeScript Code**

```typescript
// Type-safe testing with Jest
describe('Movie API', () => {
  test('should fetch movies with correct type', async () => {
    const mockMovies: Movie[] = [
      {
        id: 1,
        title: 'Test Movie',
        overview: 'A test movie',
        releaseYear: 2023,
        voteAverage: 8.5,
        ratingStars: 4,
        genres: [],
        isPopular: true
      }
    ];

    const api = new APIClient('http://test');
    jest.spyOn(api, 'getMovies').mockResolvedValue({
      data: mockMovies,
      success: true,
      timestamp: new Date().toISOString()
    });

    const result = await api.getMovies();
    
    // TypeScript ensures we're testing the right shape
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('Test Movie');
    expect(result.data[0].ratingStars).toBe(4);
  });

  test('should handle type validation errors', () => {
    const invalidData = { title: 123 }; // Wrong type
    
    const result = validateMovie(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.field).toBe('title');
    }
  });
});

// Testing React components with TypeScript
render(<MovieCard 
  movie={mockMovie} 
  onRate={mockOnRate}
  // TypeScript ensures all required props are provided
/>);
```

---

## 🎯 Summary: JavaScript vs TypeScript Benefits

### **JavaScript Challenges**
```javascript
// Runtime errors waiting to happen
function calculateAverageRating(movies) {
  return movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length;
}

calculateAverageRating(null); // 💥 Runtime error
calculateAverageRating([{ title: "Movie" }]); // 💥 NaN result
```

### **TypeScript Solutions**
```typescript
// Compile-time safety
function calculateAverageRating(movies: Movie[]): number {
  if (movies.length === 0) return 0;
  return movies.reduce((sum, movie) => sum + movie.voteAverage, 0) / movies.length;
}

calculateAverageRating(null); // ❌ Compile-time error
calculateAverageRating([]); // ✅ Returns 0 safely
calculateAverageRating([{ title: "Movie" }]); // ❌ Compile-time error - missing properties
```

### **Development Experience Benefits**

1. **IntelliSense & Autocomplete**: IDE knows exactly what properties and methods are available
2. **Refactoring Safety**: Rename operations update all references reliably  
3. **Error Prevention**: Catch bugs before they reach production
4. **Self-Documenting Code**: Types serve as always-up-to-date documentation
5. **Team Collaboration**: Shared understanding through type contracts
6. **Gradual Adoption**: Add types incrementally to existing JavaScript

---

## 🎓 Next Steps

Congratulations! You've completed the comprehensive TypeScript tutorial. Here's how to continue your TypeScript journey:

### **1. Practice Projects**
- Convert an existing JavaScript project to TypeScript
- Build a new project using advanced TypeScript patterns
- Contribute to open-source TypeScript projects

### **2. Advanced Topics**
- **Compiler API**: Build tools that work with TypeScript
- **Declaration Files**: Create types for JavaScript libraries  
- **Module Augmentation**: Extend existing types
- **Decorators**: Metadata and code transformation

### **3. Ecosystem Integration**
- **GraphQL + TypeScript**: Type-safe GraphQL clients
- **Node.js + TypeScript**: Backend development
- **Testing**: Advanced testing patterns with TypeScript
- **Bundlers**: Webpack, Vite, and TypeScript optimization

### **4. Community Resources**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [TypeScript Discord](https://discord.gg/typescript)
- [Weekly TypeScript](https://typescript-weekly.com/)

---

**You're now ready to build production-ready TypeScript applications!** 🚀

The journey from JavaScript to TypeScript mastery is complete. Use this knowledge to build safer, more maintainable applications while enjoying the enhanced developer experience that TypeScript provides.
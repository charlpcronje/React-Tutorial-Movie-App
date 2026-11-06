# ⚛️ Chapter 5: React + TypeScript Integration

This chapter shows you how to apply TypeScript to React development, covering component typing, hook patterns, event handling, and more. By the end, you'll write type-safe React applications with confidence.

## 🎯 What You'll Learn: React Integration

> **Learning Goal #2**: Component typing, hook patterns, event handling

React and TypeScript work beautifully together. TypeScript enhances React by providing:
- **Type-safe props** - Never pass wrong props again
- **Event handling** - Know exactly what event properties exist
- **Hook typing** - Custom hooks with perfect return types
- **Context safety** - Global state with compile-time validation
- **Ref management** - Safe DOM element access

## 🧩 Component Props and Interfaces

### **Basic Component Typing**
```tsx
// Define prop types with interfaces
interface WelcomeProps {
  userName: string;
  age: number;
  isLoggedIn: boolean;
  favoriteMovies?: string[]; // Optional prop
}

// Function component with typed props
const Welcome: FC<WelcomeProps> = ({ userName, age, isLoggedIn, favoriteMovies }) => {
  return (
    <div>
      <h1>Welcome, {userName}!</h1>
      {isLoggedIn && <p>Age: {age}</p>}
      {favoriteMovies && (
        <ul>
          {favoriteMovies.map(movie => <li key={movie}>{movie}</li>)}
        </ul>
      )}
    </div>
  );
};

// Usage with type checking
<Welcome 
  userName="John"
  age={25}
  isLoggedIn={true}
  favoriteMovies={["Inception", "The Matrix"]}
/>

// ❌ This would cause TypeScript errors:
<Welcome userName={123} />           // Wrong type for userName
<Welcome />                          // Missing required props
```

### **Movie Card Component Example**
```tsx
interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genres: string[];
  posterUrl?: string;
}

interface MovieCardProps {
  movie: Movie;
  onRate: (movie: Movie, rating: number) => void;
  onFavorite: (movieId: number) => void;
  size?: 'small' | 'medium' | 'large';
  showActions?: boolean;
}

const MovieCard: FC<MovieCardProps> = ({
  movie,
  onRate,
  onFavorite,
  size = 'medium',
  showActions = true
}) => {
  const handleRating = (rating: number): void => {
    onRate(movie, rating);
  };

  const handleFavorite = (): void => {
    onFavorite(movie.id);
  };

  return (
    <div className={`movie-card movie-card--${size}`}>
      <h3>{movie.title} ({movie.year})</h3>
      <p>Rating: {movie.rating}/10</p>
      
      {showActions && (
        <div className="actions">
          {[1, 2, 3, 4, 5].map(rating => (
            <button key={rating} onClick={() => handleRating(rating)}>
              {rating}★
            </button>
          ))}
          <button onClick={handleFavorite}>❤️</button>
        </div>
      )}
    </div>
  );
};
```

### **Children Typing Patterns**
```tsx
// Simple children
interface ContainerProps {
  children: React.ReactNode;
}

// Render prop pattern
interface RenderPropProps {
  children: (data: Movie[]) => React.ReactNode;
}

// Function as children
const MovieProvider: FC<RenderPropProps> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  
  return <>{children(movies)}</>;
};

// Usage
<MovieProvider>
  {(movies) => (
    <div>
      {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )}
</MovieProvider>
```

## 🎪 Event Handling with TypeScript

### **Common Event Types**
```tsx
interface EventDemoProps {
  onSubmit: (data: FormData) => void;
}

const EventDemo: FC<EventDemoProps> = ({ onSubmit }) => {
  // Click events
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    console.log('Clicked at:', event.clientX, event.clientY);
  };

  // Form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  };

  // Input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    console.log('New value:', event.target.value);
  };

  // Key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      console.log('Enter pressed!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type something..."
      />
      <button onClick={handleClick} type="submit">
        Submit
      </button>
    </form>
  );
};
```

### **Movie Search Component with Events**
```tsx
interface MovieSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
}

interface SearchFilters {
  genre?: string;
  year?: number;
  minRating?: number;
}

const MovieSearch: FC<MovieSearchProps> = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters(prev => ({
      ...prev,
      genre: event.target.value || undefined
    }));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const year = parseInt(event.target.value, 10);
    setFilters(prev => ({
      ...prev,
      year: isNaN(year) ? undefined : year
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(query, filters);
  };

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setQuery('');
    setFilters({});
    onClear();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleSearchInput}
        placeholder="Search movies..."
      />
      
      <select onChange={handleGenreChange} value={filters.genre || ''}>
        <option value="">All Genres</option>
        <option value="Action">Action</option>
        <option value="Comedy">Comedy</option>
        <option value="Drama">Drama</option>
      </select>
      
      <input
        type="number"
        placeholder="Release year"
        onChange={handleYearChange}
        value={filters.year || ''}
      />
      
      <button type="submit">Search</button>
      <button type="button" onClick={handleClearClick}>Clear</button>
    </form>
  );
};
```

## 🎣 React Hooks with TypeScript

### **useState Hook Patterns**
```tsx
// Basic state
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');
const [isVisible, setIsVisible] = useState<boolean>(false);

// Object state
interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState<User | null>(null);
const [users, setUsers] = useState<User[]>([]);

// Complex state updates
const updateUser = (updates: Partial<User>): void => {
  setUser(prev => prev ? { ...prev, ...updates } : null);
};

// Lazy initial state
const [expensiveValue, setExpensiveValue] = useState<number>(() => {
  return calculateExpensiveValue();
});
```

### **useEffect Hook with Cleanup**
```tsx
const MovieTimer: FC = () => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect((): (() => void) => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup function with proper typing
    return (): void => {
      clearInterval(interval);
    };
  }, []); // Empty dependency array

  // Effect with dependencies
  useEffect((): void => {
    document.title = `Movie Timer: ${seconds}s`;
  }, [seconds]); // Dependency array with proper typing

  return <div>Timer: {seconds} seconds</div>;
};
```

### **useRef Hook for DOM Access**
```tsx
const VideoPlayer: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playVideo = (): void => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const focusInput = (): void => {
    inputRef.current?.focus(); // Optional chaining for safety
  };

  return (
    <div>
      <video ref={videoRef} src="/movie-trailer.mp4" />
      <input ref={inputRef} placeholder="Search..." />
      
      <button onClick={playVideo}>Play</button>
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```

### **Custom Hooks with TypeScript**
```tsx
// Custom hook return type
interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  fetchMovies: (page: number) => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
}

// Custom hook implementation
function useMovies(): UseMoviesReturn {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async (page: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/movies?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data: Movie[] = await response.json();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMovie = useCallback(async (movieData: Omit<Movie, 'id'>): Promise<void> => {
    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieData)
      });
      
      if (!response.ok) throw new Error('Failed to add movie');
      
      const newMovie: Movie = await response.json();
      setMovies(prev => [...prev, newMovie]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add movie');
    }
  }, []);

  return { movies, loading, error, fetchMovies, addMovie };
}

// Usage
const MovieList: FC = () => {
  const { movies, loading, error, fetchMovies } = useMovies();

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
```

## 🌐 Context API with TypeScript

### **Creating Type-Safe Context**
```tsx
// Context value type
interface MovieContextValue {
  movies: Movie[];
  currentMovie: Movie | null;
  setCurrentMovie: (movie: Movie) => void;
  addToFavorites: (movieId: number) => void;
  favorites: number[];
}

// Create context with default value
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
interface MovieProviderProps {
  children: React.ReactNode;
}

const MovieProvider: FC<MovieProviderProps> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const addToFavorites = useCallback((movieId: number): void => {
    setFavorites(prev => {
      if (prev.includes(movieId)) return prev;
      return [...prev, movieId];
    });
  }, []);

  const contextValue: MovieContextValue = useMemo(() => ({
    movies,
    currentMovie,
    setCurrentMovie,
    addToFavorites,
    favorites
  }), [movies, currentMovie, addToFavorites, favorites]);

  return (
    <MovieContext.Provider value={contextValue}>
      {children}
    </MovieContext.Provider>
  );
};

// Using the context
const MovieDetails: FC = () => {
  const { currentMovie, addToFavorites, favorites } = useMovieContext();

  if (!currentMovie) {
    return <div>No movie selected</div>;
  }

  const isFavorite = favorites.includes(currentMovie.id);

  return (
    <div>
      <h1>{currentMovie.title}</h1>
      <button onClick={() => addToFavorites(currentMovie.id)}>
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    </div>
  );
};
```

### **Multiple Contexts Pattern**
```tsx
// User context
interface UserContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

// Theme context
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Combined provider
const AppProviders: FC<{ children: React.ReactNode }> = ({ children }) => (
  <UserProvider>
    <ThemeProvider>
      <MovieProvider>
        {children}
      </MovieProvider>
    </ThemeProvider>
  </UserProvider>
);
```

## 🔗 Higher-Order Components (HOCs)

### **Creating Type-Safe HOCs**
```tsx
// HOC that adds loading state
function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { loading?: boolean }> {
  return (props) => {
    const { loading, ...restProps } = props;
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    return <Component {...restProps as P} />;
  };
}

// Usage
const MovieListWithLoading = withLoading(MovieCard);

<MovieListWithLoading movie={movie} loading={isLoading} />
```

### **Authentication HOC**
```tsx
interface WithAuthProps {
  user: User | null;
}

function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithAuthProps>> {
  return (props) => {
    const { user } = useUserContext();
    
    if (!user) {
      return <div>Please log in to continue</div>;
    }
    
    return <Component {...props as P} user={user} />;
  };
}

// Usage
interface ProtectedComponentProps extends WithAuthProps {
  title: string;
}

const ProtectedComponent: FC<ProtectedComponentProps> = ({ user, title }) => (
  <div>
    <h1>{title}</h1>
    <p>Welcome, {user.name}!</p>
  </div>
);

const ProtectedComponentWithAuth = withAuth(ProtectedComponent);

// Now user prop is automatically provided
<ProtectedComponentWithAuth title="Dashboard" />
```

## 🎭 Render Props Pattern

### **Type-Safe Render Props**
```tsx
interface RenderPropsComponentProps<T> {
  children: (data: T, loading: boolean, error: string | null) => React.ReactNode;
  url: string;
}

function DataFetcher<T>({ children, url }: RenderPropsComponentProps<T>): JSX.Element {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<Movie[]> url="/api/movies">
  {(movies, loading, error) => {
    if (loading) return <div>Loading movies...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!movies) return <div>No movies found</div>;
    
    return (
      <div>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    );
  }}
</DataFetcher>
```

## 🧪 Testing React Components with TypeScript

### **Component Testing**
```tsx
// MovieCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCard } from './MovieCard';

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  year: 2023,
  rating: 8.5,
  genres: ['Action', 'Drama'],
  posterUrl: '/test-poster.jpg'
};

describe('MovieCard', () => {
  it('renders movie information correctly', () => {
    const mockOnRate = jest.fn();
    const mockOnFavorite = jest.fn();

    render(
      <MovieCard
        movie={mockMovie}
        onRate={mockOnRate}
        onFavorite={mockOnFavorite}
      />
    );

    expect(screen.getByText('Test Movie (2023)')).toBeInTheDocument();
    expect(screen.getByText('Rating: 8.5/10')).toBeInTheDocument();
  });

  it('calls onRate when rating button is clicked', () => {
    const mockOnRate = jest.fn();
    const mockOnFavorite = jest.fn();

    render(
      <MovieCard
        movie={mockMovie}
        onRate={mockOnRate}
        onFavorite={mockOnFavorite}
      />
    );

    fireEvent.click(screen.getByText('5★'));
    expect(mockOnRate).toHaveBeenCalledWith(mockMovie, 5);
  });
});
```

### **Hook Testing**
```tsx
// useMovies.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMovies } from './useMovies';

// Mock fetch
global.fetch = jest.fn();

describe('useMovies', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('fetches movies successfully', async () => {
    const mockMovies: Movie[] = [mockMovie];
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMovies,
    });

    const { result } = renderHook(() => useMovies());

    await act(async () => {
      await result.current.fetchMovies(1);
    });

    expect(result.current.movies).toEqual(mockMovies);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useMovies());

    await act(async () => {
      await result.current.fetchMovies(1);
    });

    expect(result.current.movies).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API Error');
  });
});
```

## 🎯 Key Takeaways

### **React + TypeScript Benefits**
- **Prop Safety**: Never pass wrong props to components
- **Event Typing**: Know exactly what event properties exist
- **Hook Returns**: Custom hooks with perfect return types
- **Context Safety**: Global state with compile-time validation
- **Ref Management**: Safe DOM element access

### **Best Practices**
- Always type component props with interfaces
- Use proper event types for event handlers
- Type custom hook return values
- Create type-safe context patterns
- Test components with TypeScript types

### **Common Patterns**
- `FC<Props>` for functional components
- `React.ReactNode` for children
- `useRef<HTMLElement>(null)` for DOM refs
- Context with custom hooks for consumption
- Generic components for reusability

## 🚀 Next Steps

Now that you understand React + TypeScript integration, explore:

- **Chapter 6**: [API Communication](./06-api-communication.md) - Type-safe HTTP and RPC clients
- **Chapter 7**: [Error Handling](./07-error-handling.md) - Comprehensive error type strategies
- **Chapter 8**: [Advanced Patterns](./08-advanced-patterns.md) - Production-ready TypeScript patterns

React + TypeScript is a powerful combination that makes frontend development safer and more enjoyable! 🎉

---

**Next Up:** [Chapter 6: API Communication](./06-api-communication.md) - Learn how to build type-safe HTTP and RPC clients for communicating with servers.
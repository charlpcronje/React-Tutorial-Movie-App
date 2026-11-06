# 🧠 Advanced TypeScript Patterns for React

## Generics: Building Reusable Components

### Generic Component Example
```typescript
/**
 * Generic Data Table Component
 * T represents the type of data being displayed
 */
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

interface ColumnDefinition<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  sortable?: boolean;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false
}: DataTableProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(column => (
            <th key={String(column.key)}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr 
            key={index} 
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'clickable' : ''}
          >
            {columns.map(column => (
              <td key={String(column.key)}>
                {column.render 
                  ? column.render(item[column.key], item)
                  : String(item[column.key])
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage with strong typing
const movieColumns: ColumnDefinition<Movie>[] = [
  { key: 'title', title: 'Title' },
  { key: 'year', title: 'Year', sortable: true },
  { 
    key: 'genre', 
    title: 'Genre',
    render: (genres) => (genres as string[]).join(', ')
  }
];

<DataTable<Movie> 
  data={movies} 
  columns={movieColumns}
  onRowClick={handleMovieSelect}
/>
```

## Utility Types for Data Transformation

### Built-in Utility Types
```typescript
interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  director: string;
  rating: number;
}

// Pick specific properties
type MovieSummary = Pick<Movie, 'id' | 'title' | 'year'>;

// Omit certain properties
type MovieFormData = Omit<Movie, 'id'>;

// Make all properties optional
type PartialMovie = Partial<Movie>;

// Make all properties required
type RequiredMovie = Required<Movie>;

// Create a record type
type MovieDatabase = Record<string, Movie>;
```

### Custom Utility Types
```typescript
/**
 * Deep Partial - Makes all nested properties optional
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Non-Nullable - Removes null and undefined
 */
type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Extract function parameters
 */
type ExtractFunctionParams<T> = T extends (...args: infer P) => any ? P : never;

// Usage example
type MovieHandler = (movie: Movie, index: number) => void;
type HandlerParams = ExtractFunctionParams<MovieHandler>; // [Movie, number]
```

## Conditional Types & Template Literals

### Conditional Types
```typescript
/**
 * Conditional type that checks if T has an 'id' property
 */
type HasId<T> = T extends { id: any } ? true : false;

type MovieHasId = HasId<Movie>; // true
type StringHasId = HasId<string>; // false

/**
 * Extract array element type
 */
type ArrayElement<T> = T extends (infer E)[] ? E : T;
type MovieFromArray = ArrayElement<Movie[]>; // Movie

/**
 * API Response wrapper
 */
type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

// Conditional type for handling API responses
type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;
```

### Template Literal Types
```typescript
/**
 * Generate event handler names
 */
type EventHandlerName<T extends string> = `on${Capitalize<T>}`;

type MovieEvents = 'select' | 'delete' | 'edit';
type MovieHandlers = EventHandlerName<MovieEvents>; 
// "onSelect" | "onDelete" | "onEdit"

/**
 * CSS class name builder
 */
type Size = 'small' | 'medium' | 'large';
type Color = 'primary' | 'secondary' | 'danger';
type ButtonClass = `btn-${Size}-${Color}`;
// "btn-small-primary" | "btn-small-secondary" | ... etc

/**
 * API endpoint builder
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = '/movies' | '/users' | '/reviews';
type ApiRoute = `${HttpMethod} ${Endpoint}`;
```

## Advanced React Patterns

### Higher-Order Components (HOCs) with TypeScript
```typescript
/**
 * withLoading HOC - Adds loading state to any component
 */
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLoadingComponent(
    props: P & WithLoadingProps
  ) {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }
    
    return <WrappedComponent {...restProps as P} />;
  };
}

// Usage
const MovieListWithLoading = withLoading(MovieList);
<MovieListWithLoading movies={movies} isLoading={loading} />
```

### Render Props Pattern
```typescript
/**
 * DataFetcher component using render props
 */
interface DataFetcherProps<T> {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data logic here
  }, [url]);

  return <>{children({ data, loading, error })}</>;
}

// Usage with strong typing
<DataFetcher<Movie[]> url="/api/movies">
  {({ data, loading, error }) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <MovieList movies={data || []} />;
  }}
</DataFetcher>
```

## Type-Safe API Layer

### API Client with TypeScript
```typescript
/**
 * Type-safe API client
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  async post<T, D>(
    endpoint: string, 
    data: D
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

// Usage with type safety
const apiClient = new ApiClient('/api');

// TypeScript knows the return type
const moviesResponse = await apiClient.get<Movie[]>('/movies');
const newMovie = await apiClient.post<Movie, MovieFormData>('/movies', {
  title: "New Movie",
  year: 2024,
  genre: ["Action"]
});
```

## Error Handling with Types

### Result Type Pattern
```typescript
/**
 * Result type for handling success/error states
 */
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchMovies(): Promise<Result<Movie[], string>> {
  try {
    const response = await fetch('/api/movies');
    const movies = await response.json();
    return { success: true, data: movies };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Usage with exhaustive checking
const result = await fetchMovies();
if (result.success) {
  // TypeScript knows result.data is Movie[]
  setMovies(result.data);
} else {
  // TypeScript knows result.error is string
  setError(result.error);
}
```

## Performance Optimization Types

### Memoization with Types
```typescript
/**
 * Type-safe memoization hook
 */
function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Callback with stable typing
 */
const handleMovieSelect = useCallback(
  (movie: Movie) => {
    setSelectedMovie(movie);
  },
  [] // Dependencies
);

/**
 * Component memoization with proper props comparison
 */
const MemoizedMovieCard = React.memo<MovieCardProps>(
  MovieCard,
  (prevProps, nextProps) => {
    return (
      prevProps.movie.id === nextProps.movie.id &&
      prevProps.showDetails === nextProps.showDetails
    );
  }
);
```

## Best Practices Summary

1. **Use Generics**: Make components reusable while maintaining type safety
2. **Leverage Utility Types**: Transform types instead of duplicating definitions
3. **Conditional Types**: Create smart types that adapt based on input
4. **Template Literals**: Generate type-safe string unions
5. **Error Handling**: Use Result types for explicit error states
6. **Performance**: Type your optimization patterns for clarity

These advanced patterns enable you to build scalable, maintainable TypeScript applications that grow with your team! 🚀
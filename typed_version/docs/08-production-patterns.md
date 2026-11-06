# 🏭 Chapter 8: Production-Ready TypeScript Patterns

This final chapter covers production-ready TypeScript patterns, architectural decisions, and best practices for building maintainable, scalable TypeScript applications.

## 🎯 What You'll Learn: Production Readiness

> **Learning Goals #6-8**: Real-world TypeScript architecture, migration strategies, and development workflow

Building production applications requires more than just basic TypeScript knowledge. You need:
- **Architectural patterns** that scale with your team
- **Migration strategies** for existing JavaScript codebases  
- **Development workflows** that maximize TypeScript's benefits
- **Performance considerations** for large applications
- **Team collaboration** patterns and best practices

## 🏗️ Project Architecture Patterns

### **Domain-Driven Design with TypeScript**
```typescript
// Domain layer - pure business logic
namespace MovieDomain {
  // Value objects
  export class MovieId {
    constructor(private readonly value: number) {
      if (value <= 0) throw new Error('Invalid movie ID');
    }

    getValue(): number {
      return this.value;
    }

    equals(other: MovieId): boolean {
      return this.value === other.value;
    }
  }

  export class Rating {
    constructor(private readonly value: number) {
      if (value < 0 || value > 10) {
        throw new Error('Rating must be between 0 and 10');
      }
    }

    getValue(): number {
      return this.value;
    }

    isHighRating(): boolean {
      return this.value >= 8.0;
    }
  }

  // Entities
  export class Movie {
    constructor(
      private readonly id: MovieId,
      private title: string,
      private readonly releaseYear: number,
      private rating: Rating,
      private genres: readonly Genre[]
    ) {}

    getId(): MovieId {
      return this.id;
    }

    getTitle(): string {
      return this.title;
    }

    updateTitle(newTitle: string): void {
      if (newTitle.length < 1) {
        throw new ValidationError('Title cannot be empty', 'title');
      }
      this.title = newTitle;
    }

    updateRating(newRating: Rating): void {
      this.rating = newRating;
    }

    isClassic(): boolean {
      const currentYear = new Date().getFullYear();
      return (currentYear - this.releaseYear) >= 25;
    }

    hasGenre(genreName: string): boolean {
      return this.genres.some(genre => genre.getName() === genreName);
    }

    // Convert to plain object for serialization
    toJSON(): {
      id: number;
      title: string;
      releaseYear: number;
      rating: number;
      genres: string[];
      isClassic: boolean;
    } {
      return {
        id: this.id.getValue(),
        title: this.title,
        releaseYear: this.releaseYear,
        rating: this.rating.getValue(),
        genres: this.genres.map(g => g.getName()),
        isClassic: this.isClassic()
      };
    }
  }

  export class Genre {
    constructor(
      private readonly id: number,
      private readonly name: string
    ) {}

    getId(): number {
      return this.id;
    }

    getName(): string {
      return this.name;
    }
  }

  // Domain services
  export class MovieService {
    static calculateAverageRating(ratings: Rating[]): Rating {
      if (ratings.length === 0) {
        return new Rating(0);
      }

      const sum = ratings.reduce((total, rating) => total + rating.getValue(), 0);
      return new Rating(sum / ratings.length);
    }

    static findSimilarMovies(targetMovie: Movie, allMovies: Movie[]): Movie[] {
      return allMovies.filter(movie => {
        if (movie.getId().equals(targetMovie.getId())) return false;
        
        // Find movies with overlapping genres
        const targetGenres = movie.toJSON().genres;
        const movieGenres = targetMovie.toJSON().genres;
        const overlap = targetGenres.filter(genre => movieGenres.includes(genre));
        
        return overlap.length > 0;
      });
    }
  }
}
```

### **Repository Pattern with TypeScript**
```typescript
// Repository interface
interface MovieRepository {
  findById(id: MovieId): Promise<Movie | null>;
  findByGenre(genre: string): Promise<Movie[]>;
  search(query: string, filters: SearchFilters): Promise<PaginatedResult<Movie>>;
  save(movie: Movie): Promise<void>;
  delete(id: MovieId): Promise<void>;
}

// Implementation
class DatabaseMovieRepository implements MovieRepository {
  constructor(private db: Database) {}

  async findById(id: MovieId): Promise<Movie | null> {
    try {
      const row = await this.db.query(
        'SELECT * FROM movies WHERE id = ?',
        [id.getValue()]
      );

      if (!row) return null;

      return this.mapRowToMovie(row);
    } catch (error) {
      throw new ApiError('Database query failed', 500, error as Error);
    }
  }

  async findByGenre(genre: string): Promise<Movie[]> {
    const rows = await this.db.query(
      `SELECT DISTINCT m.* FROM movies m 
       JOIN movie_genres mg ON m.id = mg.movie_id 
       JOIN genres g ON mg.genre_id = g.id 
       WHERE g.name = ?`,
      [genre]
    );

    return rows.map(this.mapRowToMovie);
  }

  async search(
    query: string, 
    filters: SearchFilters
  ): Promise<PaginatedResult<Movie>> {
    let sql = `
      SELECT m.* FROM movies m 
      WHERE (m.title LIKE ? OR m.overview LIKE ?)
    `;
    let params: any[] = [`%${query}%`, `%${query}%`];

    // Apply filters
    if (filters.genre) {
      sql += ` AND EXISTS (
        SELECT 1 FROM movie_genres mg 
        JOIN genres g ON mg.genre_id = g.id 
        WHERE mg.movie_id = m.id AND g.name = ?
      )`;
      params.push(filters.genre);
    }

    if (filters.minYear) {
      sql += ` AND m.release_year >= ?`;
      params.push(filters.minYear);
    }

    if (filters.maxYear) {
      sql += ` AND m.release_year <= ?`;
      params.push(filters.maxYear);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    sql += ` ORDER BY m.vote_average DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows, totalCount] = await Promise.all([
      this.db.query(sql, params),
      this.db.query('SELECT COUNT(*) as count FROM movies m WHERE (m.title LIKE ? OR m.overview LIKE ?)', [`%${query}%`, `%${query}%`])
    ]);

    return {
      items: rows.map(this.mapRowToMovie),
      page,
      totalPages: Math.ceil(totalCount[0].count / limit),
      totalItems: totalCount[0].count,
      hasNext: page * limit < totalCount[0].count,
      hasPrevious: page > 1
    };
  }

  async save(movie: Movie): Promise<void> {
    const data = movie.toJSON();
    
    await this.db.query(
      `INSERT OR REPLACE INTO movies 
       (id, title, release_year, rating) 
       VALUES (?, ?, ?, ?)`,
      [data.id, data.title, data.releaseYear, data.rating]
    );
  }

  async delete(id: MovieId): Promise<void> {
    await this.db.query('DELETE FROM movies WHERE id = ?', [id.getValue()]);
  }

  private mapRowToMovie(row: any): Movie {
    return new MovieDomain.Movie(
      new MovieDomain.MovieId(row.id),
      row.title,
      row.release_year,
      new MovieDomain.Rating(row.rating),
      [] // Would load genres separately
    );
  }
}

// Cache decorator
class CachedMovieRepository implements MovieRepository {
  private cache = new Map<string, any>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private repository: MovieRepository) {}

  async findById(id: MovieId): Promise<Movie | null> {
    const cacheKey = `movie:${id.getValue()}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const movie = await this.repository.findById(id);
    
    this.cache.set(cacheKey, {
      data: movie,
      timestamp: Date.now()
    });

    return movie;
  }

  // Implement other methods with caching...
  async findByGenre(genre: string): Promise<Movie[]> {
    const cacheKey = `genre:${genre}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const movies = await this.repository.findByGenre(genre);
    
    this.cache.set(cacheKey, {
      data: movies,
      timestamp: Date.now()
    });

    return movies;
  }

  // Other methods would be implemented similarly...
  search(query: string, filters: SearchFilters): Promise<PaginatedResult<Movie>> {
    return this.repository.search(query, filters);
  }

  save(movie: Movie): Promise<void> {
    // Invalidate cache when saving
    this.cache.delete(`movie:${movie.getId().getValue()}`);
    return this.repository.save(movie);
  }

  delete(id: MovieId): Promise<void> {
    this.cache.delete(`movie:${id.getValue()}`);
    return this.repository.delete(id);
  }
}
```

## 🎭 Dependency Injection with TypeScript

### **Service Container Pattern**
```typescript
// Service registration
interface ServiceDefinition<T> {
  factory: (...args: any[]) => T;
  dependencies: string[];
  singleton: boolean;
}

class ServiceContainer {
  private services = new Map<string, ServiceDefinition<any>>();
  private instances = new Map<string, any>();

  // Register a service
  register<T>(
    name: string,
    factory: (...args: any[]) => T,
    dependencies: string[] = [],
    singleton: boolean = true
  ): void {
    this.services.set(name, {
      factory,
      dependencies,
      singleton
    });
  }

  // Resolve a service with type safety
  resolve<T>(name: string): T {
    // Check for singleton instance
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    // Resolve dependencies
    const dependencies = service.dependencies.map(dep => this.resolve(dep));
    
    // Create instance
    const instance = service.factory(...dependencies);
    
    // Store singleton
    if (service.singleton) {
      this.instances.set(name, instance);
    }
    
    return instance;
  }
}

// Service registration
const container = new ServiceContainer();

// Register services
container.register('database', () => new Database());
container.register('movieRepository', (db: Database) => new DatabaseMovieRepository(db), ['database']);
container.register('cachedMovieRepository', (repo: MovieRepository) => new CachedMovieRepository(repo), ['movieRepository']);
container.register('movieService', (repo: MovieRepository) => new MovieService(repo), ['cachedMovieRepository']);

// Usage with type safety
const movieService = container.resolve<MovieService>('movieService');
const movies = await movieService.getPopularMovies();
```

### **Decorator Pattern for Cross-Cutting Concerns**
```typescript
// Logging decorator
class LoggingMovieRepository implements MovieRepository {
  constructor(
    private repository: MovieRepository,
    private logger: Logger
  ) {}

  async findById(id: MovieId): Promise<Movie | null> {
    this.logger.info('Finding movie by ID', { movieId: id.getValue() });
    const startTime = Date.now();

    try {
      const movie = await this.repository.findById(id);
      const duration = Date.now() - startTime;
      
      this.logger.info('Movie found', {
        movieId: id.getValue(),
        found: !!movie,
        duration
      });

      return movie;
    } catch (error) {
      this.logger.error('Error finding movie', {
        movieId: id.getValue(),
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // Other methods follow same pattern...
}

// Metrics decorator
class MetricsMovieRepository implements MovieRepository {
  private metrics: MetricsCollector;

  constructor(
    private repository: MovieRepository,
    metrics: MetricsCollector
  ) {
    this.metrics = metrics;
  }

  async findById(id: MovieId): Promise<Movie | null> {
    const timer = this.metrics.startTimer('movie.repository.findById');

    try {
      const result = await this.repository.findById(id);
      timer.stop();
      this.metrics.increment('movie.repository.findById.success');
      return result;
    } catch (error) {
      timer.stop();
      this.metrics.increment('movie.repository.findById.error');
      throw error;
    }
  }
}

// Composing decorators
function createMovieRepository(): MovieRepository {
  const base = new DatabaseMovieRepository(database);
  const cached = new CachedMovieRepository(base);
  const logged = new LoggingMovieRepository(cached, logger);
  const metrics = new MetricsMovieRepository(logged, metricsCollector);
  
  return metrics;
}
```

## 📊 State Management Patterns

### **Redux Toolkit with TypeScript**
```typescript
// State slice definition
interface MoviesState {
  items: Movie[];
  loading: boolean;
  error: string | null;
  filters: MovieFilters;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
  };
}

// Action types
interface MoviesActions {
  fetchMoviesStart: { page: number };
  fetchMoviesSuccess: { movies: Movie[]; totalPages: number };
  fetchMoviesFailure: { error: string };
  setFilters: { filters: Partial<MovieFilters> };
  clearMovies: void;
}

// Action creators with payload typing
const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {},
    pagination: { page: 1, totalPages: 1, hasNext: false }
  } as MoviesState,
  reducers: {
    fetchMoviesStart: (state, action: PayloadAction<{ page: number }>) => {
      state.loading = true;
      state.error = null;
      state.pagination.page = action.payload.page;
    },
    
    fetchMoviesSuccess: (state, action: PayloadAction<{ movies: Movie[]; totalPages: number }>) => {
      state.loading = false;
      state.items = action.payload.movies;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.hasNext = state.pagination.page < action.payload.totalPages;
    },
    
    fetchMoviesFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },
    
    setFilters: (state, action: PayloadAction<{ filters: Partial<MovieFilters> }>) => {
      state.filters = { ...state.filters, ...action.payload.filters };
    },
    
    clearMovies: (state) => {
      state.items = [];
      state.pagination = { page: 1, totalPages: 1, hasNext: false };
    }
  }
});

// Async thunks with typing
const fetchMovies = createAsyncThunk<
  { movies: Movie[]; totalPages: number },  // Return type
  { page: number; filters?: MovieFilters }, // Argument type
  { rejectValue: string }                   // Error type
>('movies/fetch', async ({ page, filters }, { rejectWithValue }) => {
  try {
    const result = await movieApi.getMovies(page, 20, filters);
    return {
      movies: result.items,
      totalPages: result.totalPages
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to fetch movies'
    );
  }
});

// Root state type
interface RootState {
  movies: MoviesState;
  user: UserState;
  ui: UiState;
}

// Typed selectors
const selectMovies = (state: RootState): Movie[] => state.movies.items;
const selectMoviesLoading = (state: RootState): boolean => state.movies.loading;
const selectMoviesError = (state: RootState): string | null => state.movies.error;

// Typed hooks
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
const useAppDispatch = () => useDispatch<AppDispatch>();

// Usage in components
const MovieList: FC = () => {
  const dispatch = useAppDispatch();
  const movies = useAppSelector(selectMovies);
  const loading = useAppSelector(selectMoviesLoading);
  const error = useAppSelector(selectMoviesError);

  useEffect(() => {
    dispatch(fetchMovies({ page: 1 }));
  }, [dispatch]);

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

## 🚀 Migration Strategies

### **Gradual TypeScript Adoption**
```typescript
// Step 1: Add TypeScript to build process
// - Install TypeScript and types
// - Add tsconfig.json
// - Update build scripts

// Step 2: Convert utilities first (lowest risk)
// utils/formatters.js → utils/formatters.ts
export function formatMovieTitle(title: string, year?: number): string {
  return year ? `${title} (${year})` : title;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Step 3: Convert type definitions
// types/movie.js → types/movie.ts
export interface Movie {
  id: number;
  title: string;
  year: number;
}

// Step 4: Convert components one by one
// components/MovieCard.jsx → components/MovieCard.tsx
interface MovieCardProps {
  movie: Movie;
  onRate: (rating: number) => void;
}

const MovieCard: FC<MovieCardProps> = ({ movie, onRate }) => {
  // Component implementation
};

// Step 5: Convert hooks and services
// hooks/useMovies.js → hooks/useMovies.ts
function useMovies(): {
  movies: Movie[];
  loading: boolean;
  error: string | null;
} {
  // Hook implementation
}

// Step 6: Convert main app components
// App.jsx → App.tsx
const App: FC = () => {
  // App implementation
};
```

### **Coexistence Strategies**
```typescript
// Allow JavaScript imports in TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,           // Allow .js files
    "checkJs": false,          // Don't type-check JS files
    "skipLibCheck": true       // Skip checking .d.ts files
  }
}

// Gradual typing with JSDoc
/**
 * @param {number} id - Movie ID
 * @param {string} title - Movie title
 * @returns {Promise<Movie>} The created movie
 */
async function createMovie(id, title) {
  // JavaScript code with JSDoc types
  return { id, title, year: new Date().getFullYear() };
}

// TypeScript wrapper for JavaScript module
// movie-service.d.ts
declare module './movie-service.js' {
  export interface Movie {
    id: number;
    title: string;
    year: number;
  }
  
  export function createMovie(id: number, title: string): Promise<Movie>;
}

// Import with types
import { createMovie, type Movie } from './movie-service.js';
```

## ⚡ Performance Considerations

### **TypeScript Build Performance**
```typescript
// tsconfig.json for large projects
{
  "compilerOptions": {
    // Performance optimizations
    "incremental": true,                    // Enable incremental compilation
    "tsBuildInfoFile": ".tsbuildinfo",      // Cache compilation info
    "skipLibCheck": true,                   // Skip checking .d.ts files
    "skipDefaultLibCheck": true,            // Skip default lib checks
    
    // Module resolution optimizations
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    
    // Project references for multi-package repos
    "composite": true,                      // Enable project references
    "declaration": true,                    // Generate .d.ts files
    "declarationMap": true                  // Generate source maps for .d.ts
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/api" }
  ]
}

// Project references setup
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### **Runtime Performance**
```typescript
// Use const assertions for better tree-shaking
export const MOVIE_GENRES = [
  'Action',
  'Comedy', 
  'Drama',
  'Horror',
  'Sci-Fi'
] as const;

// Type from const assertion
export type MovieGenre = typeof MOVIE_GENRES[number];

// Prefer interfaces over type aliases for objects (better performance)
interface Movie {  // ✅ Better for objects
  id: number;
  title: string;
}

type Movie = {     // ❌ Slower for complex objects
  id: number;
  title: string;
};

// Use branded types for ID safety without runtime cost
type MovieId = number & { readonly __brand: 'MovieId' };

function createMovieId(id: number): MovieId {
  return id as MovieId; // Zero runtime cost
}

// Efficient type guards
function isMovie(value: unknown): value is Movie {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    typeof (value as any).id === 'number' &&
    typeof (value as any).title === 'string'
  );
}
```

## 👥 Team Collaboration Patterns

### **Shared Type Definitions**
```typescript
// packages/shared-types/src/index.ts
export interface Movie {
  id: number;
  title: string;
  overview: string;
  releaseYear: number;
  genres: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

// API contract types
export interface ApiEndpoint<TRequest, TResponse> {
  request: TRequest;
  response: TResponse;
}

export interface MovieEndpoints {
  'GET /movies': ApiEndpoint<
    { page?: number; limit?: number },
    PaginatedResponse<Movie>
  >;
  
  'POST /movies': ApiEndpoint<
    Omit<Movie, 'id'>,
    Movie
  >;
  
  'GET /movies/:id': ApiEndpoint<
    { id: number },
    Movie
  >;
}
```

### **Strict Project Configuration**
```typescript
// tsconfig.json for team projects
{
  "compilerOptions": {
    // Strict checks for team safety
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    
    // Consistency
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    
    // Path mapping for clean imports
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  
  // Include/exclude patterns
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

### **Code Quality Tools**
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // Naming conventions
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      },
      {
        "selector": "enum",
        "format": ["PascalCase"]
      }
    ],
    
    // Import/export rules
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/consistent-type-exports": "error"
  }
}
```

## 🧪 Testing Strategies

### **Type-Safe Testing Utilities**
```typescript
// Test utilities with proper typing
export function createMockMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Test Movie',
    overview: 'A test movie for unit tests',
    releaseYear: 2023,
    voteAverage: 8.0,
    genres: [{ id: 1, name: 'Test' }],
    ...overrides
  };
}

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides
  };
}

// Type-safe mock functions
export function createMockApiClient(): jest.Mocked<MovieApiClient> {
  return {
    getMovies: jest.fn(),
    getMovie: jest.fn(),
    createMovie: jest.fn(),
    updateMovie: jest.fn(),
    deleteMovie: jest.fn(),
    searchMovies: jest.fn()
  } as jest.Mocked<MovieApiClient>;
}

// Custom matchers with TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMovie(): R;
      toHaveGenre(genre: string): R;
      toMatchMovieSchema(): R;
    }
  }
}

expect.extend({
  toBeValidMovie(received: unknown) {
    const isValid = isMovie(received);
    return {
      message: () => `Expected ${received} to be a valid movie`,
      pass: isValid
    };
  },
  
  toHaveGenre(received: Movie, genre: string) {
    const hasGenre = received.genres.some(g => g.name === genre);
    return {
      message: () => `Expected movie to have genre "${genre}"`,
      pass: hasGenre
    };
  }
});

// Usage in tests
describe('Movie', () => {
  it('should be a valid movie', () => {
    const movie = createMockMovie();
    expect(movie).toBeValidMovie();
    expect(movie).toHaveGenre('Test');
  });
});
```

### **Integration Testing Patterns**
```typescript
// Test doubles with interfaces
interface TestDatabase extends Database {
  reset(): void;
  seed(data: any[]): void;
}

class InMemoryTestDatabase implements TestDatabase {
  private movies: Map<number, Movie> = new Map();

  async query(sql: string, params: any[]): Promise<any[]> {
    // Simplified in-memory implementation
    if (sql.includes('SELECT')) {
      return Array.from(this.movies.values());
    }
    return [];
  }

  reset(): void {
    this.movies.clear();
  }

  seed(movies: Movie[]): void {
    movies.forEach(movie => {
      this.movies.set(movie.id, movie);
    });
  }
}

// Integration test setup
describe('Movie Repository Integration', () => {
  let database: TestDatabase;
  let repository: MovieRepository;

  beforeEach(() => {
    database = new InMemoryTestDatabase();
    repository = new DatabaseMovieRepository(database);
    
    database.seed([
      createMockMovie({ id: 1, title: 'Test Movie 1' }),
      createMockMovie({ id: 2, title: 'Test Movie 2' })
    ]);
  });

  afterEach(() => {
    database.reset();
  });

  it('should find movies by genre', async () => {
    const movies = await repository.findByGenre('Action');
    expect(movies).toHaveLength(2);
    expect(movies[0]).toBeValidMovie();
  });
});
```

## 🔧 Development Workflow

### **Pre-commit Hooks**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/typescript.yml
name: TypeScript Validation

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### **Documentation Generation**
```typescript
/**
 * Movie service for handling movie operations
 * 
 * @example
 * ```typescript
 * const service = new MovieService(repository);
 * const movies = await service.getPopularMovies();
 * ```
 */
export class MovieService {
  constructor(private repository: MovieRepository) {}

  /**
   * Get popular movies with pagination
   * 
   * @param page - Page number (1-based)
   * @param limit - Number of movies per page
   * @returns Promise that resolves to paginated movies
   * 
   * @throws {ValidationError} When page or limit is invalid
   * @throws {ApiError} When database operation fails
   * 
   * @example
   * ```typescript
   * const movies = await service.getPopularMovies(1, 20);
   * console.log(movies.items.length); // Up to 20 movies
   * ```
   */
  async getPopularMovies(
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedResult<Movie>> {
    if (page < 1) {
      throw new ValidationError('Page must be positive', 'page', page);
    }
    
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100', 'limit', limit);
    }

    return this.repository.search('', { page, limit, sortBy: 'popularity' });
  }

  /**
   * Search movies with advanced filtering
   * 
   * @param query - Search query string
   * @param filters - Optional search filters
   * @returns Promise that resolves to matching movies
   */
  async searchMovies(
    query: string,
    filters: SearchFilters = {}
  ): Promise<PaginatedResult<Movie>> {
    if (query.length < 2) {
      throw new ValidationError('Query must be at least 2 characters', 'query', query);
    }

    return this.repository.search(query, filters);
  }
}
```

## 🎯 Key Takeaways

### **Production Patterns**
- **Domain-Driven Design**: Separate business logic with types
- **Repository Pattern**: Abstract data access with interfaces
- **Dependency Injection**: Flexible service composition
- **State Management**: Type-safe Redux/Zustand integration
- **Error Boundaries**: React error handling with types

### **Migration Strategies**
- **Gradual Adoption**: Convert files incrementally
- **JavaScript Coexistence**: Allow .js imports during transition
- **Team Training**: Establish TypeScript best practices
- **Tooling Setup**: Configure linting, formatting, and CI/CD

### **Performance**
- **Build Optimization**: Incremental compilation and project references
- **Runtime Efficiency**: Zero-cost type safety
- **Bundle Size**: Better tree-shaking with TypeScript
- **Development Speed**: Enhanced IDE support and error catching

## 🏆 Mastery Checklist

By completing this tutorial, you should be able to:

- ✅ **Design type-safe APIs** with comprehensive error handling
- ✅ **Implement complex state management** with discriminated unions  
- ✅ **Build scalable architectures** using TypeScript patterns
- ✅ **Migrate existing JavaScript** projects incrementally
- ✅ **Set up development workflows** optimized for TypeScript
- ✅ **Write maintainable code** that scales with team growth
- ✅ **Debug effectively** using TypeScript's error messages
- ✅ **Optimize performance** for large TypeScript applications

## 🚀 What's Next?

Congratulations! You've completed the comprehensive TypeScript tutorial. Here's how to continue your journey:

### **Advanced Topics**
- **Compiler API**: Build tools that work with TypeScript AST
- **Declaration Files**: Create type definitions for JavaScript libraries
- **Module Augmentation**: Extend existing type definitions
- **Decorators**: Experimental metadata and code transformation features

### **Ecosystem Integration**
- **GraphQL + TypeScript**: Type-safe GraphQL with code generation
- **Node.js + TypeScript**: Backend development patterns
- **Monorepo Management**: TypeScript in large codebases
- **Package Publishing**: Creating typed npm packages

### **Community & Resources**
- **TypeScript Discord**: Join the community discussions
- **DefinitelyTyped**: Contribute type definitions
- **TypeScript GitHub**: Follow language development
- **Conference Talks**: Share your TypeScript knowledge

You're now a TypeScript expert! Use this knowledge to build amazing, type-safe applications. 🎉

---

**Completed!** You've mastered TypeScript from fundamentals to production-ready patterns. Time to build something amazing! 🚀
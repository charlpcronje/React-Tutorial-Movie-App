# 🌐 Chapter 6: API Communication with TypeScript

This chapter covers building type-safe HTTP clients and RPC communication systems. You'll learn to create robust, type-safe APIs that catch errors at compile time and provide excellent developer experiences.

## 🎯 What You'll Learn: API Communication

> **Learning Goal #3**: Type-safe HTTP and RPC clients

API communication is where TypeScript really shines. Instead of guessing what your API returns, you'll have:
- **Complete type safety** for requests and responses
- **Compile-time validation** of API contracts
- **Excellent IntelliSense** when working with API data
- **Automatic error detection** for API mismatches
- **Self-documenting** API interfaces

## 🔌 HTTP Client Basics

### **Basic Fetch with TypeScript**
```typescript
// Define response types
interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Type-safe API call
async function fetchMovies(): Promise<Movie[]> {
  const response = await fetch('/api/movies');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const apiResponse: ApiResponse<Movie[]> = await response.json();
  return apiResponse.data;
}

// Usage with automatic type inference
const movies = await fetchMovies(); // TypeScript knows this is Movie[]
console.log(movies[0].title);       // TypeScript knows title exists
```

### **Generic HTTP Client**
```typescript
// Generic response wrapper
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

interface ApiError {
  error: string;
  code: string;
  details?: Record<string, string>;
}

// HTTP client class
class HttpClient {
  constructor(private baseUrl: string) {}

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: response.statusText,
        code: response.status.toString(),
      }));
      throw new HttpError(response.status, errorData);
    }

    return response.json();
  }

  // Type-safe HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Custom error class
class HttpError extends Error {
  constructor(
    public status: number,
    public apiError: ApiError
  ) {
    super(`HTTP ${status}: ${apiError.error}`);
    this.name = 'HttpError';
  }
}
```

## 🎬 Movie API Client Example

### **Comprehensive Movie API**
```typescript
// Movie-related types
interface Movie {
  id: number;
  title: string;
  overview: string;
  releaseYear: number;
  voteAverage: number;
  genres: Genre[];
  posterUrl?: string;
}

interface Genre {
  id: number;
  name: string;
}

interface SearchFilters {
  genre?: string;
  year?: number;
  minRating?: number;
  sortBy?: 'title' | 'year' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Movie API client
class MovieApiClient extends HttpClient {
  constructor() {
    super('/api');
  }

  // Get all movies with pagination
  async getMovies(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Movie>> {
    return this.get<PaginatedResponse<Movie>>(`/movies?page=${page}&limit=${limit}`);
  }

  // Get single movie by ID
  async getMovie(id: number): Promise<Movie> {
    return this.get<Movie>(`/movies/${id}`);
  }

  // Search movies with filters
  async searchMovies(
    query: string,
    filters: SearchFilters = {},
    page: number = 1
  ): Promise<PaginatedResponse<Movie>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ),
    });
    
    return this.get<PaginatedResponse<Movie>>(`/movies/search?${params}`);
  }

  // Create new movie
  async createMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    return this.post<Movie>('/movies', movieData);
  }

  // Update existing movie
  async updateMovie(id: number, updates: Partial<Movie>): Promise<Movie> {
    return this.put<Movie>(`/movies/${id}`, updates);
  }

  // Delete movie
  async deleteMovie(id: number): Promise<void> {
    return this.delete<void>(`/movies/${id}`);
  }

  // Rate a movie
  async rateMovie(id: number, rating: number): Promise<{ newAverage: number }> {
    return this.post<{ newAverage: number }>(`/movies/${id}/rate`, { rating });
  }

  // Get movie genres
  async getGenres(): Promise<Genre[]> {
    return this.get<Genre[]>('/genres');
  }
}

// Usage examples
const movieApi = new MovieApiClient();

// Type-safe API calls
const movies = await movieApi.getMovies(1, 10);  // PaginatedResponse<Movie>
const movie = await movieApi.getMovie(123);      // Movie
const searchResults = await movieApi.searchMovies('action', { genre: 'Action' });

// TypeScript ensures correct usage
console.log(movies.items[0].title);    // ✅ TypeScript knows title exists
console.log(movie.invalidProp);       // ❌ TypeScript error - property doesn't exist
```

### **Error Handling with Types**
```typescript
// Specific error types
class ValidationError extends HttpError {
  constructor(details: Record<string, string>) {
    super(400, {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details
    });
  }
}

class NotFoundError extends HttpError {
  constructor(resource: string) {
    super(404, {
      error: `${resource} not found`,
      code: 'NOT_FOUND'
    });
  }
}

class UnauthorizedError extends HttpError {
  constructor() {
    super(401, {
      error: 'Unauthorized access',
      code: 'UNAUTHORIZED'
    });
  }
}

// Enhanced HTTP client with specific error handling
class EnhancedHttpClient extends HttpClient {
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      return await super.request<T>(endpoint, options);
    } catch (error) {
      if (error instanceof HttpError) {
        // Transform generic HTTP errors into specific ones
        switch (error.status) {
          case 400:
            if (error.apiError.code === 'VALIDATION_ERROR') {
              throw new ValidationError(error.apiError.details || {});
            }
            break;
          case 401:
            throw new UnauthorizedError();
          case 404:
            throw new NotFoundError(endpoint);
        }
      }
      throw error;
    }
  }
}

// Usage with specific error handling
async function handleMovieOperation() {
  try {
    const movie = await movieApi.getMovie(999);
    console.log(movie.title);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('Movie not found');
    } else if (error instanceof ValidationError) {
      console.log('Invalid data:', error.apiError.details);
    } else if (error instanceof UnauthorizedError) {
      console.log('Please log in');
    } else {
      console.log('Unknown error:', error.message);
    }
  }
}
```

## 📡 RPC (Remote Procedure Call) Communication

### **What is RPC?**
RPC makes API calls feel like local function calls. Instead of REST endpoints, you call methods directly:

```typescript
// REST approach
const response = await fetch('/api/movies/123/rate', {
  method: 'POST',
  body: JSON.stringify({ rating: 5 })
});

// RPC approach  
const result = await rpc.call('movies.rate', { movieId: 123, rating: 5 });
```

### **Basic RPC Types**
```typescript
// RPC method definition
interface RpcMethod<TParams = any, TResult = any> {
  params: TParams;
  result: TResult;
}

// Movie service methods
interface MovieRpcMethods {
  'movies.getPopular': RpcMethod<
    { page?: number; limit?: number },
    PaginatedResponse<Movie>
  >;
  'movies.search': RpcMethod<
    { query: string; filters?: SearchFilters },
    PaginatedResponse<Movie>
  >;
  'movies.rate': RpcMethod<
    { movieId: number; rating: number },
    { success: boolean; newAverage: number }
  >;
  'movies.addToFavorites': RpcMethod<
    { movieId: number },
    { success: boolean }
  >;
}

// RPC request/response types
interface RpcRequest<TMethod extends keyof MovieRpcMethods> {
  id: string;
  method: TMethod;
  params: MovieRpcMethods[TMethod]['params'];
}

interface RpcSuccessResponse<TMethod extends keyof MovieRpcMethods> {
  id: string;
  result: MovieRpcMethods[TMethod]['result'];
}

interface RpcErrorResponse {
  id: string;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

type RpcResponse<TMethod extends keyof MovieRpcMethods> = 
  | RpcSuccessResponse<TMethod>
  | RpcErrorResponse;
```

### **RPC Client Implementation**
```typescript
class RpcClient {
  private requestId = 0;

  constructor(private endpoint: string) {}

  // Type-safe RPC call method
  async call<TMethod extends keyof MovieRpcMethods>(
    method: TMethod,
    params: MovieRpcMethods[TMethod]['params']
  ): Promise<MovieRpcMethods[TMethod]['result']> {
    const id = (++this.requestId).toString();
    
    const request: RpcRequest<TMethod> = {
      id,
      method,
      params
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rpcResponse: RpcResponse<TMethod> = await response.json();

    if ('error' in rpcResponse) {
      throw new RpcError(rpcResponse.error.code, rpcResponse.error.message, rpcResponse.error.data);
    }

    return rpcResponse.result;
  }

  // Batch multiple RPC calls
  async batchCall<TCalls extends readonly RpcBatchCall[]>(
    calls: TCalls
  ): Promise<RpcBatchResults<TCalls>> {
    const requests = calls.map((call, index) => ({
      id: index.toString(),
      method: call.method,
      params: call.params
    }));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requests)
    });

    const responses = await response.json();
    return responses as RpcBatchResults<TCalls>;
  }
}

// RPC error class
class RpcError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'RpcError';
  }
}

// Batch call types
interface RpcBatchCall {
  method: keyof MovieRpcMethods;
  params: any;
}

type RpcBatchResults<T extends readonly RpcBatchCall[]> = {
  [K in keyof T]: T[K] extends RpcBatchCall
    ? RpcResponse<T[K]['method']>
    : never;
};
```

### **Using the RPC Client**
```typescript
const rpc = new RpcClient('/api/rpc');

// Type-safe RPC calls
const popularMovies = await rpc.call('movies.getPopular', { page: 1, limit: 10 });
const searchResults = await rpc.call('movies.search', { 
  query: 'action', 
  filters: { genre: 'Action' } 
});
const ratingResult = await rpc.call('movies.rate', { movieId: 123, rating: 5 });

// TypeScript ensures correct parameter types
await rpc.call('movies.rate', { movieId: '123', rating: 5 }); // ❌ Error: movieId should be number
await rpc.call('movies.search', { query: 123 });             // ❌ Error: query should be string

// Batch calls
const results = await rpc.batchCall([
  { method: 'movies.getPopular', params: { page: 1 } },
  { method: 'movies.search', params: { query: 'comedy' } }
]);

// TypeScript knows the result types
console.log(results[0].result.items); // Popular movies
console.log(results[1].result.items); // Search results
```

## 🔄 WebSocket RPC for Real-Time Communication

### **WebSocket RPC Client**
```typescript
interface SubscriptionCallback<T> = (data: T) => void;

class WebSocketRpcClient extends RpcClient {
  private ws: WebSocket | null = null;
  private pendingRequests = new Map<string, {
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }>();
  private subscriptions = new Map<string, SubscriptionCallback<any>>();

  constructor(private wsUrl: string) {
    super(wsUrl.replace('ws:', 'http:').replace('wss:', 'https:'));
  }

  // Connect to WebSocket
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error('WebSocket connection failed'));
      this.ws.onmessage = (event) => this.handleMessage(event);
    });
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent): void {
    const message = JSON.parse(event.data);
    
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);
      
      if (message.error) {
        reject(new RpcError(message.error.code, message.error.message, message.error.data));
      } else {
        resolve(message.result);
      }
    } else if (message.subscription && this.subscriptions.has(message.subscription)) {
      const callback = this.subscriptions.get(message.subscription)!;
      callback(message.data);
    }
  }

  // Override call method for WebSocket
  async call<TMethod extends keyof MovieRpcMethods>(
    method: TMethod,
    params: MovieRpcMethods[TMethod]['params']
  ): Promise<MovieRpcMethods[TMethod]['result']> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const id = (++this.requestId).toString();
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const request: RpcRequest<TMethod> = { id, method, params };
      this.ws!.send(JSON.stringify(request));
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // Subscribe to real-time updates
  subscribe<T>(event: string, callback: SubscriptionCallback<T>): () => void {
    const subscriptionId = Math.random().toString(36);
    this.subscriptions.set(subscriptionId, callback);
    
    // Send subscription request
    this.ws?.send(JSON.stringify({
      type: 'subscribe',
      event,
      subscriptionId
    }));
    
    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(subscriptionId);
      this.ws?.send(JSON.stringify({
        type: 'unsubscribe',
        subscriptionId
      }));
    };
  }

  // Close connection
  close(): void {
    this.ws?.close();
    this.pendingRequests.clear();
    this.subscriptions.clear();
  }
}

// Usage
const wsRpc = new WebSocketRpcClient('ws://localhost:3001/rpc');
await wsRpc.connect();

// Real-time subscriptions
const unsubscribe = wsRpc.subscribe<Movie>('movie-updated', (movie) => {
  console.log('Movie updated:', movie.title);
});

// RPC calls over WebSocket
const movies = await wsRpc.call('movies.getPopular', { page: 1 });
```

## 🔐 Authentication and Authorization

### **Token-Based Authentication**
```typescript
interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

class AuthenticatedHttpClient extends HttpClient {
  private token: AuthToken | null = null;

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  // Set authentication token
  setToken(token: AuthToken): void {
    this.token = token;
  }

  // Clear authentication
  clearToken(): void {
    this.token = null;
  }

  // Override request to add authentication
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.token) {
      // Check if token is expired
      if (Date.now() > this.token.expiresAt) {
        await this.refreshToken();
      }

      // Add authorization header
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${this.token.accessToken}`,
      };
    }

    return super.request<T>(endpoint, options);
  }

  // Refresh expired token
  private async refreshToken(): Promise<void> {
    if (!this.token?.refreshToken) {
      throw new UnauthorizedError();
    }

    try {
      const response = await super.request<{ token: AuthToken }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.token.refreshToken }),
      });

      this.token = response.token;
    } catch (error) {
      this.token = null;
      throw new UnauthorizedError();
    }
  }

  // Login method
  async login(email: string, password: string): Promise<User> {
    const response = await this.request<{ user: User; token: AuthToken }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response.user;
  }

  // Logout method
  async logout(): Promise<void> {
    if (this.token) {
      await this.request<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.token.refreshToken }),
      });
      this.clearToken();
    }
  }
}
```

### **Role-Based API Methods**
```typescript
class SecureMovieApiClient extends AuthenticatedHttpClient {
  // Public method - no auth required
  async getMovies(): Promise<PaginatedResponse<Movie>> {
    return this.get<PaginatedResponse<Movie>>('/movies');
  }

  // User method - requires authentication
  async getFavoriteMovies(): Promise<Movie[]> {
    return this.get<Movie[]>('/user/favorites');
  }

  // Admin method - requires admin role
  async createMovie(movieData: Omit<Movie, 'id'>): Promise<Movie> {
    return this.post<Movie>('/admin/movies', movieData);
  }

  // Moderator method - requires moderator role
  async approveMovie(id: number): Promise<void> {
    return this.put<void>(`/moderator/movies/${id}/approve`, {});
  }
}

// Usage with error handling
async function handleSecureOperation() {
  const api = new SecureMovieApiClient('/api');

  try {
    // This works for everyone
    const movies = await api.getMovies();

    // This requires login
    const favorites = await api.getFavoriteMovies();

    // This requires admin role
    const newMovie = await api.createMovie({
      title: 'New Movie',
      overview: 'A great new movie',
      releaseYear: 2024,
      voteAverage: 0,
      genres: []
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      // Redirect to login
      console.log('Please log in');
    } else if (error instanceof HttpError && error.status === 403) {
      // Insufficient permissions
      console.log('Access denied');
    }
  }
}
```

## 🧪 Testing API Clients

### **Mocking API Responses**
```typescript
// Mock implementation
class MockMovieApiClient extends MovieApiClient {
  private mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie',
      overview: 'A test movie',
      releaseYear: 2023,
      voteAverage: 8.5,
      genres: [{ id: 1, name: 'Action' }]
    }
  ];

  async getMovies(): Promise<PaginatedResponse<Movie>> {
    return {
      items: this.mockMovies,
      page: 1,
      totalPages: 1,
      totalItems: 1,
      hasNext: false,
      hasPrevious: false
    };
  }

  async getMovie(id: number): Promise<Movie> {
    const movie = this.mockMovies.find(m => m.id === id);
    if (!movie) throw new NotFoundError('Movie');
    return movie;
  }
}

// Test with mock
describe('MovieComponent', () => {
  it('displays movies from API', async () => {
    const mockApi = new MockMovieApiClient();
    const movies = await mockApi.getMovies();
    
    expect(movies.items).toHaveLength(1);
    expect(movies.items[0].title).toBe('Test Movie');
  });
});
```

### **Integration Testing**
```typescript
// Integration test with real HTTP calls
describe('MovieApiClient Integration', () => {
  let api: MovieApiClient;

  beforeAll(() => {
    api = new MovieApiClient();
  });

  it('fetches real movies from API', async () => {
    const movies = await api.getMovies(1, 5);
    
    expect(movies.items).toBeInstanceOf(Array);
    expect(movies.items.length).toBeLessThanOrEqual(5);
    
    if (movies.items.length > 0) {
      expect(movies.items[0]).toHaveProperty('id');
      expect(movies.items[0]).toHaveProperty('title');
      expect(typeof movies.items[0].title).toBe('string');
    }
  });

  it('handles non-existent movie correctly', async () => {
    await expect(api.getMovie(999999)).rejects.toThrow(NotFoundError);
  });
});
```

## 🎯 Key Takeaways

### **HTTP Client Benefits**
- **Type Safety**: Know exactly what your API returns
- **Error Handling**: Specific error types for different scenarios
- **IntelliSense**: Full autocomplete for API responses
- **Validation**: Catch API contract mismatches at compile time

### **RPC Advantages**
- **Method-like Calls**: APIs feel like local function calls
- **Type Safety**: Every method parameter and return type is typed
- **Batching**: Multiple calls in a single request
- **Real-time**: WebSocket support for live updates

### **Best Practices**
- Always type API responses and requests
- Create specific error classes for different HTTP status codes
- Use generic clients for reusability
- Implement proper authentication handling
- Test both mock and real API interactions

## 🚀 Next Steps

Now that you understand API communication, explore:

- **Chapter 7**: [Error Handling Strategies](./07-error-handling.md) - Comprehensive error type patterns
- **Chapter 8**: [Advanced TypeScript Patterns](./08-advanced-patterns.md) - Production-ready patterns
- **RPC Implementation**: Check out our complete RPC system in `services/rpc-client.ts`

Type-safe API communication transforms how you work with external services! 🌐

---

**Next Up:** [Chapter 7: Error Handling Strategies](./07-error-handling.md) - Learn comprehensive strategies for handling errors with TypeScript's type system.
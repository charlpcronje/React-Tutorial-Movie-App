# 📡 Chapter 9: RPC Communication Deep Dive

Remote Procedure Calls (RPC) represent the pinnacle of type-safe client-server communication. This chapter explores our complete RPC implementation, demonstrating how TypeScript enables seamless, type-safe communication between frontend and backend.

## 🎯 What is RPC and Why TypeScript?

### **RPC vs REST: The Fundamental Difference**

**REST (Representational State Transfer)**
```typescript
// REST - Resource-based, HTTP methods
const response = await fetch('/api/movies/123/rate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rating: 5 })
});
const result = await response.json(); // What type is this? 🤷‍♂️
```

**RPC (Remote Procedure Call)**  
```typescript
// RPC - Function-based, like calling local functions
const result = await rpc.call('movies.rate', { movieId: 123, rating: 5 });
// TypeScript knows exactly what type result is! ✅
```

### **TypeScript's RPC Superpowers**
With TypeScript, RPC becomes incredibly powerful:

1. **Type Safety**: Method signatures are enforced at compile time
2. **IntelliSense**: Full autocomplete for methods and parameters  
3. **Contract Validation**: Frontend and backend types stay in sync
4. **Error Prevention**: Catch API mismatches before deployment
5. **Self-Documentation**: Types serve as always-up-to-date API docs

## 🏗️ RPC Architecture Overview

Our RPC system consists of several layers, each demonstrating advanced TypeScript patterns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   RPC Client    │    │   RPC Server    │
│                 │    │                 │    │                 │
│ • Type-safe     │◄──►│ • WebSocket     │◄──►│ • Method        │
│   method calls  │    │ • HTTP fallback │    │   routing       │
│ • Auto-complete │    │ • Middleware    │    │ • Type          │
│ • Error types   │    │ • Subscriptions │    │   validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Core RPC Types**
```typescript
// JSON-RPC 2.0 specification with TypeScript
interface RpcRequest<TMethod extends string = string, TParams = unknown> {
  readonly jsonrpc: '2.0';
  readonly id: string | number;
  readonly method: TMethod;
  readonly params?: TParams;
}

interface RpcSuccessResponse<TResult = unknown> {
  readonly jsonrpc: '2.0';
  readonly id: string | number;
  readonly result: TResult;
}

interface RpcErrorResponse {
  readonly jsonrpc: '2.0';
  readonly id: string | number | null;
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: unknown;
  };
}

// Discriminated union for responses
type RpcResponse<TResult = unknown> = RpcSuccessResponse<TResult> | RpcErrorResponse;
```

## 🎬 Movie Service RPC Definition

### **Method Signature Definitions**
```typescript
// Define all RPC methods with exact type contracts
interface MovieRpcMethods {
  // Movie retrieval methods
  'movies.getPopular': {
    params: { 
      page?: number; 
      limit?: number; 
      genre?: string;
    };
    result: PaginatedResponse<Movie>;
  };
  
  'movies.getTrending': {
    params: { 
      timeWindow: 'day' | 'week' | 'month';
      limit?: number; 
    };
    result: Movie[];
  };
  
  'movies.search': {
    params: { 
      query: string; 
      filters?: SearchFilters;
      page?: number;
    };
    result: PaginatedResponse<Movie>;
  };
  
  'movies.getDetails': {
    params: { id: MovieId };
    result: MovieWithUserData;
  };
  
  'movies.getGenres': {
    params: Record<string, never>; // No parameters
    result: Genre[];
  };
  
  // User interaction methods
  'movies.rate': {
    params: { 
      movieId: MovieId; 
      rating: number; 
      userId: UserId;
    };
    result: { 
      success: boolean; 
      newAverage: number;
      userRating: number;
    };
  };
  
  'movies.toggleFavorite': {
    params: { 
      movieId: MovieId;
      userId: UserId; 
    };
    result: { 
      success: boolean; 
      isFavorite: boolean;
      favoriteCount: number;
    };
  };
  
  'movies.addComment': {
    params: { 
      movieId: MovieId; 
      userId: UserId;
      content: string; 
      rating?: number;
    };
    result: MovieComment;
  };
  
  'movies.getComments': {
    params: { 
      movieId: MovieId; 
      page?: number;
      sortBy?: 'newest' | 'oldest' | 'rating';
    };
    result: PaginatedResponse<MovieComment>;
  };

  // Real-time features
  'movies.subscribe': {
    params: {
      events: ('rating' | 'comment' | 'favorite')[];
      movieId?: MovieId;
    };
    result: {
      subscriptionId: string;
      events: string[];
    };
  };
  
  'movies.unsubscribe': {
    params: { subscriptionId: string };
    result: { success: boolean };
  };
}

// Extract method names for type safety
type MovieRpcMethodName = keyof MovieRpcMethods;

// Extract parameter types
type MovieRpcParams<T extends MovieRpcMethodName> = MovieRpcMethods[T]['params'];

// Extract result types  
type MovieRpcResult<T extends MovieRpcMethodName> = MovieRpcMethods[T]['result'];
```

### **Type-Safe RPC Client Interface**
```typescript
interface RpcClient {
  /**
   * Call a remote procedure
   */
  call<T extends MovieRpcMethodName>(
    method: T,
    params: MovieRpcParams<T>
  ): Promise<MovieRpcResult<T>>;
  
  /**
   * Batch multiple RPC calls
   */
  batch<T extends readonly RpcBatchCall[]>(
    calls: T
  ): Promise<RpcBatchResults<T>>;
  
  /**
   * Subscribe to real-time events
   */
  subscribe<T>(
    event: string,
    callback: (data: T) => void
  ): RpcSubscription;
  
  /**
   * Connection management
   */
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  /**
   * Connection state
   */
  readonly isConnected: boolean;
  readonly connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}
```

## 🔌 WebSocket RPC Implementation

### **Complete WebSocket Client**
```typescript
/**
 * Production-Ready WebSocket RPC Client
 * 
 * Features:
 * • Type-safe method calls
 * • Automatic reconnection
 * • Request/response correlation
 * • Real-time subscriptions
 * • Middleware support
 * • Error handling
 * • Performance monitoring
 */
export class WebSocketRpcClient implements RpcClient {
  private ws: WebSocket | null = null;
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private requestId = 0;
  
  // Pending requests tracking
  private pendingRequests = new Map<string, {
    resolve: (result: any) => void;
    reject: (error: RpcError) => void;
    timeout: NodeJS.Timeout;
    method: string;
    startTime: number;
  }>();
  
  // Real-time subscriptions
  private subscriptions = new Map<string, {
    callback: (data: any) => void;
    events: string[];
  }>();
  
  // Middleware chain
  private middleware: RpcMiddleware[] = [];
  
  // Connection management
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  // Event emitter for connection events
  private eventEmitter = new EventTarget();

  constructor(private readonly url: string, private readonly options: RpcClientOptions = {}) {}

  /**
   * Establish WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    this.emit('connecting');

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        // Connection opened
        this.ws.onopen = (): void => {
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        // Connection closed
        this.ws.onclose = (event: CloseEvent): void => {
          this.handleDisconnect(`Connection closed: ${event.reason || 'Unknown'}`);
        };

        // Connection error
        this.ws.onerror = (): void => {
          const error = new RpcConnectionError('WebSocket connection failed');
          this.handleError(error);
          if (this.connectionState === 'connecting') {
            reject(error);
          }
        };

        // Incoming messages
        this.ws.onmessage = (event: MessageEvent): void => {
          this.handleMessage(event.data);
        };

        // Connection timeout
        const connectTimeout = setTimeout(() => {
          if (this.connectionState === 'connecting') {
            const error = new RpcTimeoutError('Connection timeout');
            reject(error);
            this.ws?.close();
          }
        }, this.options.connectionTimeout || 10000);

        // Clear timeout on connection
        const clearTimeoutOnConnect = (): void => {
          clearTimeout(connectTimeout);
          this.eventEmitter.removeEventListener('connected', clearTimeoutOnConnect);
        };
        this.eventEmitter.addEventListener('connected', clearTimeoutOnConnect);

      } catch (error) {
        this.connectionState = 'error';
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: RpcResponse = JSON.parse(data);
      
      // Handle RPC responses (id is not null)
      if (message.id !== null && message.id !== undefined) {
        const pending = this.pendingRequests.get(String(message.id));
        if (pending) {
          const duration = Date.now() - pending.startTime;
          this.clearPendingRequest(String(message.id));
          
          if ('error' in message) {
            const error = new RpcMethodError(
              message.error.message,
              message.error.code,
              message.error.data,
              pending.method
            );
            pending.reject(error);
          } else {
            pending.resolve(message.result);
          }
          
          // Emit performance metric
          this.emit('requestCompleted', {
            method: pending.method,
            duration,
            success: !('error' in message)
          });
        }
      }
      
      // Handle subscription notifications (id is null)
      else if (message.id === null && 'result' in message && typeof message.result === 'object') {
        this.handleSubscriptionMessage(message.result);
      }

    } catch (error) {
      console.error('Failed to parse RPC message:', error);
      this.emit('parseError', { data, error });
    }
  }

  /**
   * Type-safe RPC method calls
   */
  async call<T extends MovieRpcMethodName>(
    method: T,
    params: MovieRpcParams<T>
  ): Promise<MovieRpcResult<T>> {
    if (!this.isConnected) {
      throw new RpcConnectionError('Not connected to RPC server');
    }

    const id = this.generateRequestId();
    const request: RpcRequest<T, MovieRpcParams<T>> = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    // Apply middleware chain
    const processedRequest = await this.applyMiddleware(request);

    return new Promise<MovieRpcResult<T>>((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.clearPendingRequest(id);
        reject(new RpcTimeoutError(`Method ${method} timed out`));
      }, this.options.requestTimeout || 30000);

      // Store pending request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
        method,
        startTime: Date.now()
      });

      // Send request
      try {
        this.ws!.send(JSON.stringify(processedRequest));
        this.emit('requestSent', { method, params });
      } catch (error) {
        this.clearPendingRequest(id);
        reject(new RpcConnectionError('Failed to send request'));
      }
    });
  }

  /**
   * Batch multiple RPC calls
   */
  async batch<T extends readonly RpcBatchCall[]>(
    calls: T
  ): Promise<RpcBatchResults<T>> {
    if (!this.isConnected) {
      throw new RpcConnectionError('Not connected to RPC server');
    }

    const batchRequest = calls.map((call, index) => ({
      jsonrpc: '2.0' as const,
      id: `batch_${this.generateRequestId()}_${index}`,
      method: call.method,
      params: call.params
    }));

    return new Promise((resolve, reject) => {
      const responses: any[] = new Array(calls.length);
      let completedCount = 0;

      const timeout = setTimeout(() => {
        reject(new RpcTimeoutError('Batch request timed out'));
      }, this.options.requestTimeout || 30000);

      // Track each request in the batch
      batchRequest.forEach((request, index) => {
        this.pendingRequests.set(request.id, {
          resolve: (result) => {
            responses[index] = { success: true, result };
            completedCount++;
            
            if (completedCount === calls.length) {
              clearTimeout(timeout);
              resolve(responses as RpcBatchResults<T>);
            }
          },
          reject: (error) => {
            responses[index] = { success: false, error };
            completedCount++;
            
            if (completedCount === calls.length) {
              clearTimeout(timeout);
              resolve(responses as RpcBatchResults<T>);
            }
          },
          timeout,
          method: request.method,
          startTime: Date.now()
        });
      });

      // Send batch request
      this.ws!.send(JSON.stringify(batchRequest));
    });
  }

  /**
   * Subscribe to real-time events
   */
  subscribe<T>(event: string, callback: (data: T) => void): RpcSubscription {
    const subscriptionId = this.generateSubscriptionId();
    
    this.subscriptions.set(subscriptionId, {
      callback,
      events: [event]
    });

    // Send subscription request
    this.call('movies.subscribe', {
      events: [event],
      subscriptionId
    }).catch(error => {
      console.error('Subscription failed:', error);
      this.subscriptions.delete(subscriptionId);
    });

    return {
      id: subscriptionId,
      event,
      unsubscribe: async () => {
        this.subscriptions.delete(subscriptionId);
        try {
          await this.call('movies.unsubscribe', { subscriptionId });
        } catch (error) {
          console.warn('Unsubscribe failed:', error);
        }
      }
    };
  }

  /**
   * Middleware support
   */
  use(middleware: RpcMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }

  private async applyMiddleware(request: RpcRequest): Promise<RpcRequest> {
    let processedRequest = request;
    
    for (const middleware of this.middleware) {
      processedRequest = await middleware(processedRequest, {
        client: this,
        timestamp: Date.now()
      });
    }
    
    return processedRequest;
  }

  // Helper methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestId}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2)}`;
  }

  private clearPendingRequest(id: string): void {
    const pending = this.pendingRequests.get(id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(id);
    }
  }

  private handleDisconnect(reason: string): void {
    this.connectionState = 'disconnected';
    this.emit('disconnected', { reason });

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      pending.reject(new RpcConnectionError('Connection lost'));
      clearTimeout(pending.timeout);
    }
    this.pendingRequests.clear();

    // Attempt reconnection
    this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState = 'error';
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
        // Will try again due to disconnect handler
      }
    }, delay);
  }

  private emit(event: string, data?: any): void {
    this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // Public properties
  get isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  get connectionState(): string {
    return this.connectionState;
  }
}
```

## 🔧 RPC Middleware Patterns

### **Authentication Middleware**
```typescript
interface AuthContext {
  token?: string;
  userId?: UserId;
  permissions?: string[];
}

function createAuthMiddleware(getAuthContext: () => AuthContext): RpcMiddleware {
  return async (request: RpcRequest, context: RpcContext): Promise<RpcRequest> => {
    const auth = getAuthContext();
    
    // Add authentication to request
    return {
      ...request,
      auth: {
        token: auth.token,
        userId: auth.userId
      }
    };
  };
}
```

### **Retry Middleware**
```typescript
function createRetryMiddleware(
  maxRetries: number = 3,
  retryDelay: number = 1000
): RpcMiddleware {
  return async (request: RpcRequest, context: RpcContext): Promise<RpcRequest> => {
    const originalCall = context.client.call.bind(context.client);
    
    // Override the call method to add retry logic
    context.client.call = async <T extends MovieRpcMethodName>(
      method: T,
      params: MovieRpcParams<T>
    ): Promise<MovieRpcResult<T>> => {
      let lastError: Error;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await originalCall(method, params);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          // Don't retry certain errors
          if (error instanceof RpcMethodError) {
            const nonRetryableCodes = [-32600, -32601, -32602]; // Invalid request, method not found, invalid params
            if (nonRetryableCodes.includes(error.code)) {
              throw error;
            }
          }
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError!;
    };
    
    return request;
  };
}
```

### **Logging Middleware**
```typescript
interface RpcLogger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
}

function createLoggingMiddleware(logger: RpcLogger): RpcMiddleware {
  return async (request: RpcRequest, context: RpcContext): Promise<RpcRequest> => {
    const requestId = String(request.id);
    
    logger.info(`[RPC] → ${request.method}`, {
      requestId,
      method: request.method,
      params: request.params
    });

    // Store original call to wrap it
    const originalCall = context.client.call.bind(context.client);
    
    context.client.call = async <T extends MovieRpcMethodName>(
      method: T,
      params: MovieRpcParams<T>
    ): Promise<MovieRpcResult<T>> => {
      const startTime = Date.now();
      
      try {
        const result = await originalCall(method, params);
        const duration = Date.now() - startTime;
        
        logger.info(`[RPC] ← ${method} (${duration}ms)`, {
          requestId,
          method,
          duration,
          success: true
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(`[RPC] ✗ ${method} (${duration}ms)`, {
          requestId,
          method,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        throw error;
      }
    };
    
    return request;
  };
}
```

### **Rate Limiting Middleware**
```typescript
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

function createRateLimitMiddleware(config: RateLimitConfig): RpcMiddleware {
  const requests: number[] = [];

  return async (request: RpcRequest, context: RpcContext): Promise<RpcRequest> => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - config.windowMs) {
      requests.shift();
    }
    
    // Check rate limit
    if (requests.length >= config.maxRequests) {
      throw new RpcRateLimitError(
        'Rate limit exceeded',
        config.maxRequests,
        config.windowMs
      );
    }
    
    // Record this request
    requests.push(now);
    
    return request;
  };
}
```

## 🎬 Real-World Usage Examples

### **Movie App RPC Integration**
```typescript
// Set up RPC client with middleware
const rpcClient = new WebSocketRpcClient('ws://localhost:3001/rpc')
  .use(createAuthMiddleware(() => ({
    token: localStorage.getItem('authToken') || undefined,
    userId: getCurrentUserId()
  })))
  .use(createRetryMiddleware(3, 1000))
  .use(createLoggingMiddleware(console))
  .use(createRateLimitMiddleware({
    maxRequests: 100,
    windowMs: 60000 // 100 requests per minute
  }));

// Connect to server
await rpcClient.connect();

// Type-safe method calls
const popularMovies = await rpcClient.call('movies.getPopular', {
  page: 1,
  limit: 20,
  genre: 'Action'
});

console.log(popularMovies.items[0].title); // TypeScript knows this is a string

// Search with filters
const searchResults = await rpcClient.call('movies.search', {
  query: 'batman',
  filters: {
    genre: 'Action',
    minYear: 2000,
    maxYear: 2020
  },
  page: 1
});

// User interactions
const ratingResult = await rpcClient.call('movies.rate', {
  movieId: createMovieId(123),
  rating: 5,
  userId: getCurrentUserId()
});

console.log(`New average: ${ratingResult.newAverage}`);

// Real-time subscriptions
const subscription = rpcClient.subscribe<MovieRatingEvent>('movie-rated', (data) => {
  console.log(`Movie ${data.movieId} rated ${data.rating} by user ${data.userId}`);
  // Update UI in real-time
});

// Batch operations
const batchResults = await rpcClient.batch([
  { method: 'movies.getPopular', params: { page: 1 } },
  { method: 'movies.getTrending', params: { timeWindow: 'week' } },
  { method: 'movies.getGenres', params: {} }
]);

const [popular, trending, genres] = batchResults;

if (popular.success) {
  console.log('Popular movies:', popular.result.items);
}
```

### **React Hook for RPC**
```typescript
interface UseRpcReturn<T extends MovieRpcMethodName> {
  data: MovieRpcResult<T> | null;
  loading: boolean;
  error: RpcError | null;
  call: (params: MovieRpcParams<T>) => Promise<void>;
  reset: () => void;
}

function useRpc<T extends MovieRpcMethodName>(method: T): UseRpcReturn<T> {
  const [data, setData] = useState<MovieRpcResult<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<RpcError | null>(null);

  const call = useCallback(async (params: MovieRpcParams<T>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await rpcClient.call(method, params);
      setData(result);
    } catch (err) {
      setError(err instanceof RpcError ? err : new RpcError('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [method]);

  const reset = useCallback((): void => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, call, reset };
}

// Usage in components
const MovieSearch: FC = () => {
  const searchMovies = useRpc('movies.search');
  const [query, setQuery] = useState('');

  const handleSearch = async (): Promise<void> => {
    if (query.length < 2) return;
    
    await searchMovies.call({
      query,
      filters: { genre: 'Action' }
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies..."
      />
      <button onClick={handleSearch} disabled={searchMovies.loading}>
        {searchMovies.loading ? 'Searching...' : 'Search'}
      </button>

      {searchMovies.error && (
        <div className="error">Error: {searchMovies.error.message}</div>
      )}

      {searchMovies.data && (
        <div>
          Found {searchMovies.data.totalItems} movies
          {searchMovies.data.items.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### **Real-Time Features**
```typescript
// Real-time movie updates
const useRealTimeMovies = (movieId: MovieId) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [comments, setComments] = useState<MovieComment[]>([]);

  useEffect(() => {
    // Subscribe to movie rating updates
    const ratingSubscription = rpcClient.subscribe<MovieRatingEvent>(
      'movie-rated',
      (event) => {
        if (event.movieId === movieId) {
          setMovie(prev => prev ? { ...prev, voteAverage: event.newAverage } : null);
          setRatings(prev => [...prev, {
            userId: event.userId,
            rating: event.rating,
            timestamp: event.timestamp
          }]);
        }
      }
    );

    // Subscribe to new comments
    const commentSubscription = rpcClient.subscribe<MovieCommentEvent>(
      'movie-comment-added',
      (event) => {
        if (event.movieId === movieId) {
          setComments(prev => [event.comment, ...prev]);
        }
      }
    );

    // Cleanup subscriptions
    return () => {
      ratingSubscription.unsubscribe();
      commentSubscription.unsubscribe();
    };
  }, [movieId]);

  return { movie, ratings, comments };
};
```

## 🛠️ RPC Server Implementation Preview

### **Server-Side RPC Handler**
```typescript
// Server-side method implementations
class MovieRpcService {
  constructor(private movieRepository: MovieRepository) {}

  async getPopular(params: MovieRpcParams<'movies.getPopular'>): Promise<MovieRpcResult<'movies.getPopular'>> {
    const { page = 1, limit = 20, genre } = params;
    
    // Validation
    if (page < 1) {
      throw new RpcValidationError('Page must be positive', 'page', page);
    }
    
    if (limit < 1 || limit > 100) {
      throw new RpcValidationError('Limit must be between 1 and 100', 'limit', limit);
    }

    // Business logic
    const movies = await this.movieRepository.findPopular({ page, limit, genre });
    return movies;
  }

  async rate(params: MovieRpcParams<'movies.rate'>): Promise<MovieRpcResult<'movies.rate'>> {
    const { movieId, rating, userId } = params;
    
    // Validation
    if (rating < 1 || rating > 10) {
      throw new RpcValidationError('Rating must be between 1 and 10', 'rating', rating);
    }

    // Check if movie exists
    const movie = await this.movieRepository.findById(movieId);
    if (!movie) {
      throw new RpcNotFoundError('Movie', movieId);
    }

    // Save rating
    await this.ratingRepository.saveRating(movieId, userId, rating);
    
    // Calculate new average
    const newAverage = await this.ratingRepository.calculateAverage(movieId);
    
    // Emit real-time event
    this.eventEmitter.emit('movie-rated', {
      movieId,
      userId,
      rating,
      newAverage,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      newAverage,
      userRating: rating
    };
  }
}

// RPC method routing
const rpcRouter = new RpcRouter()
  .service('movies', new MovieRpcService(movieRepository))
  .service('users', new UserRpcService(userRepository))
  .middleware(authMiddleware)
  .middleware(validationMiddleware)
  .middleware(errorHandlingMiddleware);

// WebSocket server integration
wsServer.on('message', async (message: string, client: WebSocket) => {
  try {
    const request = JSON.parse(message);
    const response = await rpcRouter.handle(request, { client });
    client.send(JSON.stringify(response));
  } catch (error) {
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error'
      }
    };
    client.send(JSON.stringify(errorResponse));
  }
});
```

## 🎯 Key Takeaways

### **RPC with TypeScript Benefits**
- **Complete Type Safety**: Every method call is fully typed
- **API Contract Enforcement**: Frontend/backend stay in sync
- **Real-Time Communication**: WebSocket subscriptions with types
- **Middleware Patterns**: Composable request/response processing
- **Error Categorization**: Specific error types for different scenarios

### **Production Considerations**
- **Connection Management**: Auto-reconnect and error recovery
- **Performance Monitoring**: Request timing and success metrics
- **Security**: Authentication and authorization middleware
- **Scalability**: Batching and rate limiting
- **Testing**: Mock clients and integration tests

### **Best Practices**
- Define comprehensive method interfaces
- Use branded types for IDs and sensitive data
- Implement proper error hierarchies
- Add middleware for cross-cutting concerns
- Monitor performance and connection health
- Provide fallbacks for connection failures

## 🏆 RPC Mastery

By mastering RPC with TypeScript, you gain:

1. **Type-Safe Communication**: Never worry about API mismatches
2. **Real-Time Features**: Easy WebSocket integration
3. **Middleware Architecture**: Composable, reusable request processing
4. **Error Handling**: Comprehensive error categorization
5. **Performance**: Batching, caching, and monitoring
6. **Testing**: Complete test coverage with type safety
7. **Documentation**: Self-documenting API contracts
8. **Team Collaboration**: Shared understanding through types

## 🚀 Beyond This Tutorial

You've now mastered:
- **TypeScript fundamentals** through advanced patterns
- **React integration** with complete type safety
- **API communication** including cutting-edge RPC
- **Production patterns** for scalable applications

Continue your journey:
- Explore our complete RPC implementation in `services/rpc-client.ts`
- Study the type definitions in `types/rpc.ts`
- Build your own type-safe APIs
- Contribute to the TypeScript community

**Congratulations!** You've completed one of the most comprehensive TypeScript tutorials ever created. You're now ready to build production-quality TypeScript applications with confidence! 🎉

---

**Tutorial Complete!** You've mastered TypeScript from basics to production-ready RPC systems. Time to build something amazing! 🚀
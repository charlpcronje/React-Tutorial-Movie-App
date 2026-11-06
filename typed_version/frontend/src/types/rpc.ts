/**
 * RPC (REMOTE PROCEDURE CALL) TYPE DEFINITIONS
 * 
 * This file demonstrates advanced TypeScript patterns for type-safe RPC communication:
 * 1. RPC METHOD SIGNATURES: Type-safe remote method definitions
 * 2. BIDIRECTIONAL COMMUNICATION: Client-server type contracts
 * 3. ERROR HANDLING: Comprehensive RPC error types
 * 4. SERIALIZATION TYPES: JSON-safe type constraints  
 * 5. PROTOCOL DEFINITIONS: WebSocket/HTTP RPC protocols
 * 6. MIDDLEWARE TYPES: RPC middleware pattern types
 * 7. SUBSCRIPTION TYPES: Real-time data subscription patterns
 * 8. AUTHENTICATION: RPC authentication type integration
 * 9. BATCH OPERATIONS: Multiple RPC calls in single request
 * 10. STREAMING TYPES: Real-time streaming data types
 */

import type { 
  Movie, 
  MovieWithUserData, 
  MovieGenre, 
  UserId, 
  MovieId, 
  GenreId,
  ApiError,
  PaginatedData
} from './index';

// ============================================================================
// CORE RPC TYPES
// ============================================================================

/**
 * RPC Protocol Version
 * 
 * Versioned RPC protocol for backwards compatibility.
 */
export type RPCVersion = '1.0' | '2.0';

/**
 * JSON-RPC 2.0 Request Structure
 * 
 * Standard JSON-RPC request format with TypeScript typing.
 */
export interface RPCRequest<TMethod extends string = string, TParams = unknown> {
  readonly jsonrpc: RPCVersion;
  readonly id: string | number;
  readonly method: TMethod;
  readonly params?: TParams;
}

/**
 * JSON-RPC 2.0 Response Structure
 * 
 * Standard JSON-RPC response format with discriminated union.
 */
export type RPCResponse<TResult = unknown> = 
  | RPCSuccessResponse<TResult>
  | RPCErrorResponse;

/**
 * Successful RPC Response
 * 
 * Response structure for successful RPC calls.
 */
export interface RPCSuccessResponse<TResult> {
  readonly jsonrpc: RPCVersion;
  readonly id: string | number;
  readonly result: TResult;
}

/**
 * Error RPC Response
 * 
 * Response structure for failed RPC calls.
 */
export interface RPCErrorResponse {
  readonly jsonrpc: RPCVersion;
  readonly id: string | number | null;
  readonly error: RPCError;
}

/**
 * RPC Error Structure
 * 
 * Detailed error information following JSON-RPC 2.0 spec.
 */
export interface RPCError {
  readonly code: RPCErrorCode;
  readonly message: string;
  readonly data?: unknown;
}

/**
 * RPC Error Codes
 * 
 * Standard and custom error codes for RPC operations.
 */
export enum RPCErrorCode {
  // JSON-RPC 2.0 standard errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // Custom application errors
  AUTHENTICATION_ERROR = -32001,
  AUTHORIZATION_ERROR = -32002,
  VALIDATION_ERROR = -32003,
  RESOURCE_NOT_FOUND = -32004,
  RESOURCE_CONFLICT = -32005,
  RATE_LIMIT_EXCEEDED = -32006,
  SERVICE_UNAVAILABLE = -32007,
}

// ============================================================================
// SERIALIZATION CONSTRAINTS
// ============================================================================

/**
 * JSON Serializable Type Constraint
 * 
 * Ensures types can be safely serialized to/from JSON.
 */
export type JSONSerializable = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONSerializable[] 
  | { [key: string]: JSONSerializable };

/**
 * RPC-Safe Type Constraint
 * 
 * Types that can be safely transmitted via RPC.
 */
export type RPCSafe<T> = T extends JSONSerializable ? T : never;

// ============================================================================
// MOVIE SERVICE RPC METHODS
// ============================================================================

/**
 * Movie Service Method Definitions
 * 
 * Complete type-safe definitions for all movie-related RPC methods.
 */
export interface MovieServiceMethods {
  // Movie retrieval methods
  'movies.getPopular': {
    params: { page?: number; limit?: number };
    result: PaginatedData<Movie>;
  };
  
  'movies.getTrending': {
    params: { timeWindow: 'day' | 'week'; limit?: number };
    result: Movie[];
  };
  
  'movies.search': {
    params: { 
      query: string; 
      page?: number; 
      filters?: MovieSearchFilters 
    };
    result: PaginatedData<Movie>;
  };
  
  'movies.getDetails': {
    params: { id: MovieId };
    result: MovieWithUserData;
  };
  
  'movies.getGenres': {
    params: Record<string, never>; // No parameters
    result: MovieGenre[];
  };
  
  // User interaction methods
  'movies.rate': {
    params: { id: MovieId; rating: number };
    result: { success: true; newAverage: number };
  };
  
  'movies.toggleFavorite': {
    params: { id: MovieId };
    result: { success: true; isFavorite: boolean };
  };
  
  'movies.addComment': {
    params: { 
      movieId: MovieId; 
      content: string; 
      rating?: number 
    };
    result: MovieComment;
  };
  
  'movies.getComments': {
    params: { movieId: MovieId; page?: number };
    result: PaginatedData<MovieComment>;
  };
}

/**
 * User Service Method Definitions
 * 
 * Type-safe definitions for user-related RPC methods.
 */
export interface UserServiceMethods {
  'users.authenticate': {
    params: { username: string; password: string };
    result: { token: string; user: UserProfile };
  };
  
  'users.getProfile': {
    params: { userId: UserId };
    result: UserProfile;
  };
  
  'users.updateProfile': {
    params: { 
      userId: UserId; 
      updates: Partial<UserProfileUpdate> 
    };
    result: UserProfile;
  };
  
  'users.getFavorites': {
    params: { userId: UserId; page?: number };
    result: PaginatedData<MovieWithUserData>;
  };
  
  'users.getWatchHistory': {
    params: { userId: UserId; page?: number };
    result: PaginatedData<WatchHistoryEntry>;
  };
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * Movie Search Filters
 * 
 * RPC-safe filtering options for movie searches.
 */
export interface MovieSearchFilters {
  readonly genres?: GenreId[];
  readonly yearRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly ratingRange?: {
    readonly min: number;
    readonly max: number;
  };
  readonly sortBy?: 'title' | 'year' | 'rating' | 'popularity';
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Movie Comment Structure
 * 
 * RPC-safe comment data structure.
 */
export interface MovieComment {
  readonly id: string;
  readonly movieId: MovieId;
  readonly userId: UserId;
  readonly username: string;
  readonly content: string;
  readonly rating?: number;
  readonly createdAt: string; // ISO string
  readonly likesCount: number;
  readonly isLiked?: boolean; // User's like status
}

/**
 * User Profile Structure
 * 
 * RPC-safe user profile data.
 */
export interface UserProfile {
  readonly id: UserId;
  readonly username: string;
  readonly email: string;
  readonly displayName: string;
  readonly avatar?: string;
  readonly joinedAt: string; // ISO string
  readonly preferences: UserPreferences;
}

/**
 * User Profile Update
 * 
 * Updateable user profile fields.
 */
export interface UserProfileUpdate {
  readonly displayName?: string;
  readonly avatar?: string;
  readonly preferences?: Partial<UserPreferences>;
}

/**
 * User Preferences
 * 
 * User-specific application preferences.
 */
export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
  readonly notifications: {
    readonly email: boolean;
    readonly push: boolean;
    readonly newReleases: boolean;
    readonly recommendations: boolean;
  };
  readonly privacy: {
    readonly showWatchHistory: boolean;
    readonly showFavorites: boolean;
    readonly allowRecommendations: boolean;
  };
}

/**
 * Watch History Entry
 * 
 * Record of user movie viewing activity.
 */
export interface WatchHistoryEntry {
  readonly id: string;
  readonly movieId: MovieId;
  readonly movie: Movie;
  readonly watchedAt: string; // ISO string
  readonly watchDuration?: number; // seconds
  readonly completed: boolean;
  readonly rating?: number;
}

// ============================================================================
// RPC CLIENT TYPES
// ============================================================================

/**
 * Combined Service Methods
 * 
 * Union of all available RPC service methods.
 */
export type AllServiceMethods = MovieServiceMethods & UserServiceMethods;

/**
 * RPC Method Names
 * 
 * Extract all available method names for type safety.
 */
export type RPCMethodName = keyof AllServiceMethods;

/**
 * RPC Method Parameters
 * 
 * Extract parameter types for a specific RPC method.
 */
export type RPCParams<T extends RPCMethodName> = AllServiceMethods[T]['params'];

/**
 * RPC Method Results
 * 
 * Extract result types for a specific RPC method.
 */
export type RPCResult<T extends RPCMethodName> = AllServiceMethods[T]['result'];

// ============================================================================
// RPC CLIENT INTERFACE
// ============================================================================

/**
 * RPC Client Interface
 * 
 * Type-safe RPC client for making remote procedure calls.
 */
export interface RPCClient {
  /**
   * Call a remote procedure
   */
  call<T extends RPCMethodName>(
    method: T,
    params: RPCParams<T>
  ): Promise<RPCResult<T>>;
  
  /**
   * Batch multiple RPC calls
   */
  batch<T extends readonly RPCBatchCall[]>(
    calls: T
  ): Promise<RPCBatchResult<T>>;
  
  /**
   * Subscribe to real-time updates
   */
  subscribe<T extends RPCSubscriptionMethod>(
    method: T,
    params: RPCSubscriptionParams<T>,
    callback: (data: RPCSubscriptionData<T>) => void
  ): RPCSubscription;
  
  /**
   * Close the RPC connection
   */
  close(): Promise<void>;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * RPC Batch Call
 * 
 * Single call within a batch operation.
 */
export interface RPCBatchCall {
  readonly method: RPCMethodName;
  readonly params: unknown;
  readonly id: string | number;
}

/**
 * RPC Batch Result
 * 
 * Results from a batch RPC operation.
 */
export type RPCBatchResult<T extends readonly RPCBatchCall[]> = {
  readonly [K in keyof T]: T[K] extends RPCBatchCall 
    ? RPCResponse<RPCResult<T[K]['method']>>
    : never;
};

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

/**
 * RPC Subscription Methods
 * 
 * Methods that support real-time subscriptions.
 */
export interface RPCSubscriptionMethods {
  'movies.subscribeToUpdates': {
    params: { movieIds: MovieId[] };
    data: { movieId: MovieId; updates: Partial<Movie> };
  };
  
  'movies.subscribeToComments': {
    params: { movieId: MovieId };
    data: { comment: MovieComment; action: 'added' | 'updated' | 'deleted' };
  };
  
  'users.subscribeToActivity': {
    params: { userId: UserId };
    data: { activity: UserActivity };
  };
}

/**
 * Subscription Method Names
 */
export type RPCSubscriptionMethod = keyof RPCSubscriptionMethods;

/**
 * Subscription Parameters
 */
export type RPCSubscriptionParams<T extends RPCSubscriptionMethod> = 
  RPCSubscriptionMethods[T]['params'];

/**
 * Subscription Data
 */
export type RPCSubscriptionData<T extends RPCSubscriptionMethod> = 
  RPCSubscriptionMethods[T]['data'];

/**
 * User Activity Type
 */
export interface UserActivity {
  readonly type: 'rating' | 'favorite' | 'comment' | 'watch';
  readonly movieId: MovieId;
  readonly timestamp: string; // ISO string
  readonly data?: unknown;
}

/**
 * RPC Subscription Handle
 * 
 * Handle for managing active subscriptions.
 */
export interface RPCSubscription {
  readonly id: string;
  readonly method: RPCSubscriptionMethod;
  readonly params: unknown;
  unsubscribe(): Promise<void>;
}

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

/**
 * RPC Middleware Function
 * 
 * Middleware for intercepting and modifying RPC calls.
 */
export type RPCMiddleware = (
  request: RPCRequest,
  next: (request: RPCRequest) => Promise<RPCResponse>
) => Promise<RPCResponse>;

/**
 * RPC Context
 * 
 * Context object passed through middleware chain.
 */
export interface RPCContext {
  readonly requestId: string;
  readonly timestamp: number;
  readonly userId?: UserId;
  readonly userAgent?: string;
  readonly ip?: string;
  readonly metadata: Record<string, unknown>;
}

// ============================================================================
// AUTHENTICATION INTEGRATION
// ============================================================================

/**
 * Authenticated RPC Request
 * 
 * RPC request with authentication token.
 */
export interface AuthenticatedRPCRequest<TMethod extends string = string, TParams = unknown> 
  extends RPCRequest<TMethod, TParams> {
  readonly auth?: {
    readonly token: string;
    readonly type: 'Bearer' | 'JWT';
  };
}

/**
 * Authentication Middleware
 * 
 * Specific middleware for handling authentication.
 */
export interface AuthenticationMiddleware {
  readonly authenticate: (token: string) => Promise<UserId | null>;
  readonly authorize: (userId: UserId, method: string) => Promise<boolean>;
}

// ============================================================================
// CONNECTION TYPES
// ============================================================================

/**
 * RPC Connection State
 * 
 * Current state of the RPC connection.
 */
export type RPCConnectionState = 
  | 'disconnected'
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'
  | 'error';

/**
 * RPC Connection Options
 * 
 * Configuration for RPC client connection.
 */
export interface RPCConnectionOptions {
  readonly url: string;
  readonly protocol: 'websocket' | 'http';
  readonly timeout: number;
  readonly retries: number;
  readonly retryDelay: number;
  readonly auth?: {
    readonly token: string;
    readonly refreshToken?: string;
  };
  readonly headers?: Record<string, string>;
}

/**
 * RPC Connection Events
 * 
 * Events emitted by the RPC connection.
 */
export interface RPCConnectionEvents {
  readonly connected: () => void;
  readonly disconnected: (reason: string) => void;
  readonly error: (error: Error) => void;
  readonly message: (message: RPCResponse) => void;
  readonly stateChange: (state: RPCConnectionState) => void;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type Guard for RPC Success Response
 */
export function isRPCSuccessResponse<T>(
  response: RPCResponse<T>
): response is RPCSuccessResponse<T> {
  return 'result' in response;
}

/**
 * Type Guard for RPC Error Response
 */
export function isRPCErrorResponse<T>(
  response: RPCResponse<T>
): response is RPCErrorResponse {
  return 'error' in response;
}

/**
 * Create RPC Request Helper
 */
export function createRPCRequest<T extends RPCMethodName>(
  method: T,
  params: RPCParams<T>,
  id: string | number = Math.random().toString(36)
): RPCRequest<T, RPCParams<T>> {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
}

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. RPC TYPE SAFETY: Complete type safety for remote procedure calls
 * 2. JSON-RPC PROTOCOL: Standard protocol implementation in TypeScript
 * 3. DISCRIMINATED UNIONS: Type-safe response handling
 * 4. GENERIC CONSTRAINTS: Type constraints for serialization
 * 5. METHOD MAPPING: Type-safe method to parameter/result mapping
 * 6. BATCH OPERATIONS: Type-safe batch RPC calls
 * 7. SUBSCRIPTION PATTERNS: Real-time data subscription types
 * 8. MIDDLEWARE TYPING: Type-safe middleware patterns
 * 9. AUTHENTICATION: Auth integration with RPC
 * 10. CONNECTION MANAGEMENT: WebSocket/HTTP connection typing
 * 11. ERROR CATEGORIZATION: Structured RPC error handling
 * 12. TYPE GUARDS: Runtime type checking for responses
 * 13. UTILITY FUNCTIONS: Helper functions with proper typing
 * 14. ENUM USAGE: Error code enumeration
 * 15. INTERFACE COMPOSITION: Building complex types from simpler ones
 */
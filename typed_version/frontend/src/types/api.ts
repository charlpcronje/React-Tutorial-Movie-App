/**
 * API TYPE DEFINITIONS FOR EDUCATIONAL MOVIE APP
 * 
 * This file demonstrates advanced TypeScript patterns for API integration:
 * 1. HTTP METHOD TYPES: Type-safe HTTP method definitions
 * 2. ENDPOINT MAPPING: Structured API endpoint definitions
 * 3. REQUEST/RESPONSE TYPES: Complete API contract definitions
 * 4. ERROR HANDLING TYPES: Comprehensive error type definitions
 * 5. VALIDATION SCHEMAS: Runtime type validation integration
 * 6. CACHE TYPES: API caching strategy types
 * 7. AUTHENTICATION TYPES: User authentication type definitions
 * 8. RATE LIMITING TYPES: API rate limiting type definitions
 */

import { z } from 'zod';
import type { Movie, MovieWithUserData, MovieGenre, UserId, MovieId, GenreId } from './index';

// ============================================================================
// HTTP METHOD TYPES
// ============================================================================

/**
 * HTTP Methods Union Type
 * 
 * Strict typing for HTTP methods used in the application.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * HTTP Status Code Types
 * 
 * Comprehensive HTTP status code definitions for type safety.
 */
export type HttpStatusCode = 
  // Success codes
  | 200 | 201 | 202 | 204
  // Redirection codes
  | 301 | 302 | 304
  // Client error codes
  | 400 | 401 | 403 | 404 | 409 | 422 | 429
  // Server error codes
  | 500 | 501 | 502 | 503 | 504;

// ============================================================================
// API ENDPOINT DEFINITIONS
// ============================================================================

/**
 * API Endpoint Configuration
 * 
 * Type-safe endpoint definitions with method and parameter constraints.
 */
export interface ApiEndpoint<TParams = unknown, TResponse = unknown> {
  readonly method: HttpMethod;
  readonly path: string;
  readonly params?: TParams;
  readonly response: TResponse;
  readonly requiresAuth?: boolean;
  readonly rateLimit?: {
    readonly requests: number;
    readonly windowMs: number;
  };
}

/**
 * Movie API Endpoints
 * 
 * Complete definition of all movie-related API endpoints.
 */
export interface MovieApiEndpoints {
  readonly 'movies.popular': ApiEndpoint<
    { page?: number; limit?: number },
    PaginatedMovieResponse
  >;
  readonly 'movies.trending': ApiEndpoint<
    { timeWindow: 'day' | 'week' },
    PaginatedMovieResponse
  >;
  readonly 'movies.search': ApiEndpoint<
    { query: string; page?: number; filters?: MovieSearchFilters },
    PaginatedMovieResponse
  >;
  readonly 'movies.details': ApiEndpoint<
    { id: MovieId },
    SingleMovieResponse
  >;
  readonly 'movies.rate': ApiEndpoint<
    { id: MovieId; rating: number },
    void
  >;
  readonly 'movies.favorite': ApiEndpoint<
    { id: MovieId; favorite: boolean },
    void
  >;
  readonly 'movies.comments': ApiEndpoint<
    { id: MovieId; page?: number },
    PaginatedCommentsResponse
  >;
}

// ============================================================================
// REQUEST/RESPONSE TYPE DEFINITIONS
// ============================================================================

/**
 * Base API Response
 * 
 * Standard response structure for all API endpoints.
 */
export interface BaseApiResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp: string;
  readonly requestId: string;
}

/**
 * Successful API Response
 * 
 * Generic wrapper for successful responses with data.
 */
export interface SuccessApiResponse<T> extends BaseApiResponse {
  readonly success: true;
  readonly data: T;
}

/**
 * Error API Response
 * 
 * Standardized error response structure.
 */
export interface ErrorApiResponse extends BaseApiResponse {
  readonly success: false;
  readonly error: {
    readonly type: ApiErrorType;
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, string[]>;
    readonly stack?: string; // Only in development
  };
}

/**
 * Complete API Response Union
 * 
 * Union type representing all possible API responses.
 */
export type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;

/**
 * Paginated Response Data
 * 
 * Structure for paginated API responses.
 */
export interface PaginatedData<T> {
  readonly items: readonly T[];
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
}

/**
 * Specific Response Types
 */
export type PaginatedMovieResponse = ApiResponse<PaginatedData<Movie>>;
export type SingleMovieResponse = ApiResponse<MovieWithUserData>;
export type PaginatedCommentsResponse = ApiResponse<PaginatedData<MovieComment>>;

// ============================================================================
// ERROR TYPE DEFINITIONS
// ============================================================================

/**
 * API Error Types
 * 
 * Categorized error types for proper error handling.
 */
export type ApiErrorType = 
  | 'validation'      // Request validation failed
  | 'authentication' // User not authenticated
  | 'authorization'  // User not authorized
  | 'not_found'      // Resource not found
  | 'conflict'       // Resource conflict
  | 'rate_limit'     // Rate limit exceeded
  | 'server'         // Internal server error
  | 'network'        // Network connectivity error
  | 'timeout'        // Request timeout
  | 'cancelled';     // Request cancelled

/**
 * Detailed Error Information
 * 
 * Extended error information for debugging and user feedback.
 */
export interface ApiErrorDetails {
  readonly type: ApiErrorType;
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly value?: unknown;
  readonly constraint?: string;
}

// ============================================================================
// SEARCH AND FILTER TYPES
// ============================================================================

/**
 * Movie Search Filters
 * 
 * Comprehensive filtering options for movie searches.
 */
export interface MovieSearchFilters {
  readonly genre?: GenreId[];
  readonly releaseYear?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly rating?: {
    readonly min?: number;
    readonly max?: number;
  };
  readonly sortBy?: MovieSortOptions;
  readonly sortDirection?: 'asc' | 'desc';
}

/**
 * Movie Sort Options
 * 
 * Available sorting criteria for movie lists.
 */
export type MovieSortOptions = 
  | 'title'
  | 'releaseYear' 
  | 'rating'
  | 'popularity'
  | 'voteCount'
  | 'dateAdded';

// ============================================================================
// COMMENT SYSTEM TYPES
// ============================================================================

/**
 * Movie Comment Interface
 * 
 * Structure for user comments on movies.
 */
export interface MovieComment {
  readonly id: string;
  readonly movieId: MovieId;
  readonly userId: UserId;
  readonly username: string;
  readonly userAvatar?: string;
  readonly content: string;
  readonly rating?: number; // Optional rating with comment
  readonly createdAt: string; // ISO date string
  readonly updatedAt?: string;
  readonly likes: number;
  readonly replies?: readonly MovieCommentReply[];
  readonly isEdited: boolean;
  readonly isPinned: boolean;
}

/**
 * Comment Reply Interface
 * 
 * Structure for replies to comments.
 */
export interface MovieCommentReply {
  readonly id: string;
  readonly commentId: string;
  readonly userId: UserId;
  readonly username: string;
  readonly userAvatar?: string;
  readonly content: string;
  readonly createdAt: string;
  readonly likes: number;
  readonly isEdited: boolean;
}

// ============================================================================
// VALIDATION SCHEMAS WITH ZOD
// ============================================================================

/**
 * Zod Schema for Movie Search
 * 
 * Runtime validation schema for movie search requests.
 */
export const movieSearchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().int().min(1).max(1000).optional(),
  filters: z.object({
    genre: z.array(z.number().int().positive()).optional(),
    releaseYear: z.object({
      min: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
      max: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
    }).optional(),
    rating: z.object({
      min: z.number().min(0).max(10).optional(),
      max: z.number().min(0).max(10).optional(),
    }).optional(),
    sortBy: z.enum(['title', 'releaseYear', 'rating', 'popularity', 'voteCount', 'dateAdded']).optional(),
    sortDirection: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});

/**
 * Zod Schema for Movie Rating
 * 
 * Runtime validation for movie rating submissions.
 */
export const movieRatingSchema = z.object({
  id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

/**
 * Zod Schema for Comment Submission
 * 
 * Runtime validation for comment submissions.
 */
export const commentSubmissionSchema = z.object({
  movieId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
});

// ============================================================================
// CACHE STRATEGY TYPES
// ============================================================================

/**
 * Cache Strategy Configuration
 * 
 * Type definitions for API response caching strategies.
 */
export interface CacheStrategy {
  readonly enabled: boolean;
  readonly ttl: number; // Time to live in milliseconds
  readonly staleWhileRevalidate?: boolean;
  readonly tags?: readonly string[];
}

/**
 * Cache Key Builder
 * 
 * Type-safe cache key generation for different endpoints.
 */
export type CacheKeyBuilder<T extends keyof MovieApiEndpoints> = (
  endpoint: T,
  params: MovieApiEndpoints[T]['params']
) => string;

/**
 * Cache Configuration Map
 * 
 * Cache settings for each API endpoint.
 */
export interface ApiCacheConfig {
  readonly [K in keyof MovieApiEndpoints]: CacheStrategy;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication Token Structure
 * 
 * JWT token payload structure.
 */
export interface AuthToken {
  readonly userId: UserId;
  readonly username: string;
  readonly email: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly exp: number; // Expiration timestamp
  readonly iat: number; // Issued at timestamp
}

/**
 * Authentication State
 * 
 * Current authentication state of the user.
 */
export type AuthState = 
  | { readonly status: 'unauthenticated' }
  | { readonly status: 'loading' }
  | { readonly status: 'authenticated'; readonly user: AuthToken }
  | { readonly status: 'error'; readonly error: ApiErrorDetails };

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

/**
 * Rate Limit Information
 * 
 * Rate limiting details returned in response headers.
 */
export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly resetTime: number; // Unix timestamp
  readonly windowMs: number;
}

/**
 * Rate Limit Exceeded Error
 * 
 * Specific error type for rate limit violations.
 */
export interface RateLimitError extends ApiErrorDetails {
  readonly type: 'rate_limit';
  readonly rateLimitInfo: RateLimitInfo;
  readonly retryAfter: number; // Seconds to wait before retry
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type Guard for Success Response
 * 
 * Runtime type checking for successful API responses.
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessApiResponse<T> {
  return response.success === true;
}

/**
 * Type Guard for Error Response
 * 
 * Runtime type checking for error API responses.
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ErrorApiResponse {
  return response.success === false;
}

/**
 * Type Guard for Rate Limit Error
 * 
 * Check if error is specifically a rate limit error.
 */
export function isRateLimitError(error: ApiErrorDetails): error is RateLimitError {
  return error.type === 'rate_limit';
}

// ============================================================================
// REQUEST CONFIGURATION TYPES
// ============================================================================

/**
 * API Request Configuration
 * 
 * Complete configuration for making API requests.
 */
export interface ApiRequestConfig {
  readonly method: HttpMethod;
  readonly url: string;
  readonly params?: Record<string, unknown>;
  readonly data?: unknown;
  readonly headers?: Record<string, string>;
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly cache?: CacheStrategy;
  readonly validateResponse?: boolean;
}

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. API CONTRACT TYPING: Complete type safety for API interactions
 * 2. UNION TYPES: Multiple possible response types
 * 3. GENERIC INTERFACES: Reusable API response patterns
 * 4. DISCRIMINATED UNIONS: Type-safe error handling
 * 5. ZOD INTEGRATION: Runtime validation with TypeScript
 * 6. TYPE GUARDS: Runtime type checking functions
 * 7. MAPPED TYPES: Dynamic type generation
 * 8. TEMPLATE LITERALS: Type-safe string manipulation
 * 9. CONDITIONAL TYPES: Complex type logic
 * 10. BRANDED TYPES: Enhanced primitive type safety
 * 11. READONLY MODIFIERS: Immutability at type level
 * 12. OPTIONAL PROPERTIES: Flexible API contracts
 * 13. NAMESPACE ORGANIZATION: Logical type grouping
 * 14. ERROR CATEGORIZATION: Structured error handling
 * 15. CACHE TYPE SAFETY: Type-safe caching strategies
 */
/**
 * COMPREHENSIVE TYPE DEFINITIONS FOR EDUCATIONAL MOVIE APP
 * 
 * This file demonstrates advanced TypeScript features and patterns:
 * 1. INTERFACE DEFINITIONS: Structured data contracts
 * 2. UNION TYPES: Multiple possible values
 * 3. GENERIC TYPES: Reusable type patterns
 * 4. UTILITY TYPES: TypeScript built-in helper types
 * 5. MAPPED TYPES: Transforming existing types
 * 6. CONDITIONAL TYPES: Type logic based on conditions
 * 7. TEMPLATE LITERAL TYPES: String manipulation at type level
 * 8. BRANDED TYPES: Adding type safety to primitive types
 * 9. DISCRIMINATED UNIONS: Type-safe state management
 * 10. RECURSIVE TYPES: Self-referencing type structures
 */

// ============================================================================
// BASIC DATA STRUCTURES
// ============================================================================

/**
 * Movie Genre Interface
 * 
 * Represents a movie genre with strict typing for API consistency.
 */
export interface MovieGenre {
  readonly id: number;
  readonly name: string;
}

/**
 * Base Movie Interface
 * 
 * Core movie data structure with comprehensive typing.
 * Uses 'readonly' for immutability and optional properties for flexibility.
 */
export interface Movie {
  readonly id: number;
  readonly title: string;
  readonly overview: string;
  readonly releaseYear: number;
  readonly voteAverage: number;
  readonly voteCount: number;
  readonly ratingStars: 1 | 2 | 3 | 4 | 5; // Union of literal types
  readonly posterUrl?: string; // Optional property
  readonly posterUrlSmall?: string;
  readonly genres: readonly MovieGenre[]; // Readonly array
  readonly isPopular: boolean;
  readonly isHighRated: boolean;
  readonly hasImage: boolean;
}

/**
 * Extended Movie Interface with User Interactions
 * 
 * Demonstrates interface extension and optional properties.
 */
export interface MovieWithUserData extends Movie {
  readonly userRating?: number;
  readonly isFavorite?: boolean;
  readonly watchedDate?: Date;
  readonly userNotes?: string;
}

// ============================================================================
// APPLICATION STATE TYPES
// ============================================================================

/**
 * Navigation Section Type
 * 
 * String literal union type for type-safe navigation.
 */
export type NavigationSection = 
  | 'welcome' 
  | 'components' 
  | 'reactivity' 
  | 'interactions' 
  | 'hooks' 
  | 'api';

/**
 * Application Settings Interface
 * 
 * Demonstrates nested object typing and boolean flags.
 */
export interface AppSettings {
  readonly soundEffects: boolean;
  readonly animations: boolean;
  readonly darkMode: boolean;
  readonly developerMode: boolean;
}

/**
 * Performance Metrics Interface
 * 
 * For tracking application performance with precise types.
 */
export interface PerformanceMetrics {
  readonly renderCount: number;
  readonly lastRenderTime: number;
  readonly navigationCount: number;
}

/**
 * User Progress Interface
 * 
 * Tracks user learning progress through the tutorial.
 */
export interface UserProgress {
  readonly completedSections: readonly NavigationSection[];
  readonly currentSection: NavigationSection;
  readonly startTime: Date;
  readonly lastActivity: Date;
  readonly totalTimeSpent: number; // in milliseconds
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Button Variant and Size Types
 * 
 * Demonstrates union types for component styling.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button Props Interface
 * 
 * Comprehensive button component props with advanced TypeScript features.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly fullWidth?: boolean;
  readonly children: React.ReactNode;
}

/**
 * Movie Card Props Interface
 * 
 * Demonstrates event handler typing and optional callbacks.
 */
export interface MovieCardProps {
  readonly movie: Movie;
  readonly onMovieClick?: (movie: Movie) => void;
  readonly onFavoriteChange?: (movie: Movie, isFavorite: boolean) => void;
  readonly onRatingChange?: (movie: Movie, rating: number) => void;
  readonly showUserActions?: boolean;
  readonly className?: string;
}

// ============================================================================
// ADVANCED TYPESCRIPT FEATURES
// ============================================================================

/**
 * Branded Types for Type Safety
 * 
 * Adds compile-time safety to primitive types.
 */
export type UserId = number & { readonly __brand: 'UserId' };
export type MovieId = number & { readonly __brand: 'MovieId' };
export type GenreId = number & { readonly __brand: 'GenreId' };

/**
 * API Response Wrapper
 * 
 * Generic type for consistent API response structure.
 */
export interface ApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp: string;
}

/**
 * Paginated Response
 * 
 * Generic type for paginated API responses.
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;
  };
}

/**
 * Error Response Interface
 * 
 * Structured error handling with discriminated union.
 */
export interface ApiError {
  readonly type: 'validation' | 'authentication' | 'authorization' | 'server' | 'network';
  readonly message: string;
  readonly details?: Record<string, string>;
  readonly code?: string;
  readonly timestamp: string;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

/**
 * Async State Type
 * 
 * Discriminated union for handling async operations.
 */
export type AsyncState<T> = 
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: ApiError };

/**
 * Movie Collection State
 * 
 * Comprehensive state for managing movie collections.
 */
export interface MovieCollectionState {
  readonly popular: AsyncState<Movie[]>;
  readonly trending: AsyncState<Movie[]>;
  readonly favorites: AsyncState<MovieWithUserData[]>;
  readonly search: AsyncState<Movie[]>;
  readonly filters: {
    readonly genre?: GenreId;
    readonly year?: number;
    readonly rating?: number;
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Custom Event Types
 * 
 * Type-safe custom events for component communication.
 */
export interface MovieInteractionEvent {
  readonly type: 'click' | 'favorite' | 'rating' | 'share';
  readonly movie: Movie;
  readonly timestamp: Date;
  readonly userId?: UserId;
}

/**
 * Navigation Event Interface
 * 
 * For tracking user navigation through the tutorial.
 */
export interface NavigationEvent {
  readonly from: NavigationSection;
  readonly to: NavigationSection;
  readonly timestamp: Date;
  readonly trigger: 'user' | 'programmatic' | 'deep-link';
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Local Storage Hook Return Type
 * 
 * Generic type for useLocalStorage hook return value.
 */
export type UseLocalStorageReturn<T> = [
  value: T,
  setValue: (value: T | ((prev: T) => T)) => void,
  removeValue: () => void
];

/**
 * Toggle Hook Return Type
 * 
 * Return type for useToggle hook.
 */
export type UseToggleReturn = [
  value: boolean,
  toggle: () => void,
  setTrue: () => void,
  setFalse: () => void
];

/**
 * API Hook Return Type
 * 
 * Generic return type for API hooks with comprehensive state.
 */
export interface UseApiReturn<T> {
  readonly data: T | null;
  readonly isLoading: boolean;
  readonly error: ApiError | null;
  readonly refetch: () => Promise<void>;
  readonly reset: () => void;
}

// ============================================================================
// UTILITY TYPES DEMONSTRATION
// ============================================================================

/**
 * Partial Movie Update Type
 * 
 * Using TypeScript's Partial utility type for updates.
 */
export type MovieUpdate = Partial<Pick<Movie, 'title' | 'overview' | 'genres'>>;

/**
 * Required User Data Type
 * 
 * Making specific optional properties required.
 */
export type RequiredUserMovie = Required<Pick<MovieWithUserData, 'userRating' | 'isFavorite'>>;

/**
 * Movie Keys Type
 * 
 * Extract keys from Movie interface for type safety.
 */
export type MovieKeys = keyof Movie;

/**
 * Movie Values Type
 * 
 * Extract value types from Movie interface.
 */
export type MovieValues = Movie[MovieKeys];

// ============================================================================
// MAPPED TYPES EXAMPLES
// ============================================================================

/**
 * Optional Movie Type
 * 
 * Makes all Movie properties optional using mapped types.
 */
export type OptionalMovie = {
  readonly [K in keyof Movie]?: Movie[K];
};

/**
 * Movie Flags Type
 * 
 * Convert all Movie properties to boolean flags.
 */
export type MovieFlags = {
  readonly [K in keyof Movie]: boolean;
};

// ============================================================================
// CONDITIONAL TYPES EXAMPLES
// ============================================================================

/**
 * Extract Array Element Type
 * 
 * Conditional type to extract element type from arrays.
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Extract Promise Type
 * 
 * Conditional type to extract value from Promise.
 */
export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

// ============================================================================
// TEMPLATE LITERAL TYPES
// ============================================================================

/**
 * CSS Color Variables
 * 
 * Template literal types for CSS custom properties.
 */
export type CSSVariable<T extends string> = `--${T}`;
export type ThemeColor = 'primary' | 'secondary' | 'accent' | 'neutral';
export type ThemeColorVariable = CSSVariable<`color-${ThemeColor}`>;

// ============================================================================
// RECURSIVE TYPES
// ============================================================================

/**
 * Nested Menu Item Type
 * 
 * Recursive type for hierarchical menu structures.
 */
export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly path?: string;
  readonly icon?: React.ReactNode;
  readonly children?: readonly MenuItem[];
}

// ============================================================================
// RPC COMMUNICATION TYPES
// ============================================================================

/**
 * RPC Method Definition
 * 
 * Type-safe RPC method signatures.
 */
export interface RPCMethod<TParams = unknown, TResult = unknown> {
  readonly method: string;
  readonly params: TParams;
  readonly result: TResult;
}

/**
 * Movie Service RPC Methods
 * 
 * Specific RPC method definitions for movie operations.
 */
export interface MovieRPCMethods {
  readonly 'movies.getPopular': RPCMethod<{ page: number }, PaginatedResponse<Movie>>;
  readonly 'movies.search': RPCMethod<{ query: string; page: number }, PaginatedResponse<Movie>>;
  readonly 'movies.getDetails': RPCMethod<{ id: MovieId }, ApiResponse<MovieWithUserData>>;
  readonly 'movies.rate': RPCMethod<{ id: MovieId; rating: number }, ApiResponse<void>>;
  readonly 'movies.favorite': RPCMethod<{ id: MovieId; favorite: boolean }, ApiResponse<void>>;
}

/**
 * RPC Request Type
 * 
 * Generic RPC request structure.
 */
export interface RPCRequest<T extends keyof MovieRPCMethods> {
  readonly id: string;
  readonly method: T;
  readonly params: MovieRPCMethods[T]['params'];
  readonly timestamp: string;
}

/**
 * RPC Response Type
 * 
 * Generic RPC response structure.
 */
export interface RPCResponse<T extends keyof MovieRPCMethods> {
  readonly id: string;
  readonly result?: MovieRPCMethods[T]['result'];
  readonly error?: ApiError;
  readonly timestamp: string;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

/**
 * Type-only Re-exports
 * 
 * Demonstrating type-only imports/exports for better tree-shaking.
 */
export type { 
  // React types we extend
  React, 
  // Component prop types
  HTMLButtonElement,
  ButtonHTMLAttributes
} from 'react';

/**
 * Default Export for Main Types
 * 
 * Convenient access to commonly used types.
 */
const Types = {
  Movie,
  MovieWithUserData,
  NavigationSection,
  AppSettings,
  AsyncState,
  ApiResponse,
  ButtonProps,
  MovieCardProps
} as const;

export default Types;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. INTERFACE DEFINITIONS: Structured contracts for objects
 * 2. TYPE ALIASES: Alternative names for types
 * 3. UNION TYPES: Multiple possible values (string | number)
 * 4. INTERSECTION TYPES: Combining multiple types (&)
 * 5. GENERIC TYPES: Reusable type patterns <T>
 * 6. UTILITY TYPES: Partial, Required, Pick, Omit
 * 7. MAPPED TYPES: Transform existing types
 * 8. CONDITIONAL TYPES: Type logic with extends
 * 9. TEMPLATE LITERALS: String manipulation at type level
 * 10. BRANDED TYPES: Add safety to primitives
 * 11. DISCRIMINATED UNIONS: Type-safe state patterns
 * 12. RECURSIVE TYPES: Self-referencing structures
 * 13. READONLY MODIFIERS: Immutability at type level
 * 14. OPTIONAL PROPERTIES: Flexible object shapes
 * 15. INDEX SIGNATURES: Dynamic property access
 */
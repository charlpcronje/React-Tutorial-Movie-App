# 🌐 tRPC Integration: End-to-End Type Safety

## What is tRPC?

tRPC (TypeScript Remote Procedure Call) provides end-to-end type safety from your API to your frontend. Unlike traditional REST APIs, tRPC automatically synchronizes types between client and server, eliminating the need for code generation or manual type definitions.

## Benefits for Movie App

- **🔒 Type Safety**: Compile-time errors for API mismatches
- **🚀 Developer Experience**: Auto-completion for API calls
- **📚 Self-Documenting**: Types serve as API documentation
- **🔄 Real-time Sync**: Server changes automatically reflect on client

## Server Setup (Backend)

### 1. Router Definition
```typescript
// server/routers/movieRouter.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { Movie, CreateMovieInput } from '../types/movie';

// Zod schemas for validation
const CreateMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().min(1900).max(2030),
  genre: z.array(z.string()).min(1, "At least one genre required"),
  director: z.object({
    name: z.string().min(1, "Director name required"),
    birthYear: z.number().min(1800).max(2020)
  }),
  description: z.string().optional(),
  rating: z.number().min(1).max(10).optional()
});

export const movieRouter = createTRPCRouter({
  // Get all movies
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const movies = await ctx.db.movie.findMany({
        include: {
          reviews: true,
          watchlist: true
        }
      });
      return movies;
    }),

  // Get movie by ID
  getById: publicProcedure
    .input(z.object({ 
      id: z.string().uuid("Invalid movie ID format") 
    }))
    .query(async ({ input, ctx }) => {
      const movie = await ctx.db.movie.findUnique({
        where: { id: input.id },
        include: {
          reviews: {
            include: { user: true }
          },
          director: true
        }
      });
      
      if (!movie) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Movie not found'
        });
      }
      
      return movie;
    }),

  // Create new movie
  create: publicProcedure
    .input(CreateMovieSchema)
    .mutation(async ({ input, ctx }) => {
      const movie = await ctx.db.movie.create({
        data: {
          ...input,
          id: generateUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return movie;
    }),

  // Search movies with filters
  search: publicProcedure
    .input(z.object({
      query: z.string().optional(),
      genre: z.array(z.string()).optional(),
      yearRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      sortBy: z.enum(['title', 'year', 'rating', 'createdAt']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
      const {
        query,
        genre,
        yearRange,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit,
        offset
      } = input;

      const whereClause: any = {};
      
      if (query) {
        whereClause.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }
      
      if (genre && genre.length > 0) {
        whereClause.genre = { hasSome: genre };
      }
      
      if (yearRange) {
        whereClause.year = {
          ...(yearRange.min && { gte: yearRange.min }),
          ...(yearRange.max && { lte: yearRange.max })
        };
      }

      const [movies, total] = await Promise.all([
        ctx.db.movie.findMany({
          where: whereClause,
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
          include: {
            reviews: {
              select: { rating: true }
            }
          }
        }),
        ctx.db.movie.count({ where: whereClause })
      ]);

      return {
        movies,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    }),

  // Update movie
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: CreateMovieSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input;
      
      const movie = await ctx.db.movie.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      
      return movie;
    }),

  // Delete movie
  delete: publicProcedure
    .input(z.object({ 
      id: z.string().uuid() 
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.movie.delete({
        where: { id: input.id }
      });
      
      return { success: true };
    })
});
```

### 2. Type Definitions
```typescript
// server/types/movie.ts
export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  director: Director;
  description?: string;
  rating?: number;
  poster?: string;
  createdAt: Date;
  updatedAt: Date;
  reviews?: Review[];
}

export interface Director {
  id: string;
  name: string;
  birthYear: number;
  biography?: string;
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  user: User;
}

export type CreateMovieInput = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMovieInput = Partial<CreateMovieInput>;
```

## Client Setup (Frontend)

### 1. tRPC Client Configuration
```typescript
// src/utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/routers/_app';

// React Query integration
export const trpc = createTRPCReact<AppRouter>();

// Vanilla client for use outside React components
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers() {
        return {
          Authorization: `Bearer ${getAuthToken()}`,
        };
      },
    }),
  ],
});

// Type helpers
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
```

### 2. Provider Setup
```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
    }),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
```

## Using tRPC in React Components

### 1. Query Hook Usage
```typescript
// src/components/MovieList.tsx
import React from 'react';
import { trpc } from '../utils/trpc';
import type { RouterOutputs } from '../utils/trpc';

// Type alias for cleaner code
type Movies = RouterOutputs['movie']['getAll'];
type Movie = Movies[0];

interface MovieListProps {
  searchQuery?: string;
  selectedGenres?: string[];
}

export const MovieList: React.FC<MovieListProps> = ({
  searchQuery,
  selectedGenres
}) => {
  // Type-safe query with auto-completion
  const {
    data: movies,
    isLoading,
    error,
    refetch
  } = trpc.movie.search.useQuery({
    query: searchQuery,
    genre: selectedGenres,
    sortBy: 'year',
    sortOrder: 'desc',
    limit: 20
  }, {
    enabled: true, // Always enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading movies...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 className="text-red-800 font-medium">Failed to load movies</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 text-red-700 underline hover:text-red-900"
        >
          Try again
        </button>
      </div>
    );
  }

  // No movies found
  if (!movies || movies.movies.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">No movies found</p>
        <p className="text-sm mt-1">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Found {movies.pagination.total} movies
        </h2>
        {movies.pagination.hasMore && (
          <button className="text-blue-600 hover:underline">
            Load more
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};
```

### 2. Mutation Hook Usage
```typescript
// src/components/CreateMovieForm.tsx
import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import type { RouterInputs } from '../utils/trpc';

type CreateMovieInput = RouterInputs['movie']['create'];

export const CreateMovieForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateMovieInput>({
    title: '',
    year: new Date().getFullYear(),
    genre: [],
    director: {
      name: '',
      birthYear: 1950
    }
  });

  // Query client for cache invalidation
  const utils = trpc.useUtils();

  // Type-safe mutation with optimistic updates
  const createMovieMutation = trpc.movie.create.useMutation({
    onSuccess: (newMovie) => {
      // Invalidate and refetch movies list
      utils.movie.getAll.invalidate();
      
      // Or optimistically update the cache
      utils.movie.getAll.setData(undefined, (oldData) => {
        if (!oldData) return [newMovie];
        return [newMovie, ...oldData];
      });

      // Reset form
      setFormData({
        title: '',
        year: new Date().getFullYear(),
        genre: [],
        director: { name: '', birthYear: 1950 }
      });
      
      // Show success notification
      toast.success('Movie created successfully!');
    },
    onError: (error) => {
      // Type-safe error handling
      if (error.data?.code === 'BAD_REQUEST') {
        // Handle validation errors
        const zodError = error.data.zodError;
        if (zodError) {
          Object.entries(zodError.fieldErrors).forEach(([field, errors]) => {
            toast.error(`${field}: ${errors?.[0]}`);
          });
        }
      } else {
        toast.error('Failed to create movie');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMovieMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            title: e.target.value 
          }))}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Year</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            year: parseInt(e.target.value) 
          }))}
          className="w-full p-2 border rounded-md"
          min={1900}
          max={2030}
          required
        />
      </div>

      <button
        type="submit"
        disabled={createMovieMutation.isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {createMovieMutation.isLoading ? 'Creating...' : 'Create Movie'}
      </button>
    </form>
  );
};
```

### 3. Real-time Updates with Subscriptions
```typescript
// src/hooks/useMovieSubscription.ts
import { useEffect } from 'react';
import { trpc } from '../utils/trpc';

export function useMovieUpdates() {
  const utils = trpc.useUtils();

  // Subscribe to movie updates
  trpc.movie.onUpdate.useSubscription(undefined, {
    onData: (updatedMovie) => {
      // Update the specific movie in cache
      utils.movie.getById.setData(
        { id: updatedMovie.id },
        updatedMovie
      );
      
      // Update the movie in the list
      utils.movie.getAll.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(movie => 
          movie.id === updatedMovie.id ? updatedMovie : movie
        );
      });
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  return null; // This hook only manages subscriptions
}
```

## Advanced Patterns

### 1. Custom Hooks for Complex Logic
```typescript
// src/hooks/useMovieManager.ts
import { useState } from 'react';
import { trpc } from '../utils/trpc';
import type { RouterInputs, RouterOutputs } from '../utils/trpc';

type Movie = RouterOutputs['movie']['getById'];
type SearchInput = RouterInputs['movie']['search'];

export function useMovieManager() {
  const [searchParams, setSearchParams] = useState<SearchInput>({
    limit: 20,
    offset: 0
  });

  const utils = trpc.useUtils();

  // Queries
  const moviesQuery = trpc.movie.search.useQuery(searchParams);
  
  // Mutations
  const createMutation = trpc.movie.create.useMutation({
    onSuccess: () => utils.movie.search.invalidate()
  });
  
  const updateMutation = trpc.movie.update.useMutation({
    onSuccess: () => utils.movie.search.invalidate()
  });
  
  const deleteMutation = trpc.movie.delete.useMutation({
    onSuccess: () => utils.movie.search.invalidate()
  });

  // Actions
  const searchMovies = (params: Partial<SearchInput>) => {
    setSearchParams(prev => ({ ...prev, ...params, offset: 0 }));
  };

  const loadMore = () => {
    if (moviesQuery.data?.pagination.hasMore) {
      setSearchParams(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const createMovie = (data: RouterInputs['movie']['create']) => {
    return createMutation.mutateAsync(data);
  };

  const updateMovie = (id: string, data: RouterInputs['movie']['update']['data']) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteMovie = (id: string) => {
    return deleteMutation.mutateAsync({ id });
  };

  return {
    // Data
    movies: moviesQuery.data?.movies ?? [],
    pagination: moviesQuery.data?.pagination,
    
    // States
    isLoading: moviesQuery.isLoading,
    error: moviesQuery.error,
    
    // Actions
    searchMovies,
    loadMore,
    createMovie,
    updateMovie,
    deleteMovie,
    
    // Mutation states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  };
}
```

## Production Tips

### 1. Error Handling
```typescript
// Global error handler
const TrpcErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-600">Error details</summary>
            <pre className="mt-2 text-xs text-red-700 overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### 2. Performance Optimization
```typescript
// Prefetch data
const prefetchMovie = (id: string) => {
  utils.movie.getById.prefetch({ id });
};

// Background refetch
useEffect(() => {
  const interval = setInterval(() => {
    utils.movie.getAll.refetch();
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}, []);
```

tRPC provides the ultimate developer experience with full type safety from database to UI! 🎯
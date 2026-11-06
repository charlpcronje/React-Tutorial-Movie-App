# 📝 TypeScript Basic Types & React Integration

## Primitive Types

TypeScript extends JavaScript with static type annotations:

```typescript
// Basic type annotations
const movieTitle: string = "The Matrix";
const releaseYear: number = 1999;
const isWatched: boolean = true;
const rating: number | null = null; // Union type
```

## Object Types & Interfaces

### Interface Definition
```typescript
/**
 * Movie interface - Defines the shape of a movie object
 * Used throughout the application for type safety
 */
interface Movie {
  readonly id: string;        // readonly prevents modification
  title: string;
  year: number;
  genre: string[];           // Array of strings
  rating?: number;           // Optional property
  director: {                // Nested object
    name: string;
    birthYear: number;
  };
}

// Usage example
const movie: Movie = {
  id: "matrix-1999",
  title: "The Matrix",
  year: 1999,
  genre: ["Action", "Sci-Fi"],
  director: {
    name: "The Wachowskis",
    birthYear: 1965
  }
  // rating is optional, so we can omit it
};
```

## React Component Typing

### Functional Component Props
```typescript
import React from 'react';

// Props interface with documentation
interface MovieCardProps {
  /** The movie data to display */
  movie: Movie;
  /** Callback when user clicks the movie card */
  onMovieSelect: (movieId: string) => void;
  /** Optional CSS class name */
  className?: string;
  /** Whether to show detailed information */
  showDetails?: boolean;
}

/**
 * MovieCard Component
 * Displays movie information in a card layout
 */
const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onMovieSelect,
  className = "",
  showDetails = false
}) => {
  // Event handler with proper typing
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    onMovieSelect(movie.id);
  };

  return (
    <div 
      className={`movie-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <h3>{movie.title}</h3>
      <p>{movie.year}</p>
      {showDetails && (
        <div>
          <p>Director: {movie.director.name}</p>
          <p>Genres: {movie.genre.join(', ')}</p>
          {movie.rating && <p>Rating: {movie.rating}/10</p>}
        </div>
      )}
    </div>
  );
};

export default MovieCard;
```

## State & Event Typing

### useState with TypeScript
```typescript
import { useState } from 'react';

// Type inference (TypeScript knows it's string)
const [searchQuery, setSearchQuery] = useState("");

// Explicit typing for complex types
const [movies, setMovies] = useState<Movie[]>([]);
const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

// Union types for multiple states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
const [loadingState, setLoadingState] = useState<LoadingState>('idle');
```

### Event Handlers
```typescript
// Form events
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Handle form submission
};

// Input events
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(event.target.value);
};

// Button clicks
const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log('Button clicked!');
};
```

## Array and Object Patterns

### Working with Arrays
```typescript
// Type-safe array operations
const movieTitles: string[] = movies.map(movie => movie.title);
const actionMovies: Movie[] = movies.filter(movie => 
  movie.genre.includes("Action")
);

// Array with specific length (Tuple)
type Coordinates = [number, number];
const position: Coordinates = [10, 20];
```

### Optional and Required Properties
```typescript
// Making properties optional or required
interface MovieFormData {
  title: string;           // Required
  year: number;            // Required
  genre?: string[];        // Optional
  description?: string;    // Optional
}

// Utility types for transformation
type RequiredMovieFormData = Required<MovieFormData>; // All properties required
type PartialMovieFormData = Partial<MovieFormData>;   // All properties optional
```

## Type Guards & Narrowing

```typescript
// Type guard function
function isValidMovie(movie: any): movie is Movie {
  return (
    typeof movie === 'object' &&
    typeof movie.id === 'string' &&
    typeof movie.title === 'string' &&
    typeof movie.year === 'number' &&
    Array.isArray(movie.genre)
  );
}

// Usage with type narrowing
function processMovieData(data: unknown) {
  if (isValidMovie(data)) {
    // TypeScript knows data is Movie here
    console.log(data.title); // Safe to access
  } else {
    console.error('Invalid movie data received');
  }
}
```

## Best Practices

1. **Start with Interfaces**: Define clear contracts for your data
2. **Use Union Types**: Express multiple possible values clearly
3. **Leverage Type Inference**: Don't over-annotate when TypeScript can infer
4. **Document with TSDoc**: Add comments for complex types
5. **Enable Strict Mode**: Use strict TypeScript settings for maximum safety

## Common Patterns in React

```typescript
// Children props
interface WrapperProps {
  children: React.ReactNode;
  className?: string;
}

// Ref forwarding
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));

// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

These basic types form the foundation of type-safe React development. Master these concepts to write more reliable, maintainable code! 🎯
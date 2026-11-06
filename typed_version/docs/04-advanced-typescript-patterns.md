# 🚀 Chapter 4: Advanced TypeScript Patterns

Now that you understand interfaces and basic types, let's explore the powerful advanced patterns that make TypeScript truly shine. These patterns enable sophisticated type safety and incredible developer experiences.

## 🎭 Union Types: "This OR That"

### **What Are Union Types?**
A **union type** represents a value that can be one of several types. Think of it as "this OR that" instead of "this AND that".

```typescript
// A movie rating can be a number OR the string "Not Rated"
type MovieRating = number | "Not Rated";

let rating1: MovieRating = 8.5;        // ✅ Valid - it's a number
let rating2: MovieRating = "Not Rated"; // ✅ Valid - it's the allowed string
let rating3: MovieRating = "Bad";       // ❌ Error - "Bad" is not in the union
```

### **Real-World Union Examples**
```typescript
// Movie status can only be these specific strings
type MovieStatus = "released" | "upcoming" | "in-production" | "cancelled";

// User ID can be a number or string (depending on system)
type UserID = number | string;

// API response can be data or error
type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Using union types
function displayMovieStatus(status: MovieStatus): string {
  switch (status) {
    case "released":
      return "🎬 Now in theaters!";
    case "upcoming":
      return "🔜 Coming soon!";
    case "in-production":
      return "🎥 Currently filming";
    case "cancelled":
      return "❌ Production cancelled";
  }
}
```

### **Type Narrowing with Union Types**
TypeScript helps you safely work with union types through **type narrowing**:

```typescript
function processUserID(id: UserID): string {
  // TypeScript doesn't know if id is number or string yet
  
  if (typeof id === "string") {
    // Inside this block, TypeScript knows id is string
    return id.toUpperCase();  // ✅ String methods work
  } else {
    // Inside this block, TypeScript knows id is number  
    return id.toString();     // ✅ Number methods work
  }
}

// Another example with API responses
function handleAPIResponse<T>(response: APIResponse<T>): T | null {
  if (response.success) {
    // TypeScript knows this is the success case
    return response.data;     // ✅ data property exists
  } else {
    // TypeScript knows this is the error case
    console.error(response.error);  // ✅ error property exists
    return null;
  }
}
```

## 🎯 Literal Types: Exact Values

### **String Literal Types**
Instead of accepting any string, you can specify exact string values:

```typescript
// Only these exact strings are allowed
type Theme = "light" | "dark" | "auto";
type MovieGenre = "Action" | "Comedy" | "Drama" | "Horror" | "Sci-Fi";
type SubscriptionTier = "free" | "premium" | "pro";

// Functions that use literal types
function setTheme(theme: Theme): void {
  document.body.className = `theme-${theme}`;
}

setTheme("light");    // ✅ Valid
setTheme("dark");     // ✅ Valid  
setTheme("blue");     // ❌ Error - "blue" is not in the union

function filterMoviesByGenre(movies: Movie[], genre: MovieGenre): Movie[] {
  return movies.filter(movie => movie.genres.includes(genre));
}

// TypeScript ensures you only use valid genres
filterMoviesByGenre(allMovies, "Action");     // ✅ Valid
filterMoviesByGenre(allMovies, "Romance");    // ❌ Error - not in MovieGenre union
```

### **Number Literal Types**
```typescript
// Only specific numbers allowed
type StarRating = 1 | 2 | 3 | 4 | 5;
type HTTPStatusCode = 200 | 201 | 400 | 401 | 404 | 500;

function rateMovie(rating: StarRating): void {
  console.log(`Rated: ${rating} stars`);
}

rateMovie(5);   // ✅ Valid
rateMovie(3);   // ✅ Valid
rateMovie(6);   // ❌ Error - 6 is not a valid star rating
```

### **Boolean Literal Types**
```typescript
// Exact boolean values (useful for flags)
type AdminUser = { isAdmin: true };    // Only true allowed
type GuestUser = { isAdmin: false };   // Only false allowed

type User = AdminUser | GuestUser;

function checkPermissions(user: User): string {
  if (user.isAdmin === true) {
    return "Full access granted";
  } else {
    return "Limited access";
  }
}
```

## 🔀 Discriminated Unions: Type-Safe State Management

**Discriminated unions** are unions where each type has a common property that helps TypeScript distinguish between them:

### **Basic Discriminated Union**
```typescript
// Each type has a 'type' property with a different literal value
type LoadingState = {
  type: "loading";
  message: string;
};

type SuccessState = {
  type: "success";  
  data: Movie[];
};

type ErrorState = {
  type: "error";
  error: string;
  retryCount: number;
};

// Union of all states
type AsyncState = LoadingState | SuccessState | ErrorState;

// TypeScript can distinguish between states using the 'type' property
function handleState(state: AsyncState): string {
  switch (state.type) {
    case "loading":
      // TypeScript knows this is LoadingState
      return `Loading: ${state.message}`;
      
    case "success":
      // TypeScript knows this is SuccessState  
      return `Loaded ${state.data.length} movies`;
      
    case "error":
      // TypeScript knows this is ErrorState
      return `Error: ${state.error} (attempt ${state.retryCount})`;
  }
}
```

### **Real-World Example: Movie Player State**
```typescript
type PausedState = {
  status: "paused";
  currentTime: number;
  totalDuration: number;
};

type PlayingState = {
  status: "playing";
  currentTime: number;
  totalDuration: number;
  playbackRate: number;
};

type BufferingState = {
  status: "buffering";
  currentTime: number;
  bufferPercentage: number;
};

type EndedState = {
  status: "ended";
  totalDuration: number;
  watchedPercentage: number;
};

type PlayerState = PausedState | PlayingState | BufferingState | EndedState;

function renderPlayerControls(state: PlayerState): string {
  switch (state.status) {
    case "paused":
      return `▶️ Play (${formatTime(state.currentTime)}/${formatTime(state.totalDuration)})`;
      
    case "playing":
      return `⏸️ Pause (${state.playbackRate}x speed)`;
      
    case "buffering":
      return `⏳ Buffering... ${state.bufferPercentage}%`;
      
    case "ended":
      return `🔄 Replay (watched ${state.watchedPercentage}%)`;
  }
}
```

## 🧬 Generic Types: Reusable Type Patterns

**Generics** let you create reusable type patterns. Think of them as "type variables" or "type parameters":

### **Basic Generics**
```typescript
// Generic function - T is a type parameter
function identity<T>(value: T): T {
  return value;
}

// TypeScript infers the type
let stringResult = identity("hello");    // T becomes string
let numberResult = identity(42);         // T becomes number
let movieResult = identity(someMovie);   // T becomes Movie

// You can also be explicit
let explicitResult = identity<string>("hello");
```

### **Generic Interfaces**
```typescript
// Generic interface for API responses
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Use with different data types
type MovieResponse = APIResponse<Movie>;
type UserResponse = APIResponse<User>;
type MoviesListResponse = APIResponse<Movie[]>;

// Generic interface for paginated data
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
}

// Use with any type
type PaginatedMovies = PaginatedResponse<Movie>;
type PaginatedUsers = PaginatedResponse<User>;
type PaginatedGenres = PaginatedResponse<Genre>;
```

### **Generic Constraints**
Sometimes you want to limit what types can be used with a generic:

```typescript
// Constraint: T must have an 'id' property
interface HasID {
  id: number;
}

function updateEntity<T extends HasID>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}

// Works with any object that has an id
updateEntity(movie, { title: "New Title" });     // ✅ Movie has id
updateEntity(user, { username: "newname" });     // ✅ User has id
updateEntity({ name: "test" }, { name: "new" }); // ❌ Error - no id property

// Advanced constraint example
interface Searchable {
  title: string;
  description: string;
}

function searchItems<T extends Searchable>(
  items: T[], 
  query: string
): T[] {
  return items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );
}

// Works with any object that has title and description
searchItems(movies, "action");    // ✅ Movies have title and description
searchItems(books, "mystery");    // ✅ Books have title and description
```

## 🗂️ Utility Types: TypeScript's Built-in Helpers

TypeScript provides many built-in utility types for common transformations:

### **Partial<T> - Make All Properties Optional**
```typescript
interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string;
}

// Partial makes all properties optional
type MovieUpdate = Partial<Movie>;
// Result: { id?: number; title?: string; year?: number; genre?: string; }

function updateMovie(id: number, updates: MovieUpdate): Movie {
  // Only update the properties that were provided
  const existingMovie = getMovieById(id);
  return { ...existingMovie, ...updates };
}

// Usage
updateMovie(1, { title: "New Title" });           // ✅ Only update title
updateMovie(2, { year: 2024, genre: "Action" });  // ✅ Update year and genre
updateMovie(3, {});                               // ✅ No updates
```

### **Required<T> - Make All Properties Required**
```typescript
interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

// Required makes all properties mandatory
type CompleteProfile = Required<UserProfile>;
// Result: { name: string; email: string; avatar: string; bio: string; }

function createCompleteProfile(profile: CompleteProfile): void {
  // All properties are guaranteed to exist
  console.log(`Name: ${profile.name}`);      // No undefined check needed
  console.log(`Email: ${profile.email}`);    // No undefined check needed
  console.log(`Avatar: ${profile.avatar}`);  // No undefined check needed
  console.log(`Bio: ${profile.bio}`);        // No undefined check needed
}
```

### **Pick<T, K> - Select Specific Properties**
```typescript
interface Movie {
  id: number;
  title: string;
  overview: string;
  year: number;
  rating: number;
  genre: string;
  director: string;
  cast: string[];
}

// Pick only specific properties
type MovieSummary = Pick<Movie, "id" | "title" | "year">;
// Result: { id: number; title: string; year: number; }

type MovieRatingInfo = Pick<Movie, "title" | "rating">;
// Result: { title: string; rating: number; }

function displayMovieSummary(movie: MovieSummary): string {
  return `${movie.title} (${movie.year}) - ID: ${movie.id}`;
}
```

### **Omit<T, K> - Exclude Specific Properties**
```typescript
// Omit specific properties
type MovieWithoutID = Omit<Movie, "id">;
// Result: All Movie properties except 'id'

type PublicMovieInfo = Omit<Movie, "id" | "cast">;
// Result: All Movie properties except 'id' and 'cast'

function createMovie(movieData: MovieWithoutID): Movie {
  // Generate ID and add it to the movie data
  return {
    id: generateID(),
    ...movieData
  };
}
```

### **Record<K, T> - Create Objects with Specific Key Types**
```typescript
// Create an object type with specific keys and value types
type MoviesByGenre = Record<string, Movie[]>;
// Result: { [key: string]: Movie[] }

type RatingsBySource = Record<"imdb" | "rottentomatoes" | "metacritic", number>;
// Result: { imdb: number; rottentomatoes: number; metacritic: number; }

let movieCollections: MoviesByGenre = {
  "action": [movie1, movie2],
  "comedy": [movie3, movie4],
  "drama": [movie5]
};

let movieRatings: RatingsBySource = {
  imdb: 8.5,
  rottentomatoes: 92,
  metacritic: 81
};
```

## 🔀 Conditional Types: Type Logic

Conditional types enable complex type logic based on conditions:

### **Basic Conditional Types**
```typescript
// Syntax: T extends U ? X : Y
// If T extends U, then X, else Y

type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>;    // true
type Test2 = IsArray<number>;      // false
type Test3 = IsArray<Movie[]>;     // true

// Practical example
type APIResult<T> = T extends string 
  ? { message: T } 
  : { data: T };

type StringResult = APIResult<string>;  // { message: string }
type MovieResult = APIResult<Movie>;    // { data: Movie }
```

### **Advanced Conditional Types**
```typescript
// Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type MovieElement = ArrayElement<Movie[]>;    // Movie
type StringElement = ArrayElement<string[]>;  // string
type NotArray = ArrayElement<number>;         // never

// Extract Promise value type
type PromiseValue<T> = T extends Promise<infer U> ? U : T;

type AsyncMovie = PromiseValue<Promise<Movie>>;  // Movie
type SyncMovie = PromiseValue<Movie>;           // Movie

// Conditional type for API responses
type ResponseData<T> = T extends { data: infer U } ? U : never;

type MovieData = ResponseData<{ success: true; data: Movie }>;  // Movie
type UserData = ResponseData<{ success: true; data: User }>;    // User
```

## 🗺️ Mapped Types: Transform Existing Types

Mapped types let you create new types by transforming properties of existing types:

### **Basic Mapped Types**
```typescript
// Make all properties optional
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Make all properties nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// Usage
type OptionalMovie = Optional<Movie>;    // All properties optional
type ReadonlyMovie = Readonly<Movie>;    // All properties readonly
type NullableMovie = Nullable<Movie>;    // All properties can be null
```

### **Advanced Mapped Types**
```typescript
// Transform property types
type Stringify<T> = {
  [K in keyof T]: string;
};

type MovieStrings = Stringify<Movie>;
// All properties become strings

// Conditional mapping
type NonNullable<T> = {
  [K in keyof T]: T[K] extends null | undefined ? never : T[K];
};

// Pick properties of specific types
type StringProperties<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type MovieStringProps = StringProperties<Movie>;  // "title" | "overview" | "genre" | "director"
```

## 🏷️ Template Literal Types: String Manipulation at Type Level

Template literal types enable sophisticated string type manipulation:

### **Basic Template Literals**
```typescript
// Combine string literals
type Greeting = "Hello";
type Target = "World";
type Message = `${Greeting} ${Target}`;  // "Hello World"

// CSS class names
type Size = "small" | "medium" | "large";
type Color = "red" | "blue" | "green";
type ButtonClass = `btn-${Size}-${Color}`;
// Result: "btn-small-red" | "btn-small-blue" | ... (9 combinations)

// API endpoints
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type APIEndpoint<T extends string> = `/${T}`;
type MovieEndpoints = APIEndpoint<`movies/${"popular" | "trending" | "search"}`>;
// Result: "/movies/popular" | "/movies/trending" | "/movies/search"
```

### **Advanced Template Literals**
```typescript
// Event names
type EventName<T extends string, U extends string> = `${T}:${U}`;
type MovieEvents = EventName<"movie", "play" | "pause" | "end">;
// Result: "movie:play" | "movie:pause" | "movie:end"

// CSS custom properties
type CSSVar<T extends string> = `--${T}`;
type ThemeColors = "primary" | "secondary" | "accent";
type ThemeVars = CSSVar<`color-${ThemeColors}`>;
// Result: "--color-primary" | "--color-secondary" | "--color-accent"

// Database table names (plural forms)
type Pluralize<T extends string> = `${T}s`;
type TableName<T extends string> = Pluralize<T>;

type UserTable = TableName<"user">;    // "users"  
type MovieTable = TableName<"movie">;  // "movies"
```

## 🎬 Real-World Example: Movie App State Management

Let's combine these advanced patterns in a real-world movie app state management system:

```typescript
// Discriminated union for different loading states
type AsyncState<T> = 
  | { status: "idle" }
  | { status: "loading"; startTime: number }
  | { status: "success"; data: T; loadTime: number }
  | { status: "error"; error: string; retryCount: number };

// Template literal types for action names
type ActionType<T extends string> = `${T}_REQUESTED` | `${T}_SUCCESS` | `${T}_FAILURE`;
type MovieActions = ActionType<"FETCH_MOVIES" | "SEARCH_MOVIES" | "LOAD_MOVIE">;

// Generic interface for state slices
interface StateSlice<T> {
  data: AsyncState<T>;
  lastUpdated?: number;
}

// Main application state
interface AppState {
  movies: StateSlice<Movie[]>;
  currentMovie: StateSlice<Movie>;
  user: StateSlice<User>;
  favorites: StateSlice<number[]>;  // Movie IDs
}

// Action creators with proper typing
interface Action<T extends string, P = undefined> {
  type: T;
  payload: P;
  timestamp: number;
}

// Specific action types
type FetchMoviesAction = Action<"FETCH_MOVIES_REQUESTED", { page: number }>;
type MovieSuccessAction = Action<"FETCH_MOVIES_SUCCESS", { movies: Movie[]; loadTime: number }>;
type MovieErrorAction = Action<"FETCH_MOVIES_FAILURE", { error: string }>;

// Union of all actions
type AppAction = FetchMoviesAction | MovieSuccessAction | MovieErrorAction;

// Type-safe reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "FETCH_MOVIES_REQUESTED":
      return {
        ...state,
        movies: {
          ...state.movies,
          data: { 
            status: "loading", 
            startTime: action.timestamp 
          }
        }
      };
      
    case "FETCH_MOVIES_SUCCESS":
      return {
        ...state,
        movies: {
          data: { 
            status: "success", 
            data: action.payload.movies,
            loadTime: action.payload.loadTime
          },
          lastUpdated: action.timestamp
        }
      };
      
    case "FETCH_MOVIES_FAILURE":
      return {
        ...state,
        movies: {
          ...state.movies,
          data: { 
            status: "error", 
            error: action.payload.error,
            retryCount: 0
          }
        }
      };
      
    default:
      return state;
  }
}
```

## 🎯 Key Takeaways

### **Advanced Pattern Benefits**
- **Union Types**: Handle multiple possible types safely
- **Literal Types**: Restrict values to exact options  
- **Discriminated Unions**: Type-safe state management
- **Generics**: Create reusable, flexible type patterns
- **Utility Types**: Transform types easily
- **Conditional Types**: Complex type logic
- **Mapped Types**: Transform existing types
- **Template Literals**: String manipulation at type level

### **When to Use Each Pattern**
- **Union Types**: When data can be one of several types
- **Generics**: When you need reusable type patterns  
- **Utility Types**: When transforming existing types
- **Conditional Types**: When type logic depends on conditions
- **Template Literals**: When building string types programmatically

## 🚀 What's Next?

You now understand TypeScript's most powerful features! Next, let's explore:

- **Chapter 5**: [React + TypeScript Integration](./05-react-typescript.md) - Apply these patterns to React
- **Chapter 6**: [API and RPC Communication](./06-api-rpc-communication.md) - Type-safe server communication
- **Chapter 7**: [Real-World Patterns](./07-real-world-patterns.md) - Production-ready TypeScript

These advanced patterns are what separate basic TypeScript usage from truly leveraging its power. Master them, and you'll write incredibly robust, maintainable code! 🎉

---

**Next Up:** [Chapter 5: React + TypeScript Integration](./05-react-typescript.md) - Learn how to apply these advanced patterns to React development.
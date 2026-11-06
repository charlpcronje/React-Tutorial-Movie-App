# 📝 Chapter 2: Basic Type Annotations

Now that you understand what types are, let's learn how to **write** them! This chapter covers the fundamental syntax for adding types to your JavaScript code.

## 🎯 What Are Type Annotations?

**Type annotations** are like **labels** you add to your code to tell TypeScript what type of data you expect:

```typescript
// The ": string" part is a type annotation
let movieTitle: string = "The Dark Knight";

// The ": number" parts are type annotations  
function calculateRating(votes: number, total: number): number {
  return votes / total;
}
```

Think of annotations as **sticky notes** you put on your variables and functions:

```
📦 Variable Box
🏷️ "Contains: string"
📝 "The Dark Knight"
```

## 🔤 Primitive Types

Let's start with the basic building blocks - **primitive types**:

### **String Type**
```typescript
// Text/words - anything in quotes
let movieTitle: string = "Inception";
let director: string = "Christopher Nolan";
let genre: string = 'Sci-Fi';  // Single quotes work too

// Template strings also work
let description: string = `${movieTitle} is directed by ${director}`;

// ❌ This would be an error:
let movieTitle: string = 42;  // Error: number is not assignable to string
```

**Real-world usage in our movie app:**
```typescript
interface Movie {
  title: string;        // Movie name
  overview: string;     // Plot description
  posterUrl: string;    // Image URL
}
```

### **Number Type**
```typescript
// Any numeric value - integers, decimals, negative
let releaseYear: number = 2010;
let rating: number = 8.7;
let boxOffice: number = 829_895_144;  // Underscores for readability
let temperature: number = -5.5;

// ❌ This would be an error:
let rating: number = "8.7";  // Error: string is not assignable to number
```

**Real-world usage:**
```typescript
interface Movie {
  id: number;           // Unique identifier
  releaseYear: number;  // When it was made
  voteAverage: number;  // Average rating (7.5)
  voteCount: number;    // How many people voted
  duration: number;     // Length in minutes
}
```

### **Boolean Type**
```typescript
// True or false only
let isWatched: boolean = true;
let isReleased: boolean = false;
let hasSubtitles: boolean = true;

// ❌ These would be errors:
let isGood: boolean = "yes";   // Error: string is not boolean
let isGood: boolean = 1;       // Error: number is not boolean
```

**Real-world usage:**
```typescript
interface Movie {
  isPopular: boolean;    // Is it trending?
  isReleased: boolean;   // Is it out yet?
  hasTrailer: boolean;   // Does it have a preview?
}
```

### **Understanding "Truthiness" vs Boolean**
This is a common source of confusion:

```javascript
// JavaScript - "truthy" values
if ("hello") { }      // ✅ Works - strings are "truthy"
if (42) { }           // ✅ Works - numbers are "truthy"
if ([]) { }           // ✅ Works - arrays are "truthy"

// TypeScript boolean type - ONLY true/false
let flag: boolean = "hello";  // ❌ Error: string is not boolean
let flag: boolean = 42;       // ❌ Error: number is not boolean
let flag: boolean = true;     // ✅ Correct: boolean is boolean
```

## 📋 Array Types

Arrays can be typed in two ways:

### **Method 1: Type[]**
```typescript
// Array of strings
let genres: string[] = ["Action", "Drama", "Comedy"];

// Array of numbers
let ratings: number[] = [8.5, 7.2, 9.1, 6.8];

// Array of booleans
let watchStatus: boolean[] = [true, false, true, false];
```

### **Method 2: Array<Type>**
```typescript
// Same thing, different syntax
let genres: Array<string> = ["Action", "Drama", "Comedy"];
let ratings: Array<number> = [8.5, 7.2, 9.1, 6.8];
let watchStatus: Array<boolean> = [true, false, true, false];
```

**Which should you use?** Most developers prefer `Type[]` because it's shorter and easier to read.

### **Real-world Array Examples**
```typescript
interface Movie {
  genres: string[];        // ["Action", "Sci-Fi"]
  cast: string[];          // ["Leonardo DiCaprio", "Marion Cotillard"]
  ratings: number[];       // [8.1, 8.5, 7.9]
  languages: string[];     // ["English", "Japanese", "French"]
}

// Working with typed arrays
function getHighRatings(ratings: number[]): number[] {
  return ratings.filter(rating => rating > 8.0);
}

function formatGenres(genres: string[]): string {
  return genres.join(" • ");  // "Action • Drama • Thriller"
}
```

### **Empty Arrays**
```typescript
// TypeScript needs to know what type will go in empty arrays
let movieTitles: string[] = [];        // Will contain strings
let ratings: number[] = [];            // Will contain numbers

// Add items later
movieTitles.push("Inception");         // ✅ Works
movieTitles.push(2010);                // ❌ Error: number is not string

ratings.push(8.7);                     // ✅ Works
ratings.push("great");                 // ❌ Error: string is not number
```

## 🎯 Object Types (Inline)

You can specify object shapes directly:

### **Simple Objects**
```typescript
// Inline object type
let movie: { title: string; year: number } = {
  title: "The Matrix",
  year: 1999
};

// Multi-line for readability
let movie: {
  title: string;
  year: number;
  rating: number;
} = {
  title: "The Matrix",
  year: 1999,
  rating: 8.7
};
```

### **Optional Properties**
Use `?` to make properties optional:

```typescript
let movie: {
  title: string;        // Required
  year: number;         // Required  
  rating?: number;      // Optional - might not exist
  director?: string;    // Optional - might not exist
} = {
  title: "Inception",
  year: 2010
  // rating and director are missing, but that's OK!
};

// You can add optional properties later
movie.rating = 8.8;
movie.director = "Christopher Nolan";
```

### **Nested Objects**
```typescript
let movie: {
  title: string;
  details: {
    director: string;
    budget: number;
    boxOffice: {
      domestic: number;
      international: number;
    };
  };
} = {
  title: "Avengers: Endgame",
  details: {
    director: "Russo Brothers",
    budget: 356_000_000,
    boxOffice: {
      domestic: 858_373_000,
      international: 1_939_427_564
    }
  }
};

// Access nested properties
console.log(movie.details.boxOffice.domestic);  // TypeScript knows this is a number
```

## 🎯 Function Types

Functions need types for **parameters** and **return values**:

### **Basic Function Typing**
```typescript
// Function with typed parameters and return type
function calculateRating(votes: number, totalVotes: number): number {
  return votes / totalVotes;
}

// Arrow function version
const calculateRating = (votes: number, totalVotes: number): number => {
  return votes / totalVotes;
};

// Shorter arrow function
const calculateRating = (votes: number, totalVotes: number): number => votes / totalVotes;
```

### **Void Return Type**
When a function doesn't return anything:

```typescript
// This function performs an action but doesn't return a value
function logMovieTitle(title: string): void {
  console.log(`Now playing: ${title}`);
  // No return statement needed
}

// ❌ This would be an error:
function logMovieTitle(title: string): void {
  return title;  // Error: void function cannot return a value
}
```

### **Optional Parameters**
Use `?` to make parameters optional:

```typescript
// Optional parameters must come after required ones
function createMovieUrl(title: string, year?: number): string {
  if (year) {
    return `/movies/${title}-${year}`;
  }
  return `/movies/${title}`;
}

// Both calls are valid
createMovieUrl("Inception");        // "/movies/Inception"
createMovieUrl("Inception", 2010);  // "/movies/Inception-2010"
```

### **Default Parameters**
```typescript
// Default values provide the type automatically
function rateMovie(title: string, rating = 5): void {
  // rating is automatically typed as 'number' because default is 5
  console.log(`You rated ${title}: ${rating}/10`);
}

// Explicit typing with default
function rateMovie(title: string, rating: number = 5): void {
  console.log(`You rated ${title}: ${rating}/10`);
}

rateMovie("The Dark Knight");      // Uses default: 5
rateMovie("The Dark Knight", 9);   // Uses provided: 9
```

### **Real-world Function Examples**
```typescript
// Movie app functions with proper typing

// Search for movies
function searchMovies(query: string, limit?: number): string[] {
  // Implementation would search and return movie titles
  return ["Inception", "Interstellar", "The Dark Knight"];
}

// Filter movies by genre
function filterByGenre(movies: string[], genre: string): string[] {
  // Implementation would filter the movies array
  return movies.filter(movie => movie.includes(genre));
}

// Calculate average rating
function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

// Add movie to favorites (no return value)
function addToFavorites(movieTitle: string): void {
  console.log(`Added ${movieTitle} to favorites`);
  // Would save to database or local storage
}
```

## 🔄 Type Inference

TypeScript is smart - it can often **figure out** types without you writing them:

### **Variable Inference**
```typescript
// TypeScript automatically knows these types
let movieTitle = "Inception";        // Inferred as string
let releaseYear = 2010;              // Inferred as number
let isGood = true;                   // Inferred as boolean
let genres = ["Sci-Fi", "Action"];   // Inferred as string[]

// You don't need to write:
let movieTitle: string = "Inception";        // Explicit (unnecessary)
let releaseYear: number = 2010;              // Explicit (unnecessary)
```

### **Function Return Inference**
```typescript
// TypeScript knows this returns a string
function getMovieTitle() {
  return "The Matrix";  // Returns string, so function returns string
}

// TypeScript knows this returns a number
function calculateTotal(price: number, tax: number) {
  return price + tax;   // Both numbers, so result is number
}
```

### **When to Use Explicit Types**
Sometimes you should be explicit even when TypeScript can infer:

```typescript
// ✅ Be explicit when the intent isn't obvious
let movieRating: number;        // Will be assigned later
let isLoading: boolean = true;  // Makes intent clear

// ✅ Be explicit with empty arrays
let movieTitles: string[] = [];     // Will contain strings
let ratings: number[] = [];         // Will contain numbers

// ✅ Be explicit with function returns for clarity
function searchMovies(query: string): string[] {  // Clear what this returns
  return ["Inception", "Interstellar"];
}
```

## 🎬 Movie App Examples

Let's see how these basic types work in our movie application:

### **Movie Data Structure**
```typescript
// Basic movie information with different types
let currentMovie = {
  title: "Inception",           // string
  year: 2010,                   // number
  rating: 8.8,                  // number
  isWatched: false,             // boolean
  genres: ["Sci-Fi", "Action"], // string[]
  cast: [                       // string[]
    "Leonardo DiCaprio",
    "Marion Cotillard", 
    "Tom Hardy"
  ]
};
```

### **Movie Functions**
```typescript
// Display movie information
function displayMovie(
  title: string, 
  year: number, 
  rating: number
): string {
  return `${title} (${year}) - Rating: ${rating}/10`;
}

// Add movie to watchlist
function addToWatchlist(title: string): void {
  console.log(`Added "${title}" to your watchlist`);
}

// Check if movie is recent
function isRecentMovie(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return (currentYear - year) <= 5;  // Released within 5 years
}

// Get movie recommendations
function getRecommendations(favoriteGenres: string[]): string[] {
  // Would use the genres to find similar movies
  return ["The Dark Knight", "Interstellar", "The Prestige"];
}

// Usage examples
console.log(displayMovie("Inception", 2010, 8.8));
// Output: "Inception (2010) - Rating: 8.8/10"

addToWatchlist("The Dark Knight");
// Output: Added "The Dark Knight" to your watchlist

console.log(isRecentMovie(2020));  // true
console.log(isRecentMovie(1990));  // false

const recommendations = getRecommendations(["Sci-Fi", "Action"]);
console.log(recommendations);  // ["The Dark Knight", "Interstellar", "The Prestige"]
```

## 🚨 Common Mistakes and How to Fix Them

### **Mistake 1: Mixing Types**
```typescript
// ❌ Wrong - mixing numbers and strings
let ratings: number[] = [8.5, 7.2, "excellent", 9.1];

// ✅ Correct - consistent types
let ratings: number[] = [8.5, 7.2, 8.8, 9.1];
let reviews: string[] = ["excellent", "good", "amazing", "perfect"];
```

### **Mistake 2: Forgetting Optional Properties**
```typescript
// ❌ Wrong - not all movies have ratings initially
let movie: { title: string; rating: number } = {
  title: "Unreleased Movie"
  // Error: missing 'rating'
};

// ✅ Correct - make rating optional
let movie: { title: string; rating?: number } = {
  title: "Unreleased Movie"
  // No error - rating is optional
};
```

### **Mistake 3: Wrong Function Return Type**
```typescript
// ❌ Wrong - function returns string, not number
function getMovieTitle(): number {
  return "The Matrix";  // Error: string is not number
}

// ✅ Correct - return type matches what you return
function getMovieTitle(): string {
  return "The Matrix";
}
```

### **Mistake 4: Null/Undefined Issues**
```typescript
// ❌ Wrong - might be null
function getFirstMovie(movies: string[]): string {
  return movies[0];  // What if array is empty?
}

// ✅ Better - handle null case
function getFirstMovie(movies: string[]): string | null {
  return movies.length > 0 ? movies[0] : null;
}

// ✅ Even better - provide default
function getFirstMovie(movies: string[], defaultMovie = "No movies"): string {
  return movies.length > 0 ? movies[0] : defaultMovie;
}
```

## 🧪 Practice Exercises

Try these exercises to practice basic type annotations:

### **Exercise 1: Movie Variables**
Create variables with proper types:
```typescript
// Create these variables with appropriate types:
// - A movie title
// - Release year
// - Whether you've watched it
// - List of genres
// - Rating out of 10

// Your solution here:
let title: string = "Your Movie Here";
let year: number = 2023;
let watched: boolean = false;
let genres: string[] = ["Action", "Drama"];
let rating: number = 8.5;
```

### **Exercise 2: Movie Functions**
Write functions with proper typing:
```typescript
// Write a function that takes a movie title and year,
// returns a formatted string like "Movie (Year)"
function formatMovie(title: string, year: number): string {
  return `${title} (${year})`;
}

// Write a function that takes an array of ratings
// and returns the highest rating
function getHighestRating(ratings: number[]): number {
  return Math.max(...ratings);
}

// Write a function that adds a genre to a movie's genre list
function addGenre(genres: string[], newGenre: string): void {
  genres.push(newGenre);
}
```

## 🎯 Key Takeaways

### **Type Annotation Syntax**
- **Variables**: `let name: type = value`
- **Functions**: `function name(param: type): returnType`
- **Arrays**: `type[]` or `Array<type>`
- **Objects**: `{ property: type; property2: type }`
- **Optional**: Add `?` before the colon: `property?: type`

### **When to Use Type Annotations**
- ✅ **Always** for function parameters
- ✅ **Usually** for function return types (for clarity)
- ✅ **Sometimes** for variables (when inference isn't clear)
- ✅ **Always** for empty arrays that will be filled later

### **Benefits You Get**
- **Catch errors** as you type
- **Better autocomplete** in your editor
- **Clear intentions** for other developers
- **Safer refactoring** when you change code

## 🚀 What's Next?

Now that you know basic type annotations, you're ready for more advanced concepts:

- **Chapter 3**: [Interfaces and Object Types](./03-interfaces-and-objects.md) - Learn to define complex object shapes
- **Chapter 4**: [Union Types and Literals](./04-union-types.md) - Handle multiple possible types
- **Chapter 5**: [Functions and Methods](./05-functions-and-methods.md) - Advanced function typing patterns

Great job learning the fundamentals! These basic annotations are the foundation for everything else in TypeScript. 🎉

---

**Next Up:** [Chapter 3: Interfaces and Object Types](./03-interfaces-and-objects.md) - Learn how to define reusable type contracts for complex objects.
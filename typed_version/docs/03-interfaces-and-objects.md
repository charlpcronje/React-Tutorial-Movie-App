# 🏗️ Chapter 3: Interfaces and Object Types

You've learned basic types like `string` and `number`. Now let's learn about **interfaces** - TypeScript's powerful way to define the shape of complex objects. Think of interfaces as **blueprints** or **contracts** that describe exactly what an object should look like.

## 🤔 What Are Interfaces?

### **Real-World Analogy**
Imagine you're designing a **movie theater ticket**. Every ticket needs certain information:

```
🎫 MOVIE TICKET BLUEPRINT
┌─────────────────────────┐
│ Movie Title: ___________│  ← Must have a title (text)
│ Theater: _______________│  ← Must have a theater (text)  
│ Seat: __________________│  ← Must have a seat (text)
│ Price: _________________│  ← Must have a price (number)
│ Date: __________________│  ← Must have a date
└─────────────────────────┘
```

An **interface** is like this blueprint - it defines what properties an object must have and what types those properties should be.

### **Interface in Code**
```typescript
// Define the blueprint
interface MovieTicket {
  movieTitle: string;
  theater: string;
  seat: string;
  price: number;
  showtime: string;
}

// Create objects that follow the blueprint
let myTicket: MovieTicket = {
  movieTitle: "The Dark Knight",
  theater: "AMC Theater 12",
  seat: "A15",
  price: 12.50,
  showtime: "7:30 PM"
};

// ❌ This would be an error - missing required properties
let badTicket: MovieTicket = {
  movieTitle: "Inception"
  // Error: Missing theater, seat, price, and showtime
};
```

## 🎬 Movie App Interface Examples

Let's create interfaces for our movie app:

### **Basic Movie Interface**
```typescript
interface Movie {
  id: number;           // Unique identifier
  title: string;        // Movie name
  overview: string;     // Plot description
  releaseYear: number;  // When it was released
  rating: number;       // Average rating (0-10)
  genres: string[];     // List of genres
}

// Using the interface
let favoriteMovie: Movie = {
  id: 1,
  title: "Inception",
  overview: "A thief who steals corporate secrets through dream-sharing technology...",
  releaseYear: 2010,
  rating: 8.8,
  genres: ["Action", "Sci-Fi", "Thriller"]
};
```

### **Genre Interface**
```typescript
interface Genre {
  id: number;
  name: string;
  description?: string;  // Optional - notice the ?
}

// Update Movie to use Genre interface
interface Movie {
  id: number;
  title: string;
  overview: string;
  releaseYear: number;
  rating: number;
  genres: Genre[];      // Array of Genre objects instead of strings
}

// Using the updated interface
let movie: Movie = {
  id: 1,
  title: "The Dark Knight",
  overview: "Batman faces the Joker...",
  releaseYear: 2008,
  rating: 9.0,
  genres: [
    { id: 1, name: "Action" },
    { id: 2, name: "Crime", description: "Crime thriller" },
    { id: 3, name: "Drama" }
  ]
};
```

## 🔧 Optional Properties

Sometimes objects might not have all properties. Use `?` to make properties optional:

### **Optional vs Required**
```typescript
interface UserProfile {
  id: number;           // Required - must always exist
  username: string;     // Required - must always exist
  email: string;        // Required - must always exist
  firstName?: string;   // Optional - might not exist
  lastName?: string;    // Optional - might not exist
  avatar?: string;      // Optional - might not exist
  bio?: string;         // Optional - might not exist
}

// All of these are valid:
let user1: UserProfile = {
  id: 1,
  username: "moviefan",
  email: "fan@movies.com"
  // No optional properties - that's OK!
};

let user2: UserProfile = {
  id: 2,
  username: "cinephile",
  email: "love@cinema.com",
  firstName: "Jane",
  lastName: "Doe",
  avatar: "/avatars/jane.jpg"
  // Missing bio - that's OK, it's optional!
};
```

### **Checking Optional Properties**
When using optional properties, you need to check if they exist:

```typescript
function displayUser(user: UserProfile): string {
  let display = user.username;
  
  // Check if optional properties exist before using them
  if (user.firstName && user.lastName) {
    display = `${user.firstName} ${user.lastName} (${user.username})`;
  } else if (user.firstName) {
    display = `${user.firstName} (${user.username})`;
  }
  
  return display;
}

// Usage
console.log(displayUser(user1));  // "moviefan"
console.log(displayUser(user2));  // "Jane Doe (cinephile)"
```

## 🔗 Extending Interfaces

Interfaces can **extend** other interfaces - like building on top of a blueprint:

### **Basic Extension**
```typescript
// Base interface
interface BasicMovie {
  id: number;
  title: string;
  releaseYear: number;
}

// Extended interface - includes everything from BasicMovie PLUS more
interface DetailedMovie extends BasicMovie {
  overview: string;
  rating: number;
  genres: Genre[];
  director: string;
  cast: string[];
}

// DetailedMovie now has ALL these properties:
// - id (from BasicMovie)
// - title (from BasicMovie)  
// - releaseYear (from BasicMovie)
// - overview (new)
// - rating (new)
// - genres (new)
// - director (new)
// - cast (new)

let movie: DetailedMovie = {
  // Required from BasicMovie
  id: 1,
  title: "Interstellar",
  releaseYear: 2014,
  
  // Required from DetailedMovie extension
  overview: "A team of explorers travel through a wormhole in space...",
  rating: 8.6,
  genres: [{ id: 1, name: "Sci-Fi" }, { id: 2, name: "Drama" }],
  director: "Christopher Nolan",
  cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
};
```

### **Multiple Extensions**
```typescript
// Timestamp interface - common properties for many objects
interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// User activity interface
interface UserActivity {
  userId: number;
  action: string;
}

// Movie with timestamps and user activity
interface MovieWithMetadata extends BasicMovie, Timestamps, UserActivity {
  // This interface now has:
  // - All BasicMovie properties (id, title, releaseYear)
  // - All Timestamps properties (createdAt, updatedAt)  
  // - All UserActivity properties (userId, action)
  // - Plus any new properties we add here
  
  viewCount: number;
  lastWatched?: string;
}

let movieData: MovieWithMetadata = {
  // From BasicMovie
  id: 1,
  title: "The Matrix",
  releaseYear: 1999,
  
  // From Timestamps
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-15T14:30:00Z",
  
  // From UserActivity
  userId: 123,
  action: "watched",
  
  // New properties
  viewCount: 1250000,
  lastWatched: "2024-01-15T20:15:00Z"
};
```

## 🔄 Interface vs Type Aliases

You might wonder: "Should I use `interface` or `type`?" Here's when to use each:

### **Use Interface When:**
- Defining **object shapes**
- You might want to **extend** later
- You want **declaration merging** (advanced feature)

```typescript
// ✅ Good use of interface
interface Movie {
  id: number;
  title: string;
}

// ✅ Can extend interfaces
interface ActionMovie extends Movie {
  explosions: number;
}
```

### **Use Type When:**
- Creating **unions** ("this OR that")
- Working with **primitives** or **computed types**
- Creating **aliases** for complex types

```typescript
// ✅ Good use of type
type MovieStatus = "released" | "upcoming" | "in-production";
type ID = string | number;
type EventHandler = (event: MouseEvent) => void;
```

### **Side-by-Side Comparison**
```typescript
// Both can define object shapes
interface MovieInterface {
  title: string;
  year: number;
}

type MovieType = {
  title: string;
  year: number;
};

// Both work the same for basic objects
let movie1: MovieInterface = { title: "Inception", year: 2010 };
let movie2: MovieType = { title: "Inception", year: 2010 };

// But interfaces can be extended more easily
interface ExtendedMovie extends MovieInterface {
  rating: number;
}

// Type extension is more verbose
type ExtendedMovieType = MovieType & {
  rating: number;
};
```

**Recommendation:** Use `interface` for object shapes, `type` for everything else.

## 📦 Nested Interfaces

Real-world objects often contain other objects. Interfaces handle this beautifully:

### **Simple Nesting**
```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Theater {
  id: number;
  name: string;
  address: Address;  // Nested interface
  screenCount: number;
}

let theater: Theater = {
  id: 1,
  name: "AMC Metreon 16",
  address: {
    street: "135 4th St",
    city: "San Francisco", 
    state: "CA",
    zipCode: "94103"
  },
  screenCount: 16
};

// Access nested properties
console.log(theater.address.city);  // "San Francisco"
```

### **Complex Nesting**
```typescript
interface CastMember {
  id: number;
  name: string;
  character: string;
  profileImage?: string;
}

interface Director {
  id: number;
  name: string;
  biography?: string;
  previousMovies?: string[];
}

interface ProductionCompany {
  id: number;
  name: string;
  country: string;
  foundedYear: number;
}

interface CompleteMovie {
  // Basic info
  id: number;
  title: string;
  overview: string;
  releaseYear: number;
  
  // Nested objects
  director: Director;
  cast: CastMember[];              // Array of nested objects
  productionCompanies: ProductionCompany[];
  
  // Nested object with more nesting
  ratings: {
    imdb: number;
    rottenTomatoes: number;
    metacritic: number;
    audience: {
      score: number;
      reviewCount: number;
      demographics: {
        under18: number;
        age18to34: number;
        age35to54: number;
        over54: number;
      };
    };
  };
}

// Using the complex nested interface
let blockbuster: CompleteMovie = {
  id: 1,
  title: "Avengers: Endgame",
  overview: "The Avengers assemble one final time...",
  releaseYear: 2019,
  
  director: {
    id: 1,
    name: "Anthony & Joe Russo",
    biography: "American film directors...",
    previousMovies: ["Avengers: Infinity War", "Captain America: Civil War"]
  },
  
  cast: [
    {
      id: 1,
      name: "Robert Downey Jr.",
      character: "Tony Stark / Iron Man",
      profileImage: "/profiles/rdj.jpg"
    },
    {
      id: 2, 
      name: "Chris Evans",
      character: "Steve Rogers / Captain America"
    }
  ],
  
  productionCompanies: [
    {
      id: 1,
      name: "Marvel Studios",
      country: "USA",
      foundedYear: 1993
    }
  ],
  
  ratings: {
    imdb: 8.4,
    rottenTomatoes: 94,
    metacritic: 78,
    audience: {
      score: 8.7,
      reviewCount: 50000,
      demographics: {
        under18: 15,
        age18to34: 45,
        age35to54: 30,
        over54: 10
      }
    }
  }
};

// Access deeply nested properties
console.log(blockbuster.director.name);  // "Anthony & Joe Russo"
console.log(blockbuster.cast[0].character);  // "Tony Stark / Iron Man"
console.log(blockbuster.ratings.audience.demographics.age18to34);  // 45
```

## 🔀 Index Signatures

Sometimes you don't know all the property names in advance:

### **Basic Index Signature**
```typescript
// When property names are dynamic but values have consistent type
interface MovieRatings {
  [source: string]: number;  // Any string key maps to a number value
}

let ratings: MovieRatings = {
  "imdb": 8.5,
  "rottenTomatoes": 92,
  "metacritic": 81,
  "rogerebert": 4,        // 4 out of 4 stars
  "variety": 8.2,
  // Can add any string key with number value
};

// Access ratings dynamically
function getRating(ratings: MovieRatings, source: string): number | undefined {
  return ratings[source];  // TypeScript knows this returns number | undefined
}

console.log(getRating(ratings, "imdb"));        // 8.5
console.log(getRating(ratings, "unknown"));     // undefined
```

### **Mixed Properties with Index Signature**
```typescript
interface FlexibleMovie {
  // Required properties
  id: number;
  title: string;
  
  // Optional properties
  year?: number;
  
  // Index signature for additional properties
  [key: string]: any;  // Any additional string keys
}

let movie: FlexibleMovie = {
  // Required
  id: 1,
  title: "Inception",
  
  // Optional
  year: 2010,
  
  // Additional properties via index signature
  director: "Christopher Nolan",
  budget: 160000000,
  awards: ["Oscar", "BAFTA"],
  isAvailableOnNetflix: true,
  customMetadata: {
    internalRating: "A+",
    notes: "Mind-bending masterpiece"
  }
};
```

**Note:** Use index signatures sparingly. Explicit properties are usually better for type safety.

## 🏭 Real-World Movie App Interfaces

Let's design interfaces for a complete movie application:

### **User System**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
  preferences: UserPreferences;
  activity: UserActivity;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
}

interface UserPreferences {
  favoriteGenres: Genre[];
  preferredLanguage: string;
  autoplayTrailers: boolean;
  emailNotifications: boolean;
  theme: "light" | "dark" | "auto";  // Union type!
}

interface UserActivity {
  watchedMovies: WatchedMovie[];
  favorites: Movie[];
  ratings: UserRating[];
  reviews: UserReview[];
}
```

### **Movie System**
```typescript
interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  tagline?: string;
  
  // Release info
  releaseDate: string;
  status: "released" | "upcoming" | "in-production";
  
  // Media
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  
  // Classification
  genres: Genre[];
  spokenLanguages: Language[];
  originCountry: string;
  adult: boolean;
  
  // Ratings & Stats
  voteAverage: number;
  voteCount: number;
  popularity: number;
  
  // Production
  budget?: number;
  revenue?: number;
  runtime?: number;  // in minutes
  
  // People
  director?: Person;
  cast: CastMember[];
  crew: CrewMember[];
  
  // Additional data
  keywords: string[];
  productionCompanies: ProductionCompany[];
}

interface WatchedMovie {
  movie: Movie;
  watchedDate: string;
  completedPercentage: number;  // 0-100
  deviceType: "mobile" | "tablet" | "desktop" | "tv";
}

interface UserRating {
  movieId: number;
  rating: number;  // 1-10
  ratedDate: string;
}

interface UserReview {
  id: number;
  movieId: number;
  userId: number;
  title: string;
  content: string;
  rating: number;
  createdDate: string;
  updatedDate?: string;
  likes: number;
  helpful: number;  // "helpful" votes
}
```

### **System Interfaces**
```typescript
interface Language {
  code: string;  // "en", "es", "fr"
  name: string;  // "English", "Spanish", "French"
}

interface Person {
  id: number;
  name: string;
  profileImage?: string;
  biography?: string;
  birthDate?: string;
  birthPlace?: string;
}

interface CastMember extends Person {
  character: string;
  order: number;  // Billing order
}

interface CrewMember extends Person {
  job: string;        // "Director", "Producer", "Writer"
  department: string; // "Directing", "Production", "Writing"
}

interface ProductionCompany {
  id: number;
  name: string;
  logoUrl?: string;
  originCountry: string;
}
```

## 🧪 Practice Exercises

### **Exercise 1: Design a Streaming Service**
Create interfaces for a Netflix-like streaming service:

```typescript
// Design interfaces for:
// 1. A streaming service (Netflix, Hulu, etc.)
// 2. A subscription plan (Basic, Premium, etc.)  
// 3. A viewing session (what's currently playing)
// 4. A watchlist

interface StreamingService {
  // Your code here
}

interface SubscriptionPlan {
  // Your code here  
}

interface ViewingSession {
  // Your code here
}

interface Watchlist {
  // Your code here
}
```

### **Exercise 2: Movie Theater System**
Design interfaces for a movie theater booking system:

```typescript
// Design interfaces for:
// 1. A movie theater
// 2. A screening room
// 3. A showtime
// 4. A ticket booking

interface MovieTheater {
  // Your code here
}

interface ScreeningRoom {
  // Your code here
}

interface Showtime {
  // Your code here
}

interface TicketBooking {
  // Your code here
}
```

## 🎯 Key Takeaways

### **Interface Syntax**
```typescript
interface InterfaceName {
  propertyName: type;
  optionalProperty?: type;
  readonly constantProperty: type;
  [indexSignature: string]: type;
}
```

### **When to Use Interfaces**
- ✅ **Object shapes** - Defining what properties objects should have
- ✅ **Contracts** - Ensuring objects meet certain requirements
- ✅ **Extension** - Building on existing interfaces
- ✅ **Documentation** - Making code self-documenting

### **Interface Benefits**
- 🛡️ **Type Safety** - Catch errors at compile time
- 📚 **Documentation** - Interfaces describe your data structures
- 🔧 **IntelliSense** - Better autocomplete and error detection
- 🔄 **Refactoring** - Safe to rename properties across entire codebase

### **Best Practices**
- Use **descriptive names** (`MovieDetails` not `MovieData`)
- Make properties **optional** when appropriate (use `?`)
- **Extend interfaces** rather than duplicating properties
- **Group related interfaces** together
- **Document complex interfaces** with comments

## 🚀 What's Next?

Now that you understand interfaces, you're ready to explore:

- **Chapter 4**: [Union Types and Literals](./04-union-types.md) - Handle multiple possible types
- **Chapter 5**: [Functions and Methods](./05-functions-and-methods.md) - Advanced function typing
- **Chapter 6**: [Generic Types](./06-generic-types.md) - Reusable type patterns

Interfaces are the backbone of TypeScript's type system. Master them, and you'll write much more reliable and maintainable code! 🎉

---

**Next Up:** [Chapter 4: Union Types and Literals](./04-union-types.md) - Learn how to handle situations where data can be one of several types.
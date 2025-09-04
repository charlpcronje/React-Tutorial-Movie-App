// src/db/schema.js
// Database schema definitions using Drizzle ORM
// This file defines the structure of our database tables

// Import Drizzle ORM SQLite functions for defining schemas
const { sqliteTable, text, integer, real } = require("drizzle-orm/sqlite-core");
const { sql } = require("drizzle-orm");

/**
 * MOVIES TABLE
 * Stores movie information from external API (TMDB)
 * This table caches movie data to reduce API calls and improve performance
 */
const movies = sqliteTable("movies", {
  // Primary key - unique identifier for each movie
  id: integer("id").primaryKey(),
  
  // External API ID (from TMDB) - allows us to sync with external data
  external_id: integer("external_id").notNull().unique(),
  
  // Basic movie information
  title: text("title").notNull(), // Movie title (required)
  overview: text("overview"), // Movie description/plot summary
  release_date: text("release_date"), // Release date (stored as text in YYYY-MM-DD format)
  
  // Visual assets
  poster_path: text("poster_path"), // URL/path to movie poster image
  backdrop_path: text("backdrop_path"), // URL/path to backdrop image
  
  // Ratings and popularity
  vote_average: real("vote_average").default(0), // Average rating from external source
  vote_count: integer("vote_count").default(0), // Number of votes from external source
  popularity: real("popularity").default(0), // Popularity score from external source
  
  // Additional metadata
  adult: integer("adult", { mode: "boolean" }).default(false), // Adult content flag
  original_language: text("original_language"), // Original language code (e.g., 'en', 'es')
  genre_ids: text("genre_ids"), // JSON string of genre IDs (stored as text for simplicity)
  
  // Timestamps for tracking when data was created/updated
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * USERS TABLE
 * Stores user information for our application
 * Simplified user system for educational purposes
 */
const users = sqliteTable("users", {
  // Primary key - auto-incrementing user ID
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // User identification
  username: text("username").notNull().unique(), // Unique username
  email: text("email").notNull().unique(), // Unique email address
  
  // User preferences
  display_name: text("display_name"), // Optional display name
  avatar_url: text("avatar_url"), // URL to user's avatar image
  
  // Account metadata
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * USER_RATINGS TABLE
 * Stores user ratings for movies
 * Junction table linking users to movies with their ratings
 */
const userRatings = sqliteTable("user_ratings", {
  // Primary key
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Foreign keys
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Delete ratings when user is deleted
  
  movie_id: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }), // Delete ratings when movie is deleted
  
  // Rating data
  rating: integer("rating").notNull(), // User's rating (1-5 stars)
  
  // Timestamps
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * USER_COMMENTS TABLE
 * Stores user comments/reviews for movies
 */
const userComments = sqliteTable("user_comments", {
  // Primary key
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Foreign keys
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  movie_id: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  
  // Comment data
  comment: text("comment").notNull(), // The actual comment text
  
  // Timestamps
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * USER_FAVORITES TABLE
 * Stores user's favorite movies
 * Junction table for many-to-many relationship between users and movies
 */
const userFavorites = sqliteTable("user_favorites", {
  // Primary key
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Foreign keys
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  movie_id: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  
  // Timestamps
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Export all table definitions for use in other parts of the application
module.exports = {
  movies,
  users,
  userRatings,
  userComments,
  userFavorites,
};

/**
 * EDUCATIONAL NOTES:
 * 
 * 1. FOREIGN KEYS:
 *    - user_id and movie_id are foreign keys that reference other tables
 *    - onDelete: "cascade" means when a user/movie is deleted, related records are also deleted
 *    - This maintains referential integrity in our database
 * 
 * 2. DATA TYPES:
 *    - integer(): For whole numbers (IDs, ratings, counts)
 *    - text(): For strings (names, descriptions, URLs)
 *    - real(): For decimal numbers (ratings, popularity scores)
 *    - All types can have modifiers like .notNull(), .unique(), .default()
 * 
 * 3. TIMESTAMPS:
 *    - CURRENT_TIMESTAMP automatically sets the current date/time
 *    - created_at: Never changes after record creation
 *    - updated_at: Should be updated whenever the record is modified
 * 
 * 4. PRIMARY KEYS:
 *    - Every table should have a primary key for unique identification
 *    - autoIncrement: true creates auto-incrementing integer IDs
 * 
 * 5. JUNCTION TABLES:
 *    - user_ratings, user_comments, user_favorites are junction tables
 *    - They connect users to movies with additional data
 *    - This creates many-to-many relationships (one user can rate many movies, one movie can be rated by many users)
 */
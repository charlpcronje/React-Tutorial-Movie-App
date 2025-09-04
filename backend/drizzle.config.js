// drizzle.config.js
// Configuration file for Drizzle ORM - defines how database migrations and introspection work

// Import the defineConfig function from drizzle-kit for type-safe configuration
const { defineConfig } = require("drizzle-kit");

// Export the Drizzle configuration object
module.exports = defineConfig({
  // Database schema configuration
  schema: "./src/db/schema.js", // Path to our database schema definitions
  
  // Migration output directory
  out: "./src/db/migrations", // Where generated SQL migrations will be stored
  
  // Database driver configuration
  dialect: "sqlite", // We're using SQLite as our database
  
  // Database connection
  dbCredentials: {
    url: "./database.db", // Path to our SQLite database file
  },
  
  // Additional options for better development experience
  verbose: true, // Show detailed logs during migration generation
  strict: true,  // Enable strict mode for safer migrations
});
// src/db/index.js
// Database connection and configuration
// This file sets up the database connection using Drizzle ORM and better-sqlite3

// Import required dependencies
const Database = require("better-sqlite3"); // SQLite database driver
const { drizzle } = require("drizzle-orm/better-sqlite3"); // Drizzle ORM adapter for better-sqlite3
const path = require("path"); // Node.js path utilities
const fs = require("fs"); // File system operations

// Import our database schema
const schema = require("./schema");

/**
 * DATABASE CONNECTION SETUP
 * 
 * Educational Notes:
 * - better-sqlite3 is a fast, synchronous SQLite3 binding for Node.js
 * - Unlike some other database drivers, better-sqlite3 operations are synchronous
 * - This makes it perfect for learning and prototyping
 */

// Resolve the database file path relative to the project root
const dbPath = path.resolve(__dirname, "../../database.db");

// Ensure the directory exists (create it if it doesn't)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

/**
 * Create SQLite database instance
 * 
 * Options explained:
 * - verbose: When set to a function, it logs all SQL statements (great for learning!)
 * - fileMustExist: false allows creating the database file if it doesn't exist
 */
const sqlite = new Database(dbPath, {
  verbose: process.env.NODE_ENV === "development" ? console.log : undefined, // Log SQL in development
  fileMustExist: false, // Create file if it doesn't exist
});

// Enable foreign key constraints (important for data integrity)
// SQLite doesn't enable foreign keys by default, but we want them for referential integrity
sqlite.pragma("foreign_keys = ON");

/**
 * Create Drizzle ORM instance
 * 
 * Educational Notes:
 * - drizzle() creates an ORM instance that provides a JavaScript API for database operations
 * - The schema parameter gives Drizzle knowledge of our table structure
 * - This enables type checking and auto-completion in IDEs (even without TypeScript)
 */
const db = drizzle(sqlite, { schema });

/**
 * Database utility functions
 * These functions provide common database operations that we'll use throughout the app
 */

/**
 * Initialize database tables
 * This function should be called when the application starts
 */
function initializeDatabase() {
  try {
    console.log("📊 Initializing database...");
    
    // In a real application, you would run migrations here
    // For educational purposes, we'll create tables manually if needed
    
    // Check if tables exist by trying to select from them
    try {
      db.select().from(schema.movies).limit(1).all();
      console.log("✅ Database tables already exist");
    } catch (error) {
      if (error.message.includes("no such table")) {
        console.log("📝 Creating database tables...");
        // In production, you would use migrations instead of manual table creation
        // This is just for educational demonstration
        throw new Error("Please run database migrations: npm run db:generate && npm run db:migrate");
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
}

/**
 * Close database connection
 * Should be called when the application shuts down
 */
function closeDatabase() {
  try {
    sqlite.close();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error.message);
  }
}

/**
 * Database health check
 * Useful for API health endpoints
 */
function checkDatabaseHealth() {
  try {
    // Simple query to check if database is responsive
    const result = sqlite.prepare("SELECT 1 as health").get();
    return result.health === 1;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
}

// Export the database instance and utility functions
module.exports = {
  db,           // Main database instance for queries
  sqlite,       // Raw SQLite instance (for advanced operations)
  schema,       // Database schema (for reference)
  
  // Utility functions
  initializeDatabase,
  closeDatabase,
  checkDatabaseHealth,
};

/**
 * EDUCATIONAL NOTES:
 * 
 * 1. SYNCHRONOUS VS ASYNCHRONOUS:
 *    - better-sqlite3 uses synchronous operations
 *    - This is different from most Node.js database drivers
 *    - No need for await/promises with basic operations
 *    - Makes code simpler to understand for beginners
 * 
 * 2. PRAGMAS:
 *    - SQLite pragmas are special commands that control database behavior
 *    - "foreign_keys = ON" enables foreign key constraint checking
 *    - Other useful pragmas include journal_mode, synchronous, etc.
 * 
 * 3. ERROR HANDLING:
 *    - Always wrap database operations in try-catch blocks
 *    - Provide meaningful error messages for debugging
 *    - Log errors appropriately for different environments
 * 
 * 4. CONNECTION MANAGEMENT:
 *    - SQLite is embedded, so there's only one connection per database file
 *    - Still good practice to close connections on app shutdown
 *    - Prevents file locks and ensures data is flushed
 * 
 * 5. DEVELOPMENT VS PRODUCTION:
 *    - Verbose logging is helpful during development
 *    - Should be disabled in production for performance
 *    - Use environment variables to control behavior
 */
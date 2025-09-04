// src/index.js
// Main server entry point for our Hono-based movie app backend
// This file sets up the HTTP server, middleware, and routes

// Load environment variables first (before other imports)
require("dotenv").config();

// Import required dependencies
const { Hono } = require("hono"); // Fast web framework
const { serve } = require("@hono/node-server"); // Node.js adapter for Hono
const { cors } = require("hono/cors"); // CORS middleware
const { logger } = require("hono/logger"); // Logging middleware

// Import our database setup
const { db, sqlite, initializeDatabase, closeDatabase } = require("./db");

// Import route handlers (we'll create these next)
// const moviesRoutes = require("./routes/movies");
// const usersRoutes = require("./routes/users");

/**
 * CREATE HONO APP INSTANCE
 * 
 * Educational Notes:
 * - Hono is a fast, lightweight web framework inspired by Express.js
 * - It's built for modern JavaScript environments and supports TypeScript
 * - Much faster than Express while maintaining similar API patterns
 */
const app = new Hono();

/**
 * GLOBAL MIDDLEWARE SETUP
 * 
 * Middleware functions run before route handlers and can:
 * - Modify request/response objects
 * - Perform authentication/authorization
 * - Log requests
 * - Handle CORS
 * - Parse request bodies
 */

// Logging middleware - logs all HTTP requests
// This helps with debugging and monitoring
app.use("*", logger());

// CORS (Cross-Origin Resource Sharing) middleware
// Allows our frontend (different port) to make requests to this backend
app.use("*", cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    "http://localhost:3000", // Alternative React dev server port
  ],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authorization headers
}));

/**
 * BASIC ROUTES
 * 
 * These are simple routes for testing and health checking
 */

// Root endpoint - basic API information
app.get("/", (c) => {
  return c.json({
    message: "🎬 Educational Movie App API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      movies: "/api/movies",
      users: "/api/users",
    },
    documentation: "See README.md for detailed API documentation"
  });
});

// Health check endpoint - useful for monitoring and load balancers
app.get("/health", (c) => {
  // In a real application, you might check database connectivity, 
  // external service availability, etc.
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: "connected" // We could add actual health check here
  });
});

/**
 * API ROUTES
 * 
 * All our main API routes will be under the /api prefix
 * This is a common pattern that separates API endpoints from other routes
 */

// Temporary route for testing database connection
app.get("/api/test-db", (c) => {
  try {
    // Simple test query to verify database is working
    const result = sqlite.prepare("SELECT 1 as test").get();
    
    return c.json({
      message: "Database connection successful",
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test failed:", error);
    
    return c.json({
      error: "Database connection failed",
      message: error.message
    }, 500);
  }
});

// TODO: Add route groups here
// app.route("/api/movies", moviesRoutes);
// app.route("/api/users", usersRoutes);

/**
 * ERROR HANDLING
 * 
 * Global error handler for unhandled errors
 */
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  
  return c.json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    timestamp: new Date().toISOString()
  }, 500);
});

/**
 * 404 HANDLER
 * 
 * Handle requests to non-existent routes
 */
app.notFound((c) => {
  return c.json({
    error: "Not Found", 
    message: `Route ${c.req.method} ${c.req.path} not found`,
    availableEndpoints: ["/", "/health", "/api/test-db"]
  }, 404);
});

/**
 * SERVER STARTUP
 * 
 * Initialize database and start the HTTP server
 */
async function startServer() {
  try {
    // Initialize database
    console.log("🚀 Starting Educational Movie App Backend...");
    
    // Set up database
    initializeDatabase();
    
    // Get port from environment or use default
    const port = parseInt(process.env.PORT || "3001");
    
    // Start HTTP server
    console.log(`🌍 Server starting on port ${port}...`);
    
    serve({
      fetch: app.fetch, // Hono app's fetch handler
      port: port,
    });
    
    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📋 API documentation: http://localhost:${port}/`);
    console.log(`❤️  Health check: http://localhost:${port}/health`);
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

/**
 * GRACEFUL SHUTDOWN
 * 
 * Handle process termination signals gracefully
 */
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    // Close database connection
    closeDatabase();
    
    console.log("👋 Server shutdown complete");
    process.exit(0);
  };
  
  // Listen for termination signals
  process.on("SIGTERM", () => shutdown("SIGTERM")); // Docker/K8s termination
  process.on("SIGINT", () => shutdown("SIGINT"));   // Ctrl+C
}

// Set up graceful shutdown handlers
setupGracefulShutdown();

// Start the server
startServer();

/**
 * EDUCATIONAL NOTES:
 * 
 * 1. MIDDLEWARE ORDER:
 *    - Middleware runs in the order it's defined
 *    - Global middleware (logger, cors) should come before route-specific middleware
 *    - Error handling middleware typically comes last
 * 
 * 2. ENVIRONMENT VARIABLES:
 *    - Never hardcode sensitive values like API keys or database URLs
 *    - Use process.env to access environment variables
 *    - Provide sensible defaults for development
 * 
 * 3. ERROR HANDLING:
 *    - Always have a global error handler
 *    - Log errors appropriately (don't expose sensitive info in production)
 *    - Return consistent error response formats
 * 
 * 4. CORS:
 *    - Required for frontend-backend communication on different ports
 *    - Configure allowed origins, methods, and headers
 *    - Be restrictive in production for security
 * 
 * 5. GRACEFUL SHUTDOWN:
 *    - Clean up resources (database connections, file handles) on exit
 *    - Handle termination signals properly
 *    - Important for production deployments
 * 
 * 6. LOGGING:
 *    - Log important events (startup, errors, requests)
 *    - Use appropriate log levels
 *    - Consider structured logging in production
 */
# 🚀 Project Setup Guide

This comprehensive guide walks you through setting up the Educational Movie App from scratch, explaining every step and the reasoning behind each choice.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) - Package manager for JavaScript
- **Git** (optional but recommended) - Version control system

### Verify Installation
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Git version (optional)
git --version
```

## 🏗️ Project Initialization

### Step 1: Create Project Directory
```bash
# Create and navigate to project directory
mkdir educational-movie-app
cd educational-movie-app

# Initialize git repository (optional)
git init
```

### Step 2: Set Up Frontend (Vite + React)
```bash
# Create React app with Vite
npm create vite@latest frontend -- --template react

# Navigate to frontend and install dependencies
cd frontend
npm install

# Test the setup
npm run dev
```

**Why Vite?**
- ⚡ Extremely fast development server
- 🔧 Modern build tooling with minimal configuration
- 📦 Optimized production builds
- 🔥 Hot Module Replacement (HMR)
- 🎯 Better than Create React App for modern development

### Step 3: Set Up Backend (Hono + SQLite)
```bash
# Return to root directory
cd ..

# Create backend directory
mkdir backend
cd backend

# Initialize package.json
npm init -y

# Install core dependencies
npm install hono @hono/node-server

# Install database dependencies
npm install drizzle-orm better-sqlite3 drizzle-kit

# Install additional utilities
npm install cors dotenv
```

**Why Hono?**
- 🚀 Extremely fast (faster than Express.js)
- 🪶 Lightweight and modern
- 📝 Great TypeScript support
- 🔧 Minimal configuration required
- 🌐 Built for modern JavaScript environments

**Why SQLite + Drizzle ORM?**
- 📁 No separate database server required
- 🎯 Perfect for learning and prototyping
- ⚡ Fast for small to medium applications
- 🛡️ Type-safe database operations with Drizzle
- 📚 Easy to understand and debug

### Step 4: Configure Package.json Scripts
```bash
# Return to root directory
cd ..

# Install concurrently for running both servers
npm install --save-dev concurrently
```

Create root `package.json`:
```json
{
  "name": "educational-movie-app",
  "private": true,
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev", 
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
  }
}
```

## 🔧 Configuration Files

### Environment Variables (.env)
Create `backend/.env`:
```env
DATABASE_URL="./database.db"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Drizzle Configuration
Create `backend/drizzle.config.js`:
```javascript
const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  schema: "./src/db/schema.js",
  out: "./src/db/migrations", 
  dialect: "sqlite",
  dbCredentials: {
    url: "./database.db",
  },
});
```

## 📁 Project Structure

After setup, your project structure should look like this:

```
educational-movie-app/
├── README.md
├── package.json
├── docs/
│   ├── setup.md
│   ├── package-json.md
│   └── tasks.md
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── backend/                  # Hono API server
    ├── src/
    │   ├── db/
    │   │   ├── schema.js
    │   │   ├── index.js
    │   │   └── migrations/
    │   ├── routes/
    │   └── index.js
    ├── .env
    ├── .env.example
    ├── package.json
    └── drizzle.config.js
```

## 🚀 Running the Application

### Development Mode
```bash
# Install all dependencies (run this once)
npm run install:all

# Start both frontend and backend
npm run dev:all

# OR start them separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run dev:backend
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔍 Verification Steps

### 1. Frontend Verification
Visit http://localhost:5173 and you should see the default Vite + React page.

### 2. Backend Verification
```bash
# Test health endpoint
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 10.5,
  "database": "connected"
}
```

### 3. Database Verification
```bash
cd backend
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations

# Test database connection
curl http://localhost:3001/api/test-db
```

## 🛠️ Development Workflow

### Daily Development
1. **Start servers**: `npm run dev:all`
2. **Make changes** to frontend (`frontend/src/`) or backend (`backend/src/`)
3. **See changes instantly** thanks to hot reloading
4. **Check logs** in terminal for errors

### Adding Dependencies
```bash
# Frontend dependencies
cd frontend
npm install package-name

# Backend dependencies  
cd backend
npm install package-name
```

### Database Changes
```bash
cd backend

# 1. Modify src/db/schema.js
# 2. Generate new migration
npm run db:generate

# 3. Apply migration
npm run db:migrate
```

## 🎯 Next Steps

After completing the basic setup:

1. **Explore the code** - Read through the generated files
2. **Check documentation** - Review `docs/package-json.md` for dependency explanations  
3. **Follow tasks** - Use `docs/tasks.md` for structured learning
4. **Start coding** - Begin with basic React components
5. **Add features** - Follow the educational progression

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001 (backend)
lsof -ti:3001

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=3002
```

#### Node Version Issues
```bash
# Check Node version
node --version

# Upgrade Node.js if needed
# Visit https://nodejs.org/ for latest version
```

#### Database Issues
```bash
# Reset database
cd backend
rm database.db
npm run db:migrate
```

#### Permission Issues (Windows)
```bash
# Run terminal as Administrator
# Or use PowerShell instead of Command Prompt
```

### Getting Help
- **Check logs** in the terminal for detailed error messages
- **Read documentation** in the `docs/` folder
- **Verify file paths** - ensure you're in the correct directory
- **Check Node.js version** - must be 18+ for modern features

## 📚 Learning Resources

### Essential Concepts Covered
- **Modern JavaScript** (ES6+ features, modules)
- **React Fundamentals** (components, hooks, state)
- **API Development** (REST endpoints, middleware)
- **Database Operations** (ORM, migrations, queries)
- **Development Tools** (Vite, hot reloading, debugging)

### Recommended Reading Order
1. `docs/package-json.md` - Understand project dependencies
2. `docs/components.md` - Learn React component patterns
3. `docs/hooks.md` - Master React hooks
4. `docs/api-integration.md` - Connect frontend to backend
5. `docs/database.md` - Database operations and patterns

This setup provides a solid foundation for learning modern web development with React, focusing on best practices and real-world patterns that you'll use in professional development.
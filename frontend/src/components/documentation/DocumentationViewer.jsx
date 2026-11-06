/**
 * DocumentationViewer Component - Markdown Documentation Renderer
 * 
 * Renders markdown documentation with syntax highlighting, proper typography,
 * and interactive features. Transforms static markdown files into beautiful,
 * readable documentation with full dark mode support.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { clsx } from 'clsx';
import Button from '../ui/Button.jsx';
import { useReadingProgress } from '../../hooks/useReadingProgress.js';
import 'highlight.js/styles/github-dark.css';

/**
 * DocumentationViewer Component
 */
export default function DocumentationViewer({
  categoryId,
  documentId,
  onNavigate,
  onBackToIndex
}) {
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tableOfContents, setTableOfContents] = useState([]);
  
  const contentRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  // Reading progress tracking
  const { 
    markPageAsViewed, 
    totalProgress, 
    sessionProgress, 
    getReadingStats, 
    isPageViewed 
  } = useReadingProgress();
  
  /**
   * LOAD MARKDOWN CONTENT
   */
  useEffect(() => {
    if (!categoryId || !documentId) return;
    
    const loadDocument = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would fetch from the docs folder
        // For now, we'll create sample content based on the document ID
        const sampleContent = generateSampleContent(categoryId, documentId);
        
        // Simulate loading delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMarkdownContent(sampleContent);
        
        // Extract table of contents
        const headings = extractHeadings(sampleContent);
        setTableOfContents(headings);
        
        // Mark page as viewed (after a short delay to ensure user actually opened it)
        setTimeout(() => {
          markPageAsViewed(categoryId, documentId);
        }, 1000);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocument();
  }, [categoryId, documentId]);
  
  /**
   * READING PROGRESS TRACKING
   */
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  /**
   * COPY CODE FUNCTIONALITY
   */
  const handleCodeCopy = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading documentation...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 rounded-lg">
          <h3 className="font-medium text-red-900 dark:text-red-200 mb-2">
            Failed to Load Documentation
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm mb-3">
            {error}
          </p>
          <Button size="small" variant="secondary" onClick={onBackToIndex}>
            ← Back to Index
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Document Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <Button 
            size="small" 
            variant="ghost" 
            onClick={onBackToIndex}
          >
            ← Back to Index
          </Button>
          
          <div className="flex items-center space-x-3">
            {/* Overall Progress */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>Overall: {totalProgress}%</div>
              <div>Page: {scrollProgress}%</div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-1">
              {/* Overall progress */}
              <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-green-600 rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                  title={`Overall progress: ${totalProgress}%`}
                />
              </div>
              {/* Page scroll progress */}
              <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${scrollProgress}%` }}
                  title={`Page progress: ${scrollProgress}%`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table of Contents */}
      {tableOfContents.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              📑 Table of Contents ({tableOfContents.length} sections)
            </summary>
            <div className="mt-2 ml-4 space-y-1">
              {tableOfContents.map((heading, index) => (
                <button
                  key={index}
                  onClick={() => scrollToHeading(heading.id)}
                  className={clsx(
                    'block text-left text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
                    heading.level === 1 && 'font-medium',
                    heading.level === 2 && 'ml-2',
                    heading.level === 3 && 'ml-4 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {heading.text}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
      
      {/* Document Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // Custom code block with copy button
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && language) {
                return (
                  <div className="relative group my-4">
                    {/* Language label */}
                    <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-t-lg">
                      <span className="text-xs text-gray-300 font-medium uppercase tracking-wide">
                        {language}
                      </span>
                      <button
                        onClick={() => handleCodeCopy(String(children))}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                        title="Copy code"
                      >
                        <span>📋</span>
                        <span>Copy</span>
                      </button>
                    </div>
                    {/* Code block */}
                    <pre className={clsx(
                      className, 
                      'relative overflow-x-auto bg-gray-900 dark:bg-black rounded-b-lg border border-gray-700 dark:border-gray-600',
                      'text-sm p-4 m-0'
                    )} {...props}>
                      <code className="text-gray-100">{children}</code>
                    </pre>
                  </div>
                );
              }
              
              return (
                <code className={clsx(
                  className,
                  'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono'
                )} {...props}>
                  {children}
                </code>
              );
            },
            
            // Custom link handling
            a: ({ href, children, ...props }) => (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            ),
            
            // Custom headings with anchor links
            h1: ({ children, ...props }) => (
              <h1 className="text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-gray-900 dark:text-white mt-8 mb-4" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-gray-900 dark:text-white" {...props}>
                {children}
              </h3>
            )
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
      
      {/* Document Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-500 dark:text-gray-400">
            📖 Overall Progress: {totalProgress}% • Session: +{sessionProgress} pages • {isPageViewed(categoryId, documentId) ? '✅' : '⏳'} {isPageViewed(categoryId, documentId) ? 'Completed' : 'In Progress'}
          </div>
          <div className="flex items-center space-x-2">
            <Button size="small" variant="ghost">
              🔖 Bookmark
            </Button>
            <Button size="small" variant="ghost">
              🖨️ Print
            </Button>
            <Button size="small" variant="ghost" onClick={onBackToIndex}>
              📋 Index
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HELPER FUNCTIONS
 */

// Generate sample content based on document ID
function generateSampleContent(categoryId, documentId) {
  const documentTemplates = {
    // Tutorial & Learning
    'letter': `# 💝 A Letter to Developers

## Dear Fellow Developer

Welcome to an exciting journey of learning React through building a real movie application!

## What You'll Discover

### The Magic of React
React isn't just a library—it's a way of thinking about user interfaces.

### Building Real Applications
We'll create something tangible that you can show to friends and family.

### Industry Best Practices
Learn patterns that you'll use in your professional career.

## Your Learning Path

1. **Start with the basics** - Understanding components
2. **Build incrementally** - Add features step by step  
3. **Practice consistently** - Code every day
4. **Ask questions** - The community is here to help

## Final Thoughts

Remember, every expert was once a beginner. Be patient with yourself and enjoy the process!

---

*Happy coding! 🚀*`,

    'setup': `# 🚀 Project Setup Guide

## Prerequisites

Before we begin, make sure you have these tools installed:

### Required Software

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended editor)

### Recommended Extensions

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/movie-app.git
cd movie-app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Start the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

## Project Structure

Your project should now look like this:

\`\`\`
movie-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── contexts/
│   ├── public/
│   └── package.json
├── backend/
└── README.md
\`\`\`

## Next Steps

Now that you're set up, let's start building components!`,

    'components': `# 📦 Components Overview

## What are Components?

Components are the building blocks of React applications.

### Types of Components

#### 1. Functional Components
Modern React uses functional components with hooks.

\`\`\`jsx
function MovieCard({ title, poster, year }) {
  return (
    <div className="movie-card">
      <img src={poster} alt={title} />
      <h3>{title}</h3>
      <p>{year}</p>
    </div>
  );
}
\`\`\`

#### 2. Component Composition
Building complex UIs by combining simple components.

### Component Hierarchy

Our app structure:
- **App** (root component)
  - **Navigation** (header navigation)
  - **MovieSection** (movie listings)
    - **MovieCard** (individual movie)
  - **WelcomeSection** (hero section)

## Best Practices

### 1. Single Responsibility
Each component should have one clear purpose.

### 2. Props Interface
Always define clear prop interfaces.

### 3. Reusability
Design components to be reusable across the app.

## Component Patterns

Learn these essential patterns as you build the movie app.`,

    'hooks': `# 🪝 Hooks Deep Dive

## What are Hooks?

Hooks let you use state and other React features in functional components.

### Built-in Hooks

#### useState
Manage component state.

\`\`\`jsx
function SearchBox() {
  const [query, setQuery] = useState('');
  
  const handleSearch = (e) => {
    setQuery(e.target.value);
  };
  
  return (
    <input 
      value={query}
      onChange={handleSearch}
      placeholder="Search movies..."
    />
  );
}
\`\`\`

#### useEffect
Handle side effects like API calls.

\`\`\`jsx
function MovieList() {
  const [movies, setMovies] = useState([]);
  
  useEffect(() => {
    fetchMovies().then(setMovies);
  }, []);
  
  return (
    <div>
      {movies.map(movie => (
        <MovieCard key={movie.id} {...movie} />
      ))}
    </div>
  );
}
\`\`\`

#### useCallback & useMemo
Optimize performance by memoizing functions and values.

### Custom Hooks

#### useMovies Hook
\`\`\`jsx
function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    const data = await api.getMovies();
    setMovies(data);
    setLoading(false);
  }, []);
  
  return { movies, loading, fetchMovies };
}
\`\`\`

## Hook Rules

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use ESLint plugin to enforce rules

## Advanced Patterns

Learn advanced hook patterns as you build more complex features.`,

    'tailwind': `# 🌊 Tailwind CSS Setup

## What is Tailwind CSS?

Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces.

### Installation

Already included in this project! But here's how it was set up:

\`\`\`bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

### Configuration

Our \`tailwind.config.js\`:

\`\`\`javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

## Core Concepts

### Utility Classes
Instead of writing custom CSS, use utility classes:

\`\`\`jsx
// Instead of custom CSS
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
  Beautiful card
</div>
\`\`\`

### Responsive Design
Built-in responsive utilities:

\`\`\`jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
\`\`\`

### Dark Mode
Easy dark mode implementation:

\`\`\`jsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Theme-aware content
</div>
\`\`\`

## Movie App Styling

### Component Examples

#### Movie Card
\`\`\`jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
  <img className="w-full h-64 object-cover" src={poster} alt={title} />
  <div className="p-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{year}</p>
  </div>
</div>
\`\`\`

## Best Practices

1. **Mobile First**: Start with mobile, then add larger breakpoints
2. **Consistent Spacing**: Use the spacing scale (4, 8, 16, etc.)
3. **Color System**: Stick to the color palette
4. **Performance**: Purge unused styles in production`,

    'context': `# 🌐 Context API

## What is Context?

Context provides a way to pass data through the component tree without having to pass props down manually at every level.

### When to Use Context

- **Theme preferences** (dark/light mode)
- **User authentication** state
- **Language/localization** settings
- **Global application** state

### Creating a Theme Context

\`\`\`jsx
// contexts/ThemeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
\`\`\`

### Using the Context

#### Wrapping Your App
\`\`\`jsx
// main.jsx
import { ThemeProvider } from './contexts/ThemeContext';

ReactDOM.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);
\`\`\`

#### Consuming the Context
\`\`\`jsx
// components/ThemeToggle.jsx
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? '☀️' : '🌙'} Toggle Theme
    </button>
  );
}
\`\`\`

## Advanced Patterns

### Multiple Contexts
You can have multiple contexts for different concerns:

- ThemeContext
- AuthContext  
- MovieContext
- NotificationContext

### Context with Reducer
For complex state, combine Context with useReducer:

\`\`\`jsx
const [state, dispatch] = useReducer(movieReducer, initialState);
\`\`\`

## Performance Considerations

- Split contexts by concern
- Memoize context values
- Use multiple providers when needed

Context is powerful but use it wisely!`,

    // TypeScript Documentation
    'typescript-introduction': `# 🚀 TypeScript for Production React Applications

## Why TypeScript?

TypeScript transforms JavaScript into a production-ready language by adding static type checking, enhanced IDE support, and better code maintainability. In this educational movie app, we'll explore how TypeScript prevents bugs, improves developer experience, and enables large-scale application development.

## Key Benefits for React Development

### 1. **Type Safety** 🛡️
Catch errors at compile-time rather than runtime:

\`\`\`typescript
// JavaScript - Runtime Error
function getMovieTitle(movie) {
  return movie.title.toUpperCase(); // Error if movie is null
}

// TypeScript - Compile-time Error Prevention
interface Movie {
  id: string;
  title: string;
  year: number;
}

function getMovieTitle(movie: Movie | null): string {
  return movie?.title.toUpperCase() ?? 'Unknown Title';
}
\`\`\`

### 2. **Enhanced Developer Experience** 💡
- **IntelliSense**: Auto-completion for props, methods, and APIs
- **Refactoring**: Safe renaming across entire codebase
- **Documentation**: Types serve as inline documentation

### 3. **Scalability** 📈
- **Interface Contracts**: Clear agreements between components
- **Maintainability**: Easier to understand and modify large codebases
- **Team Collaboration**: Self-documenting code reduces onboarding time

## TypeScript in This Project

Our educational movie app demonstrates TypeScript best practices:

- **Strict Type Checking**: Enabled in \`tsconfig.json\` for maximum safety
- **Generic Components**: Reusable components with flexible typing
- **API Type Safety**: End-to-end type safety with tRPC
- **Advanced Patterns**: Utility types, conditional types, and mapped types

## Learning Path

1. **Basic Types**: Start with primitives and object shapes
2. **React + TypeScript**: Component props, state, and event typing
3. **Advanced Types**: Generics, utility types, and conditional logic
4. **API Integration**: Type-safe data fetching with tRPC
5. **Production Patterns**: Error boundaries, HOCs, and performance optimization

## Real-World Impact

> **Production Tip**: Companies report 15-20% reduction in bugs and 40% faster onboarding for new developers when using TypeScript with React.

Let's build type-safe, maintainable React applications together! 🎯`,

    'basic-types': `# 📝 TypeScript Basic Types & React Integration

## Primitive Types

TypeScript extends JavaScript with static type annotations:

\`\`\`typescript
// Basic type annotations
const movieTitle: string = "The Matrix";
const releaseYear: number = 1999;
const isWatched: boolean = true;
const rating: number | null = null; // Union type
\`\`\`

## Object Types & Interfaces

### Interface Definition
\`\`\`typescript
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
\`\`\`

## React Component Typing

### Functional Component Props
\`\`\`typescript
interface MovieCardProps {
  /** The movie data to display */
  movie: Movie;
  /** Callback when user clicks the movie card */
  onMovieSelect: (movieId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onMovieSelect,
  className = ""
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    onMovieSelect(movie.id);
  };

  return (
    <div 
      className={\`movie-card \${className}\`}
      onClick={handleClick}
    >
      <h3>{movie.title}</h3>
      <p>{movie.year}</p>
    </div>
  );
};
\`\`\`

## State & Event Typing

### useState with TypeScript
\`\`\`typescript
// Type inference (TypeScript knows it's string)
const [searchQuery, setSearchQuery] = useState("");

// Explicit typing for complex types
const [movies, setMovies] = useState<Movie[]>([]);
const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

// Union types for multiple states
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
const [loadingState, setLoadingState] = useState<LoadingState>('idle');
\`\`\`

These basic types form the foundation of type-safe React development! 🎯`,

    'advanced-typescript': `# 🧠 Advanced TypeScript Patterns for React

## Generics: Building Reusable Components

### Generic Component Example
\`\`\`typescript
/**
 * Generic Data Table Component
 * T represents the type of data being displayed
 */
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false
}: DataTableProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(column => (
            <th key={String(column.key)}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr 
            key={index} 
            onClick={() => onRowClick?.(item)}
          >
            {columns.map(column => (
              <td key={String(column.key)}>
                {String(item[column.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
\`\`\`

## Utility Types for Data Transformation

### Built-in Utility Types
\`\`\`typescript
interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
}

// Pick specific properties
type MovieSummary = Pick<Movie, 'id' | 'title' | 'year'>;

// Omit certain properties  
type MovieFormData = Omit<Movie, 'id'>;

// Make all properties optional
type PartialMovie = Partial<Movie>;
\`\`\`

## Conditional Types & Template Literals

### Conditional Types
\`\`\`typescript
/**
 * Conditional type that checks if T has an 'id' property
 */
type HasId<T> = T extends { id: any } ? true : false;

type MovieHasId = HasId<Movie>; // true
\`\`\`

### Template Literal Types
\`\`\`typescript
/**
 * Generate event handler names
 */
type EventHandlerName<T extends string> = \`on\${Capitalize<T>}\`;

type MovieEvents = 'select' | 'delete' | 'edit';
type MovieHandlers = EventHandlerName<MovieEvents>; 
// "onSelect" | "onDelete" | "onEdit"
\`\`\`

These advanced patterns enable you to build scalable, maintainable TypeScript applications! 🚀`,

    'trpc-integration': `# 🌐 tRPC Integration: End-to-End Type Safety

## What is tRPC?

tRPC (TypeScript Remote Procedure Call) provides end-to-end type safety from your API to your frontend. Unlike traditional REST APIs, tRPC automatically synchronizes types between client and server, eliminating the need for code generation or manual type definitions.

## Benefits for Movie App

- **🔒 Type Safety**: Compile-time errors for API mismatches
- **🚀 Developer Experience**: Auto-completion for API calls
- **📚 Self-Documenting**: Types serve as API documentation
- **🔄 Real-time Sync**: Server changes automatically reflect on client

## Server Setup (Backend)

### Router Definition
\`\`\`typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const CreateMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().min(1900).max(2030),
  genre: z.array(z.string()).min(1, "At least one genre required")
});

export const movieRouter = createTRPCRouter({
  // Get all movies
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.movie.findMany();
    }),

  // Create new movie
  create: publicProcedure
    .input(CreateMovieSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.movie.create({
        data: input
      });
    })
});
\`\`\`

## Client Setup (Frontend)

### tRPC Client Configuration
\`\`\`typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
\`\`\`

## Using tRPC in React Components

### Query Hook Usage
\`\`\`typescript
export const MovieList: React.FC = () => {
  // Type-safe query with auto-completion
  const {
    data: movies,
    isLoading,
    error
  } = trpc.movie.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {movies?.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
\`\`\`

### Mutation Hook Usage
\`\`\`typescript
export const CreateMovieForm: React.FC = () => {
  const utils = trpc.useUtils();

  const createMovieMutation = trpc.movie.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch movies list
      utils.movie.getAll.invalidate();
    }
  });

  const handleSubmit = (data: CreateMovieInput) => {
    createMovieMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
\`\`\`

tRPC provides the ultimate developer experience with full type safety from database to UI! 🎯`,

    // Comments System Documentation
    'comments-system': `# 💬 Comments System Implementation

## Overview

The movie commenting system demonstrates advanced React patterns for building interactive, user-generated content features. This implementation showcases real-world patterns used in production applications for handling user comments, replies, and social interactions.

## Key Learning Concepts

### 1. **Complex State Management** 🔄
Managing multiple related state variables for a cohesive user experience:

\`\`\`jsx
// Multiple interconnected state variables
const [allComments, setAllComments] = useLocalStorage('movie_comments', {});
const [newCommentText, setNewCommentText] = useState('');
const [editingCommentId, setEditingCommentId] = useState(null);
const [replyingToId, setReplyingToId] = useState(null);
const [showReplies, setShowReplies] = useState({});
\`\`\`

### 2. **Custom Hook Architecture** 🪝
Extracting complex logic into reusable custom hooks:

\`\`\`jsx
// useComments hook encapsulates all commenting logic
const {
  comments,
  commentStats,
  addComment,
  deleteComment,
  updateComment,
  toggleLike,
  addReply
} = useComments(movieId);
\`\`\`

### 3. **Data Persistence** 💾
Using localStorage for client-side data persistence:

\`\`\`jsx
// Comments persist across browser sessions
const [allComments, setAllComments] = useLocalStorage('movie_comments', {});
\`\`\`

## Component Architecture

### MovieComments Component
**Purpose**: Main commenting interface for a specific movie

**Features**:
- Comment creation with character limit validation
- Comment editing with optimistic updates
- Nested replies with threaded display
- Like/dislike functionality
- Sort options (newest, oldest, popular)
- Author name persistence
- Empty state handling

### useComments Custom Hook
**Purpose**: Encapsulates all commenting business logic

**Benefits**:
- Reusable across multiple components
- Centralized state management
- Clean separation of concerns
- Testable business logic
- Performance optimizations built-in

### MovieCard Integration
**Purpose**: Seamlessly integrate comments into movie cards

**Features**:
- Toggle comments visibility
- Comment count display
- Responsive integration
- Maintains card layout integrity

## Advanced Patterns Demonstrated

### 1. **Optimistic Updates**
\`\`\`jsx
// Immediate UI feedback before persistence
const handleToggleLike = useCallback((commentId) => {
  // Update UI immediately
  setComments(prev => prev.map(comment => 
    comment.id === commentId 
      ? { ...comment, likes: comment.userHasLiked ? comment.likes - 1 : comment.likes + 1 }
      : comment
  ));
}, []);
\`\`\`

### 2. **Immutable State Updates**
\`\`\`jsx
// Always create new objects, never mutate existing state
const updateComment = useCallback((commentId, newText) => {
  setAllComments(prev => ({
    ...prev, // Preserve other movies' comments
    [movieId]: prev[movieId].map(comment => 
      comment.id === commentId 
        ? { ...comment, text: newText, isEdited: true } // New object
        : comment // Unchanged reference
    )
  }));
}, [movieId]);
\`\`\`

## Performance Considerations

### Memoization Strategy
- \`useMemo\` for expensive comment calculations
- \`useCallback\` for stable function references
- \`React.memo\` for comment list items

### Efficient List Rendering
\`\`\`jsx
// Stable keys for React reconciliation
{comments.map(comment => (
  <CommentItem 
    key={comment.id} // Stable, unique key
    comment={comment}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
))}
\`\`\`

This commenting system showcases complex React patterns used in production applications! 🎯`
  };

  // Return specific content if available, otherwise fallback to generic
  if (documentTemplates[documentId]) {
    return documentTemplates[documentId];
  }

  // Fallback generic content
  return `# ${documentId.charAt(0).toUpperCase() + documentId.slice(1)} Documentation

## Introduction

This documentation covers **${documentId}** in the context of our educational movie app.

## Getting Started

Let's explore the key concepts and implementation details.

### Core Concepts

Understanding the fundamentals is essential for mastering this topic.

### Implementation

Here's how we implement **${documentId}** in our application:

\`\`\`jsx
// Example code for ${documentId}
function ${documentId.charAt(0).toUpperCase() + documentId.slice(1)}Example() {
  return <div>Implementation example</div>;
}
\`\`\`

## Best Practices

Follow these guidelines for optimal results.

## Conclusion

This covers the essentials of **${documentId}**. Practice these concepts to master them!`;
}

// Extract headings for table of contents
function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        line: index
      });
    }
  });
  
  return headings;
}

// Scroll to specific heading
function scrollToHeading(headingId) {
  const element = document.getElementById(headingId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
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

Context is powerful but use it wisely!`
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
/**
 * ThemeContext - Dark/Light Mode State Management
 * 
 * This context provides global theme state management throughout the application.
 * It demonstrates several important React concepts:
 * 
 * 1. CONTEXT API: Global state management without prop drilling
 * 2. LOCAL STORAGE PERSISTENCE: Remembering user preference across sessions
 * 3. SYSTEM PREFERENCE DETECTION: Respecting user's OS theme preference
 * 4. CUSTOM HOOKS: Convenient API for consuming context
 * 5. SIDE EFFECTS: Updating DOM classes for Tailwind dark mode
 */

import React, { createContext, useContext, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

// Create the context
const ThemeContext = createContext();

/**
 * ThemeProvider Component
 * 
 * Manages theme state and provides it to all child components.
 */
export function ThemeProvider({ children }) {
  // Get system preference for dark mode
  const getSystemPreference = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Use localStorage to persist theme preference, defaulting to system preference
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-dark-mode', getSystemPreference());

  // Toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Set specific theme
  const setTheme = (dark) => {
    setIsDarkMode(dark);
  };

  // Apply theme to document element for Tailwind CSS
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't set a manual preference
      // For now, we'll let users manually control it completely
      console.log('System theme changed:', e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    isDarkMode,
    isLightMode: !isDarkMode,
    toggleTheme,
    setTheme,
    setDarkMode: () => setTheme(true),
    setLightMode: () => setTheme(false),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to use theme context
 * 
 * This hook provides a convenient way to access theme state and functions
 * from any component in the application.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

export default ThemeContext;
/**
 * ThemeToggle Component - Dark/Light Mode Switch
 * 
 * This component provides an intuitive button to switch between dark and light themes.
 * It demonstrates several UI/UX best practices:
 * 
 * 1. VISUAL FEEDBACK: Clear icons and smooth transitions
 * 2. ACCESSIBILITY: Proper labeling and keyboard support
 * 3. STATE REFLECTION: UI clearly shows current theme state
 * 4. RESPONSIVE DESIGN: Works well on all screen sizes
 * 5. ANIMATION: Smooth transitions for better user experience
 */

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import clsx from 'clsx';

/**
 * ThemeToggle Component
 */
export default function ThemeToggle({ className, size = 'default' }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    default: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        // Base styles
        'relative inline-flex items-center justify-center rounded-full',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Theme-based styles
        isDarkMode
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 focus:ring-yellow-400'
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200 focus:ring-blue-500',
        
        // Size
        sizeClasses[size],
        
        // Custom className
        className
      )}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {/* Sun/Moon Icon with smooth rotation */}
      <span
        className={clsx(
          'transition-transform duration-300',
          isDarkMode ? 'rotate-0' : 'rotate-180'
        )}
      >
        {isDarkMode ? (
          // Moon icon
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>

      {/* Subtle glow effect */}
      <div
        className={clsx(
          'absolute inset-0 rounded-full transition-opacity duration-300',
          isDarkMode
            ? 'bg-yellow-400 opacity-20'
            : 'bg-blue-400 opacity-20',
          'scale-0 group-hover:scale-100'
        )}
      />
    </button>
  );
}

/**
 * Alternative compact toggle for smaller spaces
 */
export function CompactThemeToggle({ className }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        isDarkMode
          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 focus:ring-gray-400'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
        
        className
      )}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <span className="text-xs">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
      <span>
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
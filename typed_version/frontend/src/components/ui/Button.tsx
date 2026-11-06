/**
 * Button Component - TypeScript Educational Implementation
 * 
 * Demonstrates advanced TypeScript patterns for React components:
 * - Interface extension with HTMLButtonAttributes
 * - Union types for variants and sizes
 * - Generic props with proper typing
 * - Conditional rendering with type safety
 * - Event handler typing
 */

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import type { ButtonProps } from '../../types';

/**
 * Button component with comprehensive TypeScript typing
 * 
 * Uses forwardRef for proper ref forwarding with TypeScript
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary',
    size = 'medium', 
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    // Type-safe class name generation using clsx
    const buttonClasses = clsx(
      // Base button styles
      'inline-flex items-center justify-center font-medium rounded-md transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Size variants with proper TypeScript checking
      {
        'px-2.5 py-1.5 text-xs': size === 'small',
        'px-3 py-2 text-sm': size === 'medium', 
        'px-4 py-2 text-base': size === 'large',
      },
      
      // Color variants with type safety
      {
        'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',
        'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white focus:ring-gray-500': variant === 'secondary',
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500': variant === 'ghost',
        'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500': variant === 'outline',
      },
      
      // Full width modifier
      {
        'w-full': fullWidth,
      },
      
      // Custom className prop
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading state with conditional rendering */}
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Left icon with proper spacing */}
        {leftIcon && !isLoading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        {/* Button content */}
        {children}
        
        {/* Right icon with proper spacing */}
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

// Set display name for debugging (TypeScript best practice)
Button.displayName = 'Button';

export default Button;
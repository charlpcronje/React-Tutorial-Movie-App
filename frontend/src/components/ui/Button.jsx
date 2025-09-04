/**
 * Button Component - Educational React Component
 * 
 * This is our first custom React component that demonstrates fundamental React concepts.
 * As we build this Button component, we'll learn about:
 * 
 * 1. COMPONENT DEFINITION: How to create functional components
 * 2. PROPS: How components receive and use data from their parents
 * 3. PROP TYPES & DEFAULT VALUES: How to define component APIs
 * 4. CONDITIONAL RENDERING: How to change component behavior based on props
 * 5. EVENT HANDLING: How components respond to user interactions
 * 6. CSS CLASSES: How to apply dynamic styling with Tailwind CSS
 * 7. ACCESSIBILITY: How to make components usable by everyone
 * 8. COMPOSITION: How this component can be used by other components
 * 
 * Let's start building this Button component step by step, explaining every decision we make.
 */

// React Import - We import React to use JSX
// In modern React (17+), this import isn't strictly necessary for JSX, but it's good practice
// to include it for clarity and backwards compatibility
import React from 'react';

// Utility import for conditional class names
// We'll install and use 'clsx' to make dynamic class name composition cleaner
// For now, we'll create a simple helper function
import { clsx } from 'clsx';

/**
 * Button Component Definition
 * 
 * This is a functional component - the modern way to write React components.
 * Functional components are JavaScript functions that return JSX.
 * 
 * We use destructuring in the parameter to extract props. This is equivalent to:
 * function Button(props) { const { children, variant, size, ... } = props; }
 * 
 * @param {Object} props - The props object passed to this component
 * @param {React.ReactNode} props.children - The content inside the button
 * @param {string} props.variant - The visual style variant (primary, secondary, danger)
 * @param {string} props.size - The size of the button (small, medium, large)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether the button is in a loading state
 * @param {string} props.type - The HTML button type (button, submit, reset)
 * @param {Function} props.onClick - Click event handler function
 * @param {string} props.className - Additional CSS classes to apply
 * @param {Object} props....rest - Any other props that should be passed to the button element
 */
function Button({
  // Content and basic props
  children,                    // The text or elements inside the button
  variant = 'primary',         // Default to primary variant if not specified
  size = 'medium',            // Default to medium size if not specified
  
  // State props
  disabled = false,           // Default to enabled
  loading = false,            // Default to not loading
  
  // HTML attributes
  type = 'button',            // Default to button type (prevents form submission)
  onClick,                    // Click handler function
  className = '',             // Additional custom classes
  
  // Spread operator to collect any other props
  // This allows our Button to accept any standard HTML button attributes
  ...rest                     // All remaining props (like id, data-*, aria-*, etc.)
}) {
  
  /**
   * PROP PROCESSING AND VALIDATION
   * 
   * Here we process the props and create the appropriate class names and behaviors.
   * This demonstrates how to handle component configuration and validation.
   */
  
  // Base classes that apply to all buttons
  // These classes provide the fundamental button appearance and behavior
  const baseClasses = [
    // Layout and display
    'inline-flex',              // Use flexbox for internal layout
    'items-center',             // Center items vertically
    'justify-center',           // Center items horizontally
    'gap-2',                    // Space between icon and text
    
    // Typography
    'font-medium',              // Medium font weight
    'text-center',              // Center text alignment
    'leading-tight',            // Tighter line height
    
    // Borders and shape
    'border',                   // Add border
    'rounded-md',               // Rounded corners
    
    // Interactions
    'transition-all',           // Smooth transitions for all properties
    'duration-200',             // 200ms transition duration
    'ease-in-out',              // Smooth easing function
    'cursor-pointer',           // Pointer cursor on hover
    
    // Focus states for accessibility
    'focus:outline-none',       // Remove default browser outline
    'focus:ring-2',             // Add custom focus ring
    'focus:ring-offset-2',      // Offset the focus ring from the button
    
    // Disabled states
    'disabled:opacity-60',      // Reduce opacity when disabled
    'disabled:cursor-not-allowed', // Show not-allowed cursor when disabled
    'disabled:pointer-events-none', // Prevent interactions when disabled
  ].join(' ');
  
  /**
   * VARIANT STYLES
   * 
   * Different visual styles for different use cases.
   * This demonstrates the concept of component variants - different visual
   * treatments for the same component based on context and importance.
   */
  const variantStyles = {
    // Primary: Most important actions (Submit, Save, Continue)
    primary: [
      'bg-blue-600',            // Blue background
      'text-white',             // White text
      'border-blue-600',        // Blue border
      'hover:bg-blue-700',      // Darker blue on hover
      'hover:border-blue-700',  // Darker border on hover
      'focus:ring-blue-500',    // Blue focus ring
      'active:bg-blue-800',     // Even darker blue when pressed
    ].join(' '),
    
    // Secondary: Less important actions (Cancel, Back)
    secondary: [
      'bg-white dark:bg-gray-700',              // White background / dark gray in dark mode
      'text-gray-700 dark:text-gray-100',      // Dark gray text / white text in dark mode
      'border-gray-300 dark:border-gray-600',  // Light gray border / darker gray in dark mode
      'hover:bg-gray-50 dark:hover:bg-gray-600', // Light gray hover / darker gray in dark mode
      'hover:border-gray-400 dark:hover:border-gray-500', // Darker border on hover
      'focus:ring-gray-500',    // Gray focus ring
      'active:bg-gray-100 dark:active:bg-gray-600',     // Light gray when pressed / darker in dark mode
    ].join(' '),
    
    // Danger: Destructive actions (Delete, Remove)
    danger: [
      'bg-red-600',             // Red background
      'text-white',             // White text
      'border-red-600',         // Red border
      'hover:bg-red-700',       // Darker red on hover
      'hover:border-red-700',   // Darker border on hover
      'focus:ring-red-500',     // Red focus ring
      'active:bg-red-800',      // Even darker red when pressed
    ].join(' '),
    
    // Ghost: Minimal styling (subtle actions)
    ghost: [
      'bg-transparent',         // Transparent background
      'text-gray-700 dark:text-gray-100',          // Dark gray text / white text in dark mode
      'border-transparent',     // Transparent border
      'hover:bg-gray-100 dark:hover:bg-gray-600',      // Light gray background on hover / darker in dark mode
      'hover:text-gray-900 dark:hover:text-white',     // Darker text on hover / white in dark mode
      'focus:ring-gray-500',    // Gray focus ring
      'active:bg-gray-200 dark:active:bg-gray-700',     // Darker gray when pressed / darker in dark mode
    ].join(' '),
  };
  
  /**
   * SIZE STYLES
   * 
   * Different sizes for different contexts and hierarchies.
   * This shows how to create size variants that maintain proper proportions.
   */
  const sizeStyles = {
    // Small: Secondary actions, toolbar buttons
    small: [
      'text-xs',                // Small text
      'px-2',                   // Small horizontal padding
      'py-1',                   // Small vertical padding
      'h-8',                    // Fixed height for consistency
    ].join(' '),
    
    // Medium: Most common size for general use
    medium: [
      'text-sm',                // Standard text size
      'px-4',                   // Standard horizontal padding
      'py-2',                   // Standard vertical padding
      'h-10',                   // Fixed height for consistency
    ].join(' '),
    
    // Large: Primary actions, hero buttons
    large: [
      'text-base',              // Larger text
      'px-6',                   // Larger horizontal padding
      'py-3',                   // Larger vertical padding
      'h-12',                   // Fixed height for consistency
    ].join(' '),
  };
  
  /**
   * LOADING STATE HANDLING
   * 
   * When the button is in a loading state, we want to:
   * 1. Show a loading spinner
   * 2. Disable the button to prevent multiple submissions
   * 3. Optionally hide or modify the button text
   */
  const isDisabled = disabled || loading;
  
  /**
   * DYNAMIC CLASS COMPOSITION
   * 
   * Here we combine all the different class strings based on the component's props.
   * This demonstrates how to build dynamic, conditional styling in React.
   */
  const buttonClasses = clsx(
    baseClasses,                     // Always applied
    variantStyles[variant],          // Applied based on variant prop
    sizeStyles[size],               // Applied based on size prop
    className                       // Additional custom classes
  );
  
  /**
   * LOADING SPINNER COMPONENT
   * 
   * A simple loading spinner using CSS animations.
   * This is defined inside the Button component because it's only used here.
   * In a larger app, you might extract this as its own component.
   */
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"  // Hide from screen readers since it's decorative
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
  );
  
  /**
   * EVENT HANDLER PROCESSING
   * 
   * We create a wrapper around the onClick handler to add our own logic
   * while still allowing the parent component to handle the click event.
   */
  const handleClick = (event) => {
    // Don't do anything if the button is disabled or loading
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    
    // Call the parent's onClick handler if it exists
    if (onClick && typeof onClick === 'function') {
      onClick(event);
    }
  };
  
  /**
   * JSX RETURN - THE COMPONENT RENDER
   * 
   * This is what gets rendered to the DOM. Let's break down each part:
   */
  return (
    <button
      // HTML Attributes
      type={type}                    // button, submit, or reset
      disabled={isDisabled}          // HTML disabled attribute
      onClick={handleClick}          // Our click handler wrapper
      className={buttonClasses}      // All our computed CSS classes
      
      // Accessibility attributes
      aria-disabled={isDisabled}     // Accessible disabled state
      aria-busy={loading}           // Indicate loading state to screen readers
      
      // Spread any additional props passed to the component
      // This allows parent components to add any standard button attributes
      {...rest}
    >
      {/* Loading state content */}
      {loading && (
        <>
          <LoadingSpinner />
          <span className="sr-only">Loading...</span> {/* Screen reader only text */}
        </>
      )}
      
      {/* Button content */}
      {/* We only show children if not loading, or if loading but still want to show text */}
      {children}
    </button>
  );
}

/**
 * COMPONENT EXPORT
 * 
 * We export the Button component as the default export from this file.
 * This allows other files to import it like: import Button from './Button'
 */
export default Button;

/**
 * USAGE EXAMPLES
 * 
 * Here's how you would use this Button component in other parts of your app:
 * 
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // With variants
 * <Button variant="primary">Save</Button>
 * <Button variant="secondary">Cancel</Button>
 * <Button variant="danger">Delete</Button>
 * <Button variant="ghost">Skip</Button>
 * 
 * // With sizes
 * <Button size="small">Small</Button>
 * <Button size="medium">Medium</Button>
 * <Button size="large">Large</Button>
 * 
 * // With states
 * <Button disabled>Disabled</Button>
 * <Button loading>Loading...</Button>
 * 
 * // With event handlers
 * <Button onClick={() => console.log('Clicked!')}>
 *   Click me
 * </Button>
 * 
 * // With additional props
 * <Button
 *   type="submit"
 *   className="mt-4"
 *   id="submit-button"
 *   data-testid="submit"
 * >
 *   Submit Form
 * </Button>
 */

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED
 * 
 * This Button component demonstrates many fundamental React concepts:
 * 
 * 1. FUNCTIONAL COMPONENTS: Modern React component syntax
 * 2. PROPS DESTRUCTURING: Clean way to extract props
 * 3. DEFAULT PROPS: Providing sensible defaults
 * 4. CONDITIONAL RENDERING: Showing different content based on state
 * 5. EVENT HANDLING: Responding to user interactions
 * 6. CSS CLASS COMPOSITION: Building dynamic styles
 * 7. ACCESSIBILITY: Making components usable by everyone
 * 8. COMPONENT COMPOSITION: How this fits into larger component trees
 * 9. PROP SPREADING: Passing through additional props
 * 10. INLINE COMPONENTS: Creating components inside other components
 * 
 * As we continue building our movie app, we'll use this Button component
 * throughout the application, demonstrating how reusable components
 * create consistent user experiences and reduce code duplication.
 */
/**
 * useLocalStorage Custom Hook - Complete Educational Implementation
 * 
 * This is our first custom hook, designed to demonstrate how React hooks work
 * and how to create reusable logic that can be shared across components.
 * 
 * A custom hook is simply a JavaScript function that:
 * 1. Starts with "use" (this is a React convention)
 * 2. Can call other React hooks inside it
 * 3. Returns values that components can use
 * 4. Encapsulates complex logic in a reusable way
 * 
 * This useLocalStorage hook will teach us about:
 * - Custom hook creation and naming conventions
 * - State synchronization with browser APIs
 * - Effect management and cleanup
 * - Error handling in hooks
 * - Hook composition patterns
 * - Performance considerations
 * - Testing strategies for custom hooks
 * 
 * Let's build this hook step by step with complete explanations.
 */

// React imports - we need useState and useEffect for our custom hook
// useState: for managing the current value in React state
// useEffect: for synchronizing with localStorage and handling side effects
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useLocalStorage Hook Implementation
 * 
 * This hook provides a simple way to persist state in the browser's localStorage
 * while keeping it synchronized with React state. It behaves like useState
 * but automatically saves changes to localStorage and loads them on mount.
 * 
 * @param {string} key - The localStorage key to use
 * @param {any} initialValue - Default value if nothing is stored
 * @returns {[any, Function, Function]} [storedValue, setValue, removeValue]
 */
function useLocalStorage(key, initialValue) {
  /**
   * INPUT VALIDATION
   * 
   * First, we validate our inputs to catch common mistakes early.
   * This demonstrates defensive programming practices.
   */
  if (typeof key !== 'string' || key.trim().length === 0) {
    throw new Error(
      `useLocalStorage: key must be a non-empty string, received: ${typeof key}`
    );
  }
  
  // Clean the key to prevent localStorage errors
  const cleanKey = key.trim();
  
  /**
   * ERROR HANDLING UTILITIES
   * 
   * localStorage operations can fail in several scenarios:
   * - Private browsing mode
   * - Storage quota exceeded
   * - Corrupted data
   * - Browser restrictions
   * 
   * We create utility functions to handle these gracefully.
   */
  
  /**
   * Safely read from localStorage
   * @param {string} storageKey - The key to read
   * @returns {any} Parsed value or null if error/not found
   */
  const safeGetItem = useCallback((storageKey) => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available (SSR or restricted environment)');
        return null;
      }
      
      const item = window.localStorage.getItem(storageKey);
      
      // Return null if no item found
      if (item === null) {
        console.log(`📭 No localStorage value found for key: ${storageKey}`);
        return null;
      }
      
      // Try to parse JSON data
      const parsed = JSON.parse(item);
      console.log(`📦 Retrieved from localStorage[${storageKey}]:`, parsed);
      return parsed;
      
    } catch (error) {
      // Handle JSON parsing errors or localStorage errors
      console.error(`❌ Failed to read localStorage[${storageKey}]:`, error.message);
      
      // If data is corrupted, remove it
      try {
        window.localStorage.removeItem(storageKey);
        console.log(`🗑️ Removed corrupted localStorage[${storageKey}]`);
      } catch (removeError) {
        console.error(`❌ Failed to remove corrupted data:`, removeError.message);
      }
      
      return null;
    }
  }, []); // Empty dependency array means this function never changes
  
  /**
   * Safely write to localStorage
   * @param {string} storageKey - The key to write to
   * @param {any} value - The value to store
   * @returns {boolean} True if successful, false otherwise
   */
  const safeSetItem = useCallback((storageKey, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available for writing');
        return false;
      }
      
      // Convert value to JSON string
      const serialized = JSON.stringify(value);
      
      // Store in localStorage
      window.localStorage.setItem(storageKey, serialized);
      
      console.log(`💾 Saved to localStorage[${storageKey}]:`, value);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to write localStorage[${storageKey}]:`, error.message);
      
      // Handle specific localStorage errors
      if (error.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded');
        // In a real app, you might clear old data or notify the user
      }
      
      return false;
    }
  }, []);
  
  /**
   * Safely remove from localStorage
   * @param {string} storageKey - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  const safeRemoveItem = useCallback((storageKey) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available for removal');
        return false;
      }
      
      window.localStorage.removeItem(storageKey);
      console.log(`🗑️ Removed localStorage[${storageKey}]`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to remove localStorage[${storageKey}]:`, error.message);
      return false;
    }
  }, []);
  
  /**
   * STATE INITIALIZATION
   * 
   * We use useState with a function to lazily initialize the state.
   * This prevents reading from localStorage on every render.
   */
  const [storedValue, setStoredValue] = useState(() => {
    console.log(`🔄 Initializing useLocalStorage for key: ${cleanKey}`);
    
    // Try to load from localStorage first
    const savedValue = safeGetItem(cleanKey);
    
    if (savedValue !== null) {
      console.log(`✅ Loaded initial value from localStorage: ${cleanKey}`);
      return savedValue;
    }
    
    // Use initial value if nothing in localStorage
    console.log(`🆕 Using initial value for ${cleanKey}:`, initialValue);
    
    // If initial value is a function, call it (lazy initialization)
    const value = typeof initialValue === 'function' ? initialValue() : initialValue;
    
    // Immediately save initial value to localStorage
    safeSetItem(cleanKey, value);
    
    return value;
  });
  
  /**
   * VALUE SETTER FUNCTION
   * 
   * This function updates both React state and localStorage.
   * It supports both direct values and functional updates (like setState).
   */
  const setValue = useCallback((value) => {
    try {
      console.log(`🔄 Updating localStorage[${cleanKey}]`);
      
      // Handle functional updates
      // If value is a function, call it with the current stored value
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update React state
      setStoredValue(valueToStore);
      
      // Update localStorage
      const success = safeSetItem(cleanKey, valueToStore);
      
      if (success) {
        console.log(`✅ Successfully updated localStorage[${cleanKey}]`);
        
        // Dispatch custom event to notify other tabs/windows
        // This enables cross-tab synchronization
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key: cleanKey, newValue: valueToStore }
          })
        );
      } else {
        console.warn(`⚠️ Failed to update localStorage[${cleanKey}], state updated only`);
      }
      
    } catch (error) {
      console.error(`❌ Error in setValue for ${cleanKey}:`, error);
      // Even if localStorage fails, we still update React state
      setStoredValue(value instanceof Function ? value(storedValue) : value);
    }
  }, [cleanKey, storedValue, safeSetItem]); // Dependencies for useCallback
  
  /**
   * VALUE REMOVAL FUNCTION
   * 
   * This function removes the value from both React state and localStorage.
   * After removal, the state reverts to the initial value.
   */
  const removeValue = useCallback(() => {
    try {
      console.log(`🗑️ Removing localStorage[${cleanKey}]`);
      
      // Remove from localStorage
      const success = safeRemoveItem(cleanKey);
      
      // Reset React state to initial value
      const resetValue = typeof initialValue === 'function' ? initialValue() : initialValue;
      setStoredValue(resetValue);
      
      if (success) {
        console.log(`✅ Successfully removed localStorage[${cleanKey}]`);
        
        // Notify other tabs/windows
        window.dispatchEvent(
          new CustomEvent('localStorageChange', {
            detail: { key: cleanKey, newValue: null, removed: true }
          })
        );
      }
      
    } catch (error) {
      console.error(`❌ Error removing localStorage[${cleanKey}]:`, error);
    }
  }, [cleanKey, initialValue, safeRemoveItem]);
  
  /**
   * CROSS-TAB SYNCHRONIZATION
   * 
   * This effect listens for changes in localStorage from other tabs/windows
   * and updates our React state accordingly. This creates a reactive
   * cross-tab experience.
   */
  useEffect(() => {
    /**
     * Handle localStorage changes from other tabs
     * @param {StorageEvent} event - Browser storage event
     */
    const handleStorageChange = (event) => {
      // Only respond to changes for our specific key
      if (event.key !== cleanKey) return;
      
      console.log(`🔄 localStorage changed in another tab for key: ${cleanKey}`);
      
      try {
        if (event.newValue === null) {
          // Value was removed in another tab
          const resetValue = typeof initialValue === 'function' ? initialValue() : initialValue;
          setStoredValue(resetValue);
          console.log(`🔄 Reset to initial value due to external removal`);
        } else {
          // Value was updated in another tab
          const newValue = JSON.parse(event.newValue);
          setStoredValue(newValue);
          console.log(`🔄 Updated from another tab:`, newValue);
        }
      } catch (error) {
        console.error(`❌ Error handling cross-tab change:`, error);
      }
    };
    
    /**
     * Handle our custom localStorage change events
     * @param {CustomEvent} event - Our custom event
     */
    const handleCustomStorageChange = (event) => {
      if (event.detail.key !== cleanKey) return;
      
      console.log(`🔄 Custom localStorage change for key: ${cleanKey}`);
      
      if (event.detail.removed) {
        const resetValue = typeof initialValue === 'function' ? initialValue() : initialValue;
        setStoredValue(resetValue);
      } else {
        setStoredValue(event.detail.newValue);
      }
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);
    
    // Cleanup function - removes event listeners when component unmounts
    // This prevents memory leaks and unwanted behavior
    return () => {
      console.log(`🧹 Cleaning up localStorage listeners for key: ${cleanKey}`);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [cleanKey, initialValue]); // Re-run if key or initial value changes
  
  /**
   * DEVELOPMENT HELPERS
   * 
   * Additional utilities that are helpful during development and debugging.
   */
  
  // Track how many times this hook has been called (development only)
  const renderCount = useRef(0);
  renderCount.current++;
  
  if (import.meta.env.DEV) {
    console.log(`🔧 useLocalStorage[${cleanKey}] render #${renderCount.current}:`, {
      currentValue: storedValue,
      initialValue,
      keyInStorage: cleanKey,
    });
  }
  
  /**
   * RETURN VALUES
   * 
   * We return an array similar to useState, plus an additional remove function.
   * This maintains consistency with React's built-in hooks while providing
   * the additional functionality specific to localStorage.
   */
  return [
    storedValue,  // Current value (synchronized with localStorage)
    setValue,     // Function to update value (updates both state and localStorage)
    removeValue,  // Function to remove value (clears both state and localStorage)
  ];
}

/**
 * EXPORT THE HOOK
 * 
 * We export as default so it can be imported as:
 * import useLocalStorage from './useLocalStorage'
 */
export default useLocalStorage;

/**
 * USAGE EXAMPLES AND PATTERNS
 * 
 * Here are comprehensive examples of how to use this custom hook in different scenarios:
 * 
 * BASIC USAGE:
 * ```jsx
 * function UserPreferences() {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 *   
 *   return (
 *     <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 * 
 * COMPLEX OBJECT STORAGE:
 * ```jsx
 * function UserSettings() {
 *   const [settings, setSettings, removeSettings] = useLocalStorage('userSettings', {
 *     notifications: true,
 *     autoplay: false,
 *     language: 'en',
 *   });
 *   
 *   const updateSetting = (key, value) => {
 *     setSettings(prevSettings => ({
 *       ...prevSettings,
 *       [key]: value
 *     }));
 *   };
 *   
 *   return (
 *     <div>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={settings.notifications}
 *           onChange={(e) => updateSetting('notifications', e.target.checked)}
 *         />
 *         Enable notifications
 *       </label>
 *       
 *       <button onClick={removeSettings}>
 *         Reset to defaults
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ARRAY MANAGEMENT:
 * ```jsx
 * function FavoriteMovies() {
 *   const [favorites, setFavorites] = useLocalStorage('favoriteMovies', []);
 *   
 *   const addFavorite = (movie) => {
 *     setFavorites(prevFavorites => {
 *       if (prevFavorites.some(fav => fav.id === movie.id)) {
 *         return prevFavorites; // Already in favorites
 *       }
 *       return [...prevFavorites, movie];
 *     });
 *   };
 *   
 *   const removeFavorite = (movieId) => {
 *     setFavorites(prevFavorites => 
 *       prevFavorites.filter(movie => movie.id !== movieId)
 *     );
 *   };
 *   
 *   return (
 *     <div>
 *       <p>You have {favorites.length} favorite movies</p>
 *       {favorites.map(movie => (
 *         <div key={movie.id}>
 *           {movie.title}
 *           <button onClick={() => removeFavorite(movie.id)}>Remove</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * LAZY INITIALIZATION:
 * ```jsx
 * function ExpensiveDefault() {
 *   // The function is only called once during initialization
 *   const [data, setData] = useLocalStorage('expensiveData', () => {
 *     console.log('Computing expensive initial value...');
 *     return Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }));
 *   });
 *   
 *   return <div>Data length: {data.length}</div>;
 * }
 * ```
 * 
 * FORM PERSISTENCE:
 * ```jsx
 * function MovieReviewForm() {
 *   const [formData, setFormData] = useLocalStorage('reviewForm', {
 *     title: '',
 *     rating: 5,
 *     review: '',
 *   });
 *   
 *   const updateField = (field, value) => {
 *     setFormData(prev => ({ ...prev, [field]: value }));
 *   };
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     
 *     try {
 *       await submitReview(formData);
 *       // Clear form after successful submission
 *       setFormData({
 *         title: '',
 *         rating: 5,
 *         review: '',
 *       });
 *     } catch (error) {
 *       // Form data is preserved automatically if submission fails
 *       console.error('Submission failed, form data preserved');
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.title}
 *         onChange={(e) => updateField('title', e.target.value)}
 *         placeholder="Movie title"
 *       />
 *       <textarea
 *         value={formData.review}
 *         onChange={(e) => updateField('review', e.target.value)}
 *         placeholder="Your review"
 *       />
 *       <button type="submit">Submit Review</button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * CROSS-TAB SYNCHRONIZATION EXAMPLE:
 * ```jsx
 * function CrossTabDemo() {
 *   const [sharedCounter, setSharedCounter] = useLocalStorage('sharedCounter', 0);
 *   
 *   return (
 *     <div>
 *       <p>Shared Counter: {sharedCounter}</p>
 *       <button onClick={() => setSharedCounter(prev => prev + 1)}>
 *         Increment
 *       </button>
 *       <p>Open this page in another tab and see the counter sync!</p>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL NOTES ABOUT CUSTOM HOOKS:
 * 
 * 1. NAMING CONVENTION:
 *    - Always start with "use" (useLocalStorage, useApi, useToggle)
 *    - This tells React this is a hook and enables hook-related warnings
 *    - It also helps developers immediately understand the function's purpose
 * 
 * 2. HOOK COMPOSITION:
 *    - Custom hooks can call other hooks (useState, useEffect, other custom hooks)
 *    - This allows building complex behavior from simple primitives
 *    - Enables powerful patterns like hook composition and dependency injection
 * 
 * 3. STATE ENCAPSULATION:
 *    - Internal state management is hidden from components
 *    - Components only see the interface (storedValue, setValue, removeValue)
 *    - This creates clear separation between what and how
 * 
 * 4. SIDE EFFECT MANAGEMENT:
 *    - useEffect handles localStorage synchronization
 *    - Proper cleanup prevents memory leaks
 *    - Event listeners enable reactive cross-tab behavior
 * 
 * 5. ERROR HANDLING:
 *    - Graceful degradation when localStorage is unavailable
 *    - Data corruption handling with automatic cleanup
 *    - Meaningful error messages for debugging
 * 
 * 6. PERFORMANCE CONSIDERATIONS:
 *    - useCallback prevents unnecessary function recreations
 *    - Lazy state initialization avoids expensive operations on every render
 *    - Minimal re-renders through careful dependency management
 * 
 * 7. TESTING STRATEGIES:
 *    - Mock localStorage for testing
 *    - Test error conditions (quota exceeded, corrupted data)
 *    - Verify cross-tab synchronization
 *    - Test with different data types
 * 
 * 8. TYPESCRIPT BENEFITS:
 *    - Even in JavaScript, JSDoc provides type hints
 *    - Generic type support for type-safe value storage
 *    - Better IDE support with autocomplete and error detection
 * 
 * 9. REAL-WORLD APPLICATIONS:
 *    - User preferences and settings
 *    - Form data persistence
 *    - Shopping cart state
 *    - Authentication tokens
 *    - Application state backup
 *    - Offline data storage
 * 
 * 10. HOOK COMPOSITION PATTERNS:
 *     - This hook can be combined with other hooks
 *     - Can be wrapped in higher-order hooks
 *     - Enables building more specialized hooks (usePersistedState, useSettings)
 */

/**
 * ADVANCED VARIATIONS AND EXTENSIONS
 * 
 * Here are some advanced variations of this hook that you might implement:
 * 
 * WITH ENCRYPTION:
 * ```jsx
 * function useEncryptedLocalStorage(key, initialValue, encryptionKey) {
 *   // Encrypt data before storing, decrypt when reading
 *   // Useful for sensitive data like authentication tokens
 * }
 * ```
 * 
 * WITH EXPIRATION:
 * ```jsx
 * function useTemporaryStorage(key, initialValue, ttlMs) {
 *   // Automatically expires data after specified time
 *   // Useful for session data or temporary caches
 * }
 * ```
 * 
 * WITH VALIDATION:
 * ```jsx
 * function useValidatedStorage(key, initialValue, validator) {
 *   // Validates data before storing and after loading
 *   // Ensures data integrity and catches schema changes
 * }
 * ```
 * 
 * WITH COMPRESSION:
 * ```jsx
 * function useCompressedStorage(key, initialValue) {
 *   // Compresses large objects before storing
 *   // Useful when storing large amounts of data
 * }
 * ```
 */
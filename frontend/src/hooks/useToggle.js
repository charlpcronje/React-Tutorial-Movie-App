/**
 * useToggle Custom Hook - Boolean State Management Made Simple
 * 
 * This custom hook demonstrates how to create specialized hooks for common patterns.
 * Boolean state (true/false) is extremely common in UIs for:
 * 
 * - Modal open/closed states
 * - Dropdown expanded/collapsed states  
 * - Form field visible/hidden states
 * - Feature enabled/disabled states
 * - Loading states
 * - Error states
 * 
 * While you could use useState(false) directly, a custom useToggle hook provides:
 * - Convenient helper functions for common operations
 * - Consistent API across your application
 * - Additional functionality like toggle history
 * - Educational value in demonstrating custom hook patterns
 * 
 * Let's build this hook with comprehensive explanations and multiple usage patterns.
 */

// React imports
import { useState, useCallback, useMemo, useRef } from 'react';

/**
 * useToggle Hook Implementation
 * 
 * This hook manages boolean state with convenient helper functions
 * and optional advanced features like toggle history and callbacks.
 * 
 * @param {boolean} initialValue - Initial boolean value (default: false)
 * @param {Object} options - Optional configuration
 * @returns {Array} [value, toggleFunctions, metadata]
 */
function useToggle(initialValue = false, options = {}) {
  /**
   * OPTIONS PROCESSING
   * 
   * We provide configuration options to make the hook flexible for different use cases.
   */
  const {
    // Callback functions
    onToggle = null,          // Called whenever value changes
    onToggleTrue = null,      // Called when value becomes true
    onToggleFalse = null,     // Called when value becomes false
    
    // History tracking
    trackHistory = false,     // Whether to track toggle history
    maxHistoryLength = 10,    // Maximum history entries to keep
    
    // Performance options
    enableLogging = true,     // Enable console logging for debugging
  } = options;
  
  /**
   * STATE MANAGEMENT
   */
  
  // Main boolean state
  const [value, setValue] = useState(() => {
    // Validate initial value
    if (typeof initialValue !== 'boolean') {
      console.warn(`useToggle: initialValue should be boolean, received ${typeof initialValue}`);
      return Boolean(initialValue); // Coerce to boolean
    }
    return initialValue;
  });
  
  // Toggle history (if enabled)
  const [history, setHistory] = useState(() => 
    trackHistory ? [{
      value: initialValue,
      timestamp: Date.now(),
      action: 'initialize',
    }] : []
  );
  
  /**
   * REFS FOR METADATA
   * 
   * These track information that doesn't trigger re-renders.
   */
  const toggleCount = useRef(0);        // Total number of toggles
  const lastToggleTime = useRef(null);  // When last toggle occurred
  
  /**
   * TOGGLE FUNCTIONS
   * 
   * We provide multiple ways to change the boolean value,
   * each with different use cases and educational value.
   */
  
  /**
   * Main toggle function - flips the current value
   */
  const toggle = useCallback(() => {
    const newValue = !value;
    const now = Date.now();
    
    if (enableLogging) {
      console.log(`🔄 useToggle: ${value} → ${newValue}`);
    }
    
    // Update counters and timestamps
    toggleCount.current++;
    lastToggleTime.current = now;
    
    // Update state
    setValue(newValue);
    
    // Update history if tracking is enabled
    if (trackHistory) {
      setHistory(prev => [
        ...prev.slice(-(maxHistoryLength - 1)), // Keep within limit
        {
          value: newValue,
          timestamp: now,
          action: 'toggle',
          fromValue: value,
        }
      ]);
    }
    
    // Call appropriate callbacks
    try {
      if (onToggle) onToggle(newValue, value);
      if (newValue && onToggleTrue) onToggleTrue();
      if (!newValue && onToggleFalse) onToggleFalse();
    } catch (error) {
      console.error('❌ useToggle callback error:', error);
    }
  }, [
    value, 
    onToggle, 
    onToggleTrue, 
    onToggleFalse, 
    enableLogging, 
    trackHistory, 
    maxHistoryLength
  ]);
  
  /**
   * Explicit set to true function
   */
  const setTrue = useCallback(() => {
    if (value === true) {
      if (enableLogging) {
        console.log('useToggle: Already true, no change');
      }
      return; // No change needed
    }
    
    const now = Date.now();
    
    if (enableLogging) {
      console.log(`✅ useToggle: ${value} → true`);
    }
    
    toggleCount.current++;
    lastToggleTime.current = now;
    setValue(true);
    
    if (trackHistory) {
      setHistory(prev => [
        ...prev.slice(-(maxHistoryLength - 1)),
        {
          value: true,
          timestamp: now,
          action: 'setTrue',
          fromValue: value,
        }
      ]);
    }
    
    try {
      if (onToggle) onToggle(true, value);
      if (onToggleTrue) onToggleTrue();
    } catch (error) {
      console.error('❌ useToggle setTrue callback error:', error);
    }
  }, [value, onToggle, onToggleTrue, enableLogging, trackHistory, maxHistoryLength]);
  
  /**
   * Explicit set to false function
   */
  const setFalse = useCallback(() => {
    if (value === false) {
      if (enableLogging) {
        console.log('useToggle: Already false, no change');
      }
      return;
    }
    
    const now = Date.now();
    
    if (enableLogging) {
      console.log(`❌ useToggle: ${value} → false`);
    }
    
    toggleCount.current++;
    lastToggleTime.current = now;
    setValue(false);
    
    if (trackHistory) {
      setHistory(prev => [
        ...prev.slice(-(maxHistoryLength - 1)),
        {
          value: false,
          timestamp: now,
          action: 'setFalse',
          fromValue: value,
        }
      ]);
    }
    
    try {
      if (onToggle) onToggle(false, value);
      if (onToggleFalse) onToggleFalse();
    } catch (error) {
      console.error('❌ useToggle setFalse callback error:', error);
    }
  }, [value, onToggle, onToggleFalse, enableLogging, trackHistory, maxHistoryLength]);
  
  /**
   * Reset to initial value function
   */
  const reset = useCallback(() => {
    if (value === initialValue) {
      if (enableLogging) {
        console.log(`useToggle: Already at initial value (${initialValue}), no change`);
      }
      return;
    }
    
    const now = Date.now();
    
    if (enableLogging) {
      console.log(`🔄 useToggle: ${value} → ${initialValue} (reset)`);
    }
    
    toggleCount.current++;
    lastToggleTime.current = now;
    setValue(initialValue);
    
    if (trackHistory) {
      setHistory(prev => [
        ...prev.slice(-(maxHistoryLength - 1)),
        {
          value: initialValue,
          timestamp: now,
          action: 'reset',
          fromValue: value,
        }
      ]);
    }
    
    try {
      if (onToggle) onToggle(initialValue, value);
      if (initialValue && onToggleTrue) onToggleTrue();
      if (!initialValue && onToggleFalse) onToggleFalse();
    } catch (error) {
      console.error('❌ useToggle reset callback error:', error);
    }
  }, [value, initialValue, onToggle, onToggleTrue, onToggleFalse, enableLogging, trackHistory, maxHistoryLength]);
  
  /**
   * COMPUTED METADATA
   * 
   * Additional information about the toggle state that updates reactively.
   */
  const metadata = useMemo(() => {
    const now = Date.now();
    
    return {
      // Basic info
      toggleCount: toggleCount.current,
      timeSinceLastToggle: lastToggleTime.current ? now - lastToggleTime.current : null,
      
      // History info (if tracking enabled)
      historyLength: history.length,
      hasHistory: history.length > 0,
      
      // Computed properties
      isInitialValue: value === initialValue,
      invertedValue: !value,
      
      // Helper text
      statusText: value ? 'ON' : 'OFF',
      emoji: value ? '✅' : '❌',
      
      // Performance info
      lastToggleTime: lastToggleTime.current,
    };
  }, [value, initialValue, history.length]);
  
  /**
   * HISTORY MANAGEMENT
   * 
   * Functions for managing toggle history when tracking is enabled.
   */
  const clearHistory = useCallback(() => {
    if (!trackHistory) return;
    
    setHistory([]);
    if (enableLogging) {
      console.log('🗑️ useToggle: History cleared');
    }
  }, [trackHistory, enableLogging]);
  
  const getHistoryStats = useCallback(() => {
    if (!trackHistory || history.length === 0) return null;
    
    const trueToggles = history.filter(entry => entry.value === true).length;
    const falseToggles = history.filter(entry => entry.value === false).length;
    const timeSpan = history.length > 1 ? 
      history[history.length - 1].timestamp - history[0].timestamp : 0;
    
    return {
      totalToggles: history.length,
      trueToggles,
      falseToggles,
      timeSpanMs: timeSpan,
      averageToggleIntervalMs: timeSpan > 0 ? timeSpan / Math.max(1, history.length - 1) : 0,
    };
  }, [trackHistory, history]);
  
  /**
   * RETURN VALUES
   * 
   * We return the current value, all toggle functions, and metadata.
   * This provides a comprehensive API for boolean state management.
   */
  return [
    // Current state
    value,
    
    // Toggle functions (object for easier destructuring)
    {
      toggle,      // Flip current value
      setTrue,     // Explicitly set to true
      setFalse,    // Explicitly set to false
      reset,       // Reset to initial value
    },
    
    // Metadata and utilities
    {
      ...metadata,        // All computed metadata
      history,           // Toggle history array
      clearHistory,      // Clear history function
      getHistoryStats,   // Get history statistics
    }
  ];
}

/**
 * SPECIALIZED TOGGLE HOOKS
 * 
 * We can create specialized versions of useToggle for common use cases.
 */

/**
 * useModal Hook - Specialized for modal state management
 * 
 * @param {boolean} initialOpen - Initial modal state
 * @returns {Object} Modal state and controls
 */
export function useModal(initialOpen = false) {
  const [isOpen, { toggle, setTrue: open, setFalse: close, reset }] = useToggle(
    initialOpen,
    {
      onToggleTrue: () => console.log('📂 Modal opened'),
      onToggleFalse: () => console.log('📁 Modal closed'),
      trackHistory: false, // Modals don't need history tracking
    }
  );
  
  return {
    isOpen,
    open,
    close,
    toggle,
    reset,
  };
}

/**
 * useDisclosure Hook - For dropdowns, accordions, etc.
 * 
 * @param {boolean} initialDisclosed - Initial disclosure state
 * @returns {Object} Disclosure state and controls
 */
export function useDisclosure(initialDisclosed = false) {
  const [isDisclosed, controls, metadata] = useToggle(
    initialDisclosed,
    {
      onToggleTrue: () => console.log('📖 Content disclosed'),
      onToggleFalse: () => console.log('📕 Content hidden'),
      trackHistory: true, // Track disclosure patterns
    }
  );
  
  return {
    isDisclosed,
    disclose: controls.setTrue,
    hide: controls.setFalse,
    toggle: controls.toggle,
    reset: controls.reset,
    
    // Semantic aliases
    isOpen: isDisclosed,
    open: controls.setTrue,
    close: controls.setFalse,
    
    // Metadata
    metadata,
  };
}

/**
 * useFeatureFlag Hook - For feature toggling
 * 
 * @param {string} featureName - Name of the feature
 * @param {boolean} defaultEnabled - Default enabled state
 * @returns {Object} Feature flag state and controls
 */
export function useFeatureFlag(featureName, defaultEnabled = false) {
  const [isEnabled, controls, metadata] = useToggle(
    defaultEnabled,
    {
      onToggle: (newValue) => {
        console.log(`🚩 Feature "${featureName}" ${newValue ? 'enabled' : 'disabled'}`);
        
        // In a real app, you might send analytics events here
        // analytics.track('feature_toggle', { feature: featureName, enabled: newValue });
      },
      trackHistory: true,
      enableLogging: true,
    }
  );
  
  return {
    isEnabled,
    enable: controls.setTrue,
    disable: controls.setFalse,
    toggle: controls.toggle,
    reset: controls.reset,
    featureName,
    metadata,
  };
}

export default useToggle;

/**
 * COMPREHENSIVE USAGE EXAMPLES:
 * 
 * BASIC TOGGLE USAGE:
 * ```jsx
 * function SimpleToggleDemo() {
 *   const [isVisible, { toggle, setTrue, setFalse }] = useToggle(false);
 *   
 *   return (
 *     <div>
 *       <Button onClick={toggle}>
 *         {isVisible ? 'Hide' : 'Show'} Content
 *       </Button>
 *       
 *       {isVisible && (
 *         <div className="mt-4 p-4 bg-blue-50 rounded">
 *           This content is conditionally rendered based on toggle state!
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * MODAL MANAGEMENT:
 * ```jsx
 * function ModalExample() {
 *   const { isOpen, open, close, toggle } = useModal();
 *   
 *   return (
 *     <div>
 *       <Button onClick={open}>Open Modal</Button>
 *       
 *       {isOpen && (
 *         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
 *           <div className="bg-white p-6 rounded-lg">
 *             <h2>Modal Content</h2>
 *             <Button onClick={close} className="mt-4">Close</Button>
 *           </div>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * ACCORDION/DROPDOWN:
 * ```jsx
 * function AccordionItem({ title, children }) {
 *   const { isDisclosed, toggle, disclose, hide } = useDisclosure();
 *   
 *   return (
 *     <div className="border border-gray-200 rounded">
 *       <button
 *         onClick={toggle}
 *         className="w-full px-4 py-2 text-left font-medium hover:bg-gray-50"
 *       >
 *         <div className="flex items-center justify-between">
 *           {title}
 *           <span className={clsx(
 *             'transition-transform duration-200',
 *             isDisclosed ? 'rotate-90' : 'rotate-0'
 *           )}>
 *             ▶
 *           </span>
 *         </div>
 *       </button>
 *       
 *       {isDisclosed && (
 *         <div className="px-4 py-3 border-t border-gray-200">
 *           {children}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * FEATURE FLAGS:
 * ```jsx
 * function FeatureFlagDemo() {
 *   const darkMode = useFeatureFlag('darkMode', false);
 *   const animations = useFeatureFlag('animations', true);
 *   const soundEffects = useFeatureFlag('soundEffects', false);
 *   
 *   return (
 *     <div className={darkMode.isEnabled ? 'dark' : ''}>
 *       <h2>Feature Flags Demo</h2>
 *       
 *       <div className="space-y-2">
 *         <label className="flex items-center space-x-2">
 *           <input
 *             type="checkbox"
 *             checked={darkMode.isEnabled}
 *             onChange={darkMode.toggle}
 *           />
 *           <span>🌙 Dark Mode</span>
 *         </label>
 *         
 *         <label className="flex items-center space-x-2">
 *           <input
 *             type="checkbox"
 *             checked={animations.isEnabled}
 *             onChange={animations.toggle}
 *           />
 *           <span>✨ Animations</span>
 *         </label>
 *         
 *         <label className="flex items-center space-x-2">
 *           <input
 *             type="checkbox"
 *             checked={soundEffects.isEnabled}
 *             onChange={soundEffects.toggle}
 *           />
 *           <span>🔊 Sound Effects</span>
 *         </label>
 *       </div>
 *       
 *       {animations.isEnabled && (
 *         <div className="mt-4 animate-bounce">
 *           🎉 Animations are enabled!
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * ADVANCED USAGE WITH HISTORY TRACKING:
 * ```jsx
 * function AdvancedToggleDemo() {
 *   const [isOn, controls, metadata] = useToggle(false, {
 *     trackHistory: true,
 *     maxHistoryLength: 20,
 *     onToggle: (newValue, oldValue) => {
 *       console.log(`State changed from ${oldValue} to ${newValue}`);
 *     },
 *     onToggleTrue: () => {
 *       console.log('Feature activated!');
 *     },
 *     onToggleFalse: () => {
 *       console.log('Feature deactivated!');
 *     }
 *   });
 *   
 *   return (
 *     <div>
 *       <div className="flex space-x-2 mb-4">
 *         <Button onClick={controls.toggle} variant="primary">
 *           Toggle ({metadata.statusText})
 *         </Button>
 *         <Button onClick={controls.setTrue} variant="secondary">
 *           Turn On
 *         </Button>
 *         <Button onClick={controls.setFalse} variant="secondary">
 *           Turn Off
 *         </Button>
 *         <Button onClick={controls.reset} variant="ghost">
 *           Reset
 *         </Button>
 *       </div>
 *       
 *       <div className="grid grid-cols-2 gap-4">
 *         <div>
 *           <h3>Current State</h3>
 *           <div className={clsx(
 *             'p-4 rounded-lg text-center font-bold text-white',
 *             isOn ? 'bg-green-500' : 'bg-red-500'
 *           )}>
 *             {metadata.emoji} {metadata.statusText}
 *           </div>
 *           
 *           <div className="mt-2 text-sm text-gray-600">
 *             <p>Toggle count: {metadata.toggleCount}</p>
 *             {metadata.timeSinceLastToggle && (
 *               <p>Last toggle: {Math.round(metadata.timeSinceLastToggle / 1000)}s ago</p>
 *             )}
 *           </div>
 *         </div>
 *         
 *         <div>
 *           <h3>Toggle History</h3>
 *           <div className="bg-gray-50 rounded p-3 h-32 overflow-y-auto">
 *             {metadata.historyLength === 0 ? (
 *               <p className="text-gray-500 text-sm">No history yet</p>
 *             ) : (
 *               <div className="space-y-1">
 *                 {metadata.history.map((entry, index) => (
 *                   <div key={index} className="text-xs flex justify-between">
 *                     <span>
 *                       {entry.action}: {entry.value ? '✅' : '❌'}
 *                     </span>
 *                     <span className="text-gray-500">
 *                       {new Date(entry.timestamp).toLocaleTimeString()}
 *                     </span>
 *                   </div>
 *                 ))}
 *               </div>
 *             )}
 *           </div>
 *           
 *           {metadata.hasHistory && (
 *             <Button 
 *               size="small" 
 *               variant="ghost" 
 *               onClick={metadata.clearHistory}
 *               className="mt-2 w-full"
 *             >
 *               Clear History
 *             </Button>
 *           )}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 * 
 * FORM FIELD VISIBILITY:
 * ```jsx
 * function ConditionalForm() {
 *   const [showAdvanced, { toggle }] = useToggle(false);
 *   const [enableNotifications, notifControls] = useToggle(true);
 *   
 *   return (
 *     <form className="space-y-4">
 *       <div>
 *         <label htmlFor="email">Email</label>
 *         <input type="email" id="email" className="form-input" />
 *       </div>
 *       
 *       <label className="flex items-center space-x-2">
 *         <input
 *           type="checkbox"
 *           checked={showAdvanced}
 *           onChange={toggle}
 *         />
 *         <span>Show advanced options</span>
 *       </label>
 *       
 *       {showAdvanced && (
 *         <div className="space-y-3 p-4 bg-gray-50 rounded animate-fade-in">
 *           <h3>Advanced Options</h3>
 *           
 *           <label className="flex items-center space-x-2">
 *             <input
 *               type="checkbox"
 *               checked={enableNotifications}
 *               onChange={notifControls.toggle}
 *             />
 *             <span>Enable email notifications</span>
 *           </label>
 *           
 *           {enableNotifications && (
 *             <div className="ml-6">
 *               <label>
 *                 <span className="block text-sm font-medium">Notification frequency</span>
 *                 <select className="form-input mt-1">
 *                   <option>Daily</option>
 *                   <option>Weekly</option>
 *                   <option>Monthly</option>
 *                 </select>
 *               </label>
 *             </div>
 *           )}
 *         </div>
 *       )}
 *       
 *       <Button type="submit" variant="primary">
 *         Save Settings
 *       </Button>
 *     </form>
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. CUSTOM HOOK PATTERNS:
 *    - Encapsulating common boolean state logic
 *    - Providing convenient helper functions
 *    - Creating domain-specific hook variants
 * 
 * 2. CALLBACK OPTIMIZATION:
 *    - useCallback for stable function references
 *    - Dependency arrays to control when functions change
 *    - Performance benefits in child components
 * 
 * 3. STATE SYNCHRONIZATION:
 *    - Coordinating multiple state updates
 *    - Side effects with state changes
 *    - History tracking patterns
 * 
 * 4. ERROR HANDLING:
 *    - Input validation for hook parameters
 *    - Graceful callback error handling
 *    - Defensive programming practices
 * 
 * 5. METADATA PATTERNS:
 *    - Computing derived values with useMemo
 *    - Providing rich information about state
 *    - Performance and usage analytics
 * 
 * 6. HOOK COMPOSITION:
 *    - Building specialized hooks from general ones
 *    - Creating domain-specific APIs
 *    - Reusing logic across different contexts
 * 
 * This useToggle hook demonstrates how custom hooks can simplify common
 * patterns while providing educational value about React's reactive nature.
 */
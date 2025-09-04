/**
 * ReactivityShowcase Component - Complete Guide to React Reactivity
 * 
 * This component is designed specifically to demonstrate React's reactive patterns
 * and how data flows through components. It showcases:
 * 
 * 1. STATE REACTIVITY: How state changes trigger re-renders
 * 2. PROP REACTIVITY: How prop changes flow through component trees
 * 3. EFFECT REACTIVITY: How useEffect responds to dependency changes
 * 4. COMPUTED VALUES: How derived state updates automatically
 * 5. CROSS-COMPONENT COMMUNICATION: How components share reactive state
 * 6. REAL-TIME UPDATES: Simulating live data updates
 * 7. DEBOUNCED REACTIVITY: Controlling reaction timing
 * 8. OPTIMISTIC UPDATES: Immediate UI feedback patterns
 * 9. ERROR RECOVERY: How reactive systems handle errors
 * 10. PERFORMANCE OPTIMIZATION: Controlling when reactions occur
 * 
 * This component serves as both a learning tool and a testing ground
 * for understanding React's reactive nature.
 */

// React imports for reactive patterns
import React, { 
  useState,      // Basic state management
  useEffect,     // Side effects and reactions
  useCallback,   // Stable function references
  useMemo,      // Computed values
  useRef,       // Non-reactive references
  useReducer    // Complex state management
} from 'react';

// Our custom components and hooks
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';

// Utilities
import { clsx } from 'clsx';

/**
 * REDUCER FOR COMPLEX STATE MANAGEMENT
 * 
 * useReducer is perfect for complex state that involves multiple related values.
 * This demonstrates an alternative to multiple useState calls.
 */

// Action types for our reducer
const ACTIONS = {
  INCREMENT: 'increment',
  DECREMENT: 'decrement',
  RESET: 'reset',
  SET_MULTIPLIER: 'set_multiplier',
  ADD_HISTORY: 'add_history',
  CLEAR_HISTORY: 'clear_history',
};

// Initial state for our reducer
const initialCounterState = {
  count: 0,
  multiplier: 1,
  history: [],
  lastAction: null,
  actionCount: 0,
};

// Reducer function - handles all state updates
function counterReducer(state, action) {
  console.log(`🔄 Reducer action: ${action.type}`, action.payload);
  
  switch (action.type) {
    case ACTIONS.INCREMENT:
      const incrementValue = state.multiplier;
      return {
        ...state,
        count: state.count + incrementValue,
        lastAction: `+${incrementValue}`,
        actionCount: state.actionCount + 1,
        history: [
          ...state.history.slice(-9), // Keep last 9 entries
          {
            action: 'increment',
            value: incrementValue,
            timestamp: Date.now(),
            resultingCount: state.count + incrementValue,
          }
        ],
      };
      
    case ACTIONS.DECREMENT:
      const decrementValue = state.multiplier;
      return {
        ...state,
        count: Math.max(0, state.count - decrementValue), // Don't go below 0
        lastAction: `-${decrementValue}`,
        actionCount: state.actionCount + 1,
        history: [
          ...state.history.slice(-9),
          {
            action: 'decrement',
            value: decrementValue,
            timestamp: Date.now(),
            resultingCount: Math.max(0, state.count - decrementValue),
          }
        ],
      };
      
    case ACTIONS.RESET:
      return {
        ...initialCounterState,
        multiplier: state.multiplier, // Preserve multiplier
        history: [
          ...state.history.slice(-9),
          {
            action: 'reset',
            value: 0,
            timestamp: Date.now(),
            resultingCount: 0,
          }
        ],
        actionCount: state.actionCount + 1,
        lastAction: 'reset',
      };
      
    case ACTIONS.SET_MULTIPLIER:
      return {
        ...state,
        multiplier: action.payload,
        lastAction: `multiplier = ${action.payload}`,
        actionCount: state.actionCount + 1,
      };
      
    case ACTIONS.CLEAR_HISTORY:
      return {
        ...state,
        history: [],
        lastAction: 'cleared history',
        actionCount: state.actionCount + 1,
      };
      
    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

/**
 * ReactivityShowcase Component
 * 
 * The main component that demonstrates various reactive patterns.
 */
function ReactivityShowcase() {
  console.log('🔄 ReactivityShowcase component rendering...');
  
  /**
   * STATE MANAGEMENT EXAMPLES
   * 
   * We'll use different state management approaches to show their reactive behavior.
   */
  
  // Basic state with useState
  const [simpleCounter, setSimpleCounter] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [textInput, setTextInput] = useState('');
  
  // Complex state with useReducer
  const [counterState, dispatch] = useReducer(counterReducer, initialCounterState);
  
  // Persistent state with our custom hook
  const [persistentValue, setPersistentValue] = useLocalStorage('showcase_value', 'Hello World');
  const [userPreferences, setUserPreferences] = useLocalStorage('showcase_prefs', {
    theme: 'light',
    animations: true,
    soundEffects: false,
  });
  
  // Real-time timestamp state
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Async state for API simulation
  const [apiData, setApiData] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  /**
   * REFS FOR NON-REACTIVE VALUES
   * 
   * These values don't trigger re-renders when they change.
   * We use them for timers, counters, and DOM references.
   */
  const renderCountRef = useRef(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Increment render count
  renderCountRef.current++;
  
  /**
   * COMPUTED VALUES WITH useMemo
   * 
   * These values are automatically recalculated when their dependencies change.
   * This demonstrates reactive computed properties.
   */
  
  // Text analysis (recalculated when textInput changes)
  const textAnalysis = useMemo(() => {
    console.log(`🧮 Computing text analysis for: "${textInput}"`);
    
    const text = textInput.toLowerCase();
    return {
      length: textInput.length,
      wordCount: textInput.trim() ? textInput.trim().split(/\s+/).length : 0,
      characterCount: textInput.length,
      vowelCount: (text.match(/[aeiou]/g) || []).length,
      consonantCount: (text.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length,
      hasNumbers: /\d/.test(text),
      hasSpecialChars: /[^a-zA-Z0-9\s]/.test(text),
      reversed: textInput.split('').reverse().join(''),
      isPalindrome: text.replace(/[^a-z]/g, '') === text.replace(/[^a-z]/g, '').split('').reverse().join(''),
    };
  }, [textInput]); // Only recalculates when textInput changes
  
  // Counter statistics (recalculated when counterState changes)
  const counterStats = useMemo(() => {
    console.log('🧮 Computing counter statistics');
    
    return {
      isEven: counterState.count % 2 === 0,
      isPositive: counterState.count > 0,
      squaredValue: counterState.count * counterState.count,
      percentage: Math.min(100, (counterState.count / 50) * 100),
      binaryRepresentation: counterState.count.toString(2),
      romanNumeral: toRoman(Math.min(counterState.count, 100)),
      nextPrime: findNextPrime(counterState.count),
    };
  }, [counterState.count]);
  
  // User preference analysis
  const preferencesAnalysis = useMemo(() => {
    const activeFeatures = Object.entries(userPreferences)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
      
    return {
      activeFeatures,
      featureCount: activeFeatures.length,
      isFullyEnabled: activeFeatures.length === Object.keys(userPreferences).length,
      themeName: userPreferences.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode',
    };
  }, [userPreferences]);
  
  /**
   * EFFECT DEMONSTRATIONS
   * 
   * These effects show how React responds to changes automatically.
   */
  
  // Real-time clock effect
  useEffect(() => {
    console.log('⏰ Setting up real-time clock');
    
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log('🧹 Clock timer cleaned up');
      }
    };
  }, []); // Empty dependencies - runs once on mount
  
  // Document title update effect
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `Counter: ${simpleCounter} | Reactivity Demo`;
    
    console.log(`📝 Document title updated: ${document.title}`);
    
    // Restore original title on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [simpleCounter]); // Updates when simpleCounter changes
  
  // Console logging effect for debugging
  useEffect(() => {
    console.log(`🔍 Component state changed:`, {
      simpleCounter,
      complexCounter: counterState.count,
      textLength: textInput.length,
      renderCount: renderCountRef.current,
    });
  }, [simpleCounter, counterState.count, textInput.length]);
  
  // Persistent value effect (demonstrates localStorage reactivity)
  useEffect(() => {
    console.log(`💾 Persistent value changed: "${persistentValue}"`);
    
    // Could trigger other side effects here
    // - Analytics tracking
    // - API calls
    // - Local notifications
    
  }, [persistentValue]);
  
  /**
   * EVENT HANDLERS WITH REACTIVE PATTERNS
   * 
   * These handlers demonstrate how to update state reactively.
   */
  
  // Simple counter handlers
  const incrementSimple = useCallback(() => {
    console.log('📈 Incrementing simple counter');
    setSimpleCounter(prev => prev + 1); // Functional update
  }, []);
  
  const decrementSimple = useCallback(() => {
    console.log('📉 Decrementing simple counter');
    setSimpleCounter(prev => Math.max(0, prev - 1));
  }, []);
  
  const resetSimple = useCallback(() => {
    console.log('🔄 Resetting simple counter');
    setSimpleCounter(0);
  }, []);
  
  // Complex counter handlers (using reducer actions)
  const incrementComplex = useCallback(() => {
    dispatch({ type: ACTIONS.INCREMENT });
  }, []);
  
  const decrementComplex = useCallback(() => {
    dispatch({ type: ACTIONS.DECREMENT });
  }, []);
  
  const resetComplex = useCallback(() => {
    dispatch({ type: ACTIONS.RESET });
  }, []);
  
  const setMultiplier = useCallback((newMultiplier) => {
    dispatch({ 
      type: ACTIONS.SET_MULTIPLIER, 
      payload: newMultiplier 
    });
  }, []);
  
  // Text input handler with reactive analysis
  const handleTextChange = useCallback((event) => {
    const newText = event.target.value;
    console.log(`📝 Text input changed: "${newText}"`);
    setTextInput(newText);
    // The textAnalysis will automatically update due to useMemo dependency
  }, []);
  
  // Preference update handlers
  const updatePreference = useCallback((key, value) => {
    console.log(`⚙️ Updating preference ${key} to:`, value);
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setUserPreferences]);
  
  // Simulate API call with reactive updates
  const simulateApiCall = useCallback(async () => {
    console.log('🌐 Simulating API call...');
    
    setApiLoading(true);
    setApiError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random API response
      const randomData = {
        id: Math.floor(Math.random() * 1000),
        message: `Data fetched at ${new Date().toLocaleTimeString()}`,
        randomNumber: Math.floor(Math.random() * 100),
        timestamp: Date.now(),
      };
      
      setApiData(randomData);
      console.log('✅ API call completed:', randomData);
      
    } catch (error) {
      setApiError(error.message);
      console.error('❌ API call failed:', error);
    } finally {
      setApiLoading(false);
    }
  }, []);
  
  /**
   * ADVANCED REACTIVE PATTERNS
   * 
   * These demonstrate more sophisticated reactivity concepts.
   */
  
  // Auto-incrementing counter with cleanup
  useEffect(() => {
    if (!isActive) return; // Only run when active
    
    console.log('🏃 Starting auto-increment timer');
    
    const interval = setInterval(() => {
      setSimpleCounter(prev => prev + 1);
    }, 3000); // Increment every 3 seconds
    
    return () => {
      clearInterval(interval);
      console.log('🛑 Auto-increment timer stopped');
    };
  }, [isActive]); // Restart when isActive changes
  
  // Reactive local storage sync
  useEffect(() => {
    // Sync complex counter to localStorage
    const key = 'complex_counter_backup';
    const data = {
      count: counterState.count,
      multiplier: counterState.multiplier,
      lastSaved: Date.now(),
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log('💾 Complex counter synced to localStorage');
    
  }, [counterState.count, counterState.multiplier]);
  
  /**
   * DEBOUNCED REACTIVE EFFECT
   * 
   * This shows how to create debounced reactions for performance.
   */
  const debouncedTextRef = useRef('');
  const debounceTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedTextRef.current = textInput;
      console.log(`⏱️ Debounced text update: "${textInput}"`);
      
      // This could trigger API calls, expensive computations, etc.
      // without overwhelming the system with rapid changes
      
    }, 500); // 500ms debounce
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [textInput]);
  
  /**
   * RENDER OPTIMIZATION TRACKING
   * 
   * Track render frequency for educational purposes.
   */
  const lastRenderTime = useRef(Date.now());
  const renderInterval = Date.now() - lastRenderTime.current;
  lastRenderTime.current = Date.now();
  
  console.log(`🎨 ReactivityShowcase render #${renderCountRef.current} (${renderInterval}ms since last)`);
  
  /**
   * COMPONENT RENDER
   * 
   * The visual representation with reactive elements highlighted.
   */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Header Section */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          React Reactivity Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Watch how different parts of the UI react to state changes in real-time
        </p>
        
        {/* Render Information */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">Render #{renderCountRef.current}</span>
            {renderInterval > 0 && (
              <span className="ml-2">
                ({renderInterval}ms since last render)
              </span>
            )}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Current time: {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </header>
      
      {/* Simple State Reactivity */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Basic State Reactivity</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Watch how the UI instantly updates when state changes. The counter value 
          appears in multiple places and all update simultaneously.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Counter Controls */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button size="small" onClick={decrementSimple}>-</Button>
                <Button size="small" onClick={incrementSimple}>+</Button>
                <Button size="small" variant="secondary" onClick={resetSimple}>Reset</Button>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-gray-700 dark:text-gray-300">Auto-increment every 3 seconds</span>
              </label>
            </div>
          </div>
          
          {/* Reactive Displays */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Reactive Displays</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Simple Counter:</span>
                <span className="font-bold text-blue-600">{simpleCounter}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Doubled:</span>
                <span className="font-bold text-green-600">{simpleCounter * 2}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Progress:</span>
                <div className="flex-1 ml-2">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (simpleCounter / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-gray-700 dark:text-gray-300">Status:</span>
                <Badge 
                  variant={simpleCounter === 0 ? 'default' : simpleCounter < 10 ? 'info' : 'success'}
                >
                  {simpleCounter === 0 ? 'Start' : simpleCounter < 10 ? 'Getting Started' : 'Pro Level!'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Complex State with useReducer */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Complex State Reactivity (useReducer)</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This demonstrates how useReducer manages complex, related state updates.
          Notice how multiple values change together in a coordinated way.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Complex Counter Controls */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Advanced Controls</h3>
            
            {/* Multiplier Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Multiplier (affects increment/decrement amount)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 5, 10].map(mult => (
                  <Button
                    key={mult}
                    size="small"
                    variant={counterState.multiplier === mult ? 'primary' : 'secondary'}
                    onClick={() => setMultiplier(mult)}
                  >
                    ×{mult}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button size="medium" onClick={decrementComplex}>
                  -{counterState.multiplier}
                </Button>
                <Button size="medium" onClick={incrementComplex}>
                  +{counterState.multiplier}
                </Button>
                <Button size="medium" variant="secondary" onClick={resetComplex}>
                  Reset
                </Button>
              </div>
              
              <Button 
                size="small" 
                variant="ghost" 
                onClick={() => dispatch({ type: ACTIONS.CLEAR_HISTORY })}
                className="w-full"
              >
                Clear History
              </Button>
            </div>
          </div>
          
          {/* Complex State Displays */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">State Overview</h3>
            
            {/* Main Counter Display */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {counterState.count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Last action: {counterState.lastAction || 'none'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total actions: {counterState.actionCount}
                </div>
              </div>
            </div>
            
            {/* Computed Statistics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Even/Odd:</span>
                <Badge variant={counterStats.isEven ? 'info' : 'warning'}>
                  {counterStats.isEven ? 'Even' : 'Odd'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Squared:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{counterStats.squaredValue}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Binary:</span>
                <span className="font-mono text-xs text-gray-900 dark:text-gray-100">{counterStats.binaryRepresentation}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Roman:</span>
                <span className="font-serif text-gray-900 dark:text-gray-100">{counterStats.romanNumeral}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action History */}
        {counterState.history.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Action History (Last 10)</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="space-y-1 text-sm font-mono text-gray-700 dark:text-gray-300">
                {counterState.history.slice(-10).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>
                      {entry.action} {entry.value} → {entry.resultingCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Text Input Reactivity */}
      <section className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Input Reactivity & Computed Values</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Type in the input below and watch how multiple computed values 
          update automatically. This demonstrates reactive computed properties.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type anything to see reactive analysis:
            </label>
            <textarea
              ref={inputRef}
              value={textInput}
              onChange={handleTextChange}
              className="form-input h-24 resize-none"
              placeholder="Start typing to see reactive updates..."
            />
            
            {/* Character Count with Reactive Color */}
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Characters: {textAnalysis.characterCount}</span>
              <span className={clsx(
                textAnalysis.characterCount > 50 ? 'text-red-500' : 
                textAnalysis.characterCount > 25 ? 'text-yellow-600' : 'text-gray-500'
              )}>
                {textAnalysis.characterCount > 50 ? 'Long text' : 
                 textAnalysis.characterCount > 25 ? 'Medium text' : 'Short text'}
              </span>
            </div>
          </div>
          
          {/* Reactive Analysis Display */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Live Text Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <div className="font-medium text-blue-800 dark:text-blue-200">Words</div>
                  <div className="text-xl font-bold text-blue-600">
                    {textAnalysis.wordCount}
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <div className="font-medium text-green-800 dark:text-green-200">Vowels</div>
                  <div className="text-xl font-bold text-green-600">
                    {textAnalysis.vowelCount}
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">Consonants</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {textAnalysis.consonantCount}
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  <div className="font-medium text-purple-800 dark:text-purple-200">Special</div>
                  <div className="text-xl font-bold text-purple-600">
                    {textAnalysis.hasSpecialChars ? '✓' : '✗'}
                  </div>
                </div>
              </div>
              
              {/* Advanced Analysis */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Contains numbers:</span>
                  <Badge variant={textAnalysis.hasNumbers ? 'success' : 'default'}>
                    {textAnalysis.hasNumbers ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span>Is palindrome:</span>
                  <Badge variant={textAnalysis.isPalindrome ? 'success' : 'default'}>
                    {textAnalysis.isPalindrome ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                {textInput.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <strong>Reversed:</strong> {textAnalysis.reversed}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Persistent State Reactivity */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">4. Persistent State Reactivity</h2>
        <p className="text-gray-600 mb-4">
          This section demonstrates how state can persist across browser sessions
          and sync between tabs. Open this page in another tab to see cross-tab reactivity!
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Persistent Text */}
          <div>
            <h3 className="font-medium mb-3">Persistent Message</h3>
            <input
              type="text"
              value={persistentValue}
              onChange={(e) => setPersistentValue(e.target.value)}
              className="form-input mb-2"
              placeholder="This value persists between sessions"
            />
            <p className="text-xs text-gray-500">
              This value is automatically saved to localStorage and will 
              persist even if you refresh the page or close the browser.
            </p>
          </div>
          
          {/* User Preferences */}
          <div>
            <h3 className="font-medium mb-3">User Preferences</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="theme"
                  checked={userPreferences.theme === 'light'}
                  onChange={() => updatePreference('theme', 'light')}
                  className="text-blue-600"
                />
                <span>☀️ Light theme</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="theme"
                  checked={userPreferences.theme === 'dark'}
                  onChange={() => updatePreference('theme', 'dark')}
                  className="text-blue-600"
                />
                <span>🌙 Dark theme</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={userPreferences.animations}
                  onChange={(e) => updatePreference('animations', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>✨ Enable animations</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={userPreferences.soundEffects}
                  onChange={(e) => updatePreference('soundEffects', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>🔊 Sound effects</span>
              </label>
            </div>
            
            {/* Preferences Summary */}
            <div className="mt-4 p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-800">
                <strong>Current theme:</strong> {preferencesAnalysis.themeName}
              </p>
              <p className="text-sm text-purple-800">
                <strong>Features enabled:</strong> {preferencesAnalysis.featureCount}/3
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Async State Reactivity */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">5. Async State Reactivity</h2>
        <p className="text-gray-600 mb-4">
          Watch how the UI reacts to asynchronous operations like API calls.
          Notice the loading states, error handling, and success states.
        </p>
        
        <div className="text-center mb-4">
          <Button 
            onClick={simulateApiCall}
            loading={apiLoading}
            disabled={apiLoading}
            variant="primary"
          >
            {apiLoading ? 'Fetching Data...' : 'Simulate API Call'}
          </Button>
        </div>
        
        {/* API State Display */}
        <div className="space-y-4">
          {/* Loading State */}
          {apiLoading && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-800 font-medium">Loading...</p>
                  <p className="text-blue-600 text-sm">Making API request</p>
                </div>
              </div>
              
              {/* Progress bar simulation */}
              <div className="mt-3 bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-2/3"></div>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {apiData && !apiLoading && !apiError && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-medium">API Call Successful</p>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>ID:</strong> {apiData.id}</p>
                    <p><strong>Message:</strong> {apiData.message}</p>
                    <p><strong>Random Number:</strong> {apiData.randomNumber}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Fetched: {new Date(apiData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {apiError && !apiLoading && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">✗</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">API Call Failed</p>
                  <p className="text-red-700 text-sm mt-1">{apiError}</p>
                  <Button 
                    size="small" 
                    variant="danger" 
                    onClick={simulateApiCall}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!apiData && !apiLoading && !apiError && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
              <p className="text-gray-600">No data yet. Click the button above to fetch some data!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Reactive Connectivity */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">6. Cross-Component Reactivity</h2>
        <p className="text-gray-600 mb-4">
          Watch how changes in one section automatically affect other sections.
          This demonstrates reactive data flow between components.
        </p>
        
        {/* Reactive Connections Visualization */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Simple Counter Reflection */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-indigo-800 mb-2">Simple Counter</h4>
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {simpleCounter}
              </div>
              <div className="text-xs text-gray-500">
                Updates: Auto + Manual
              </div>
            </div>
            
            {/* Complex Counter Reflection */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-purple-800 mb-2">Complex Counter</h4>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {counterState.count}
              </div>
              <div className="text-xs text-gray-500">
                Multiplier: ×{counterState.multiplier}
              </div>
            </div>
            
            {/* Combined Values */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-green-800 mb-2">Combined</h4>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {simpleCounter + counterState.count}
              </div>
              <div className="text-xs text-gray-500">
                Simple + Complex
              </div>
            </div>
          </div>
          
          {/* Reactive Relationship Diagram */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              ↕️ These values are all connected reactively ↕️
            </p>
            <div className="text-xs text-gray-500">
              Changes in any value automatically update all related displays
            </div>
          </div>
        </div>
      </section>
      
      {/* Performance Monitoring */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">7. Performance & Render Tracking</h2>
        <p className="text-gray-600 mb-4">
          This section shows how often React re-renders components and helps
          understand the performance implications of different reactive patterns.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-yellow-700">
                {renderCountRef.current}
              </div>
              <div className="text-xs text-yellow-600">Total Renders</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-yellow-700">
                {renderInterval}ms
              </div>
              <div className="text-xs text-yellow-600">Since Last Render</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-yellow-700">
                {counterState.actionCount}
              </div>
              <div className="text-xs text-yellow-600">State Actions</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-yellow-700">
                {textAnalysis.length}
              </div>
              <div className="text-xs text-yellow-600">Input Length</div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-yellow-700 text-center">
            💡 Tip: Open browser DevTools to see detailed console logs of reactive updates
          </div>
        </div>
      </section>
      
    </div>
  );
}

/**
 * UTILITY FUNCTIONS FOR COMPUTED VALUES
 * 
 * These helper functions demonstrate how to create reusable computations
 * that can be used in reactive contexts.
 */

// Convert number to Roman numerals (for educational fun)
function toRoman(num) {
  if (num <= 0 || num > 100) return num.toString();
  
  const values = [100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = ['C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  
  let result = '';
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  return result;
}

// Find next prime number (for mathematical computation example)
function findNextPrime(num) {
  if (num < 2) return 2;
  
  let candidate = num + 1;
  while (candidate < num + 50) { // Limit search range
    if (isPrime(candidate)) return candidate;
    candidate++;
  }
  return candidate;
}

// Check if number is prime
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Reusable Badge component
function Badge({ children, variant = 'default', className = '' }) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}

export default ReactivityShowcase;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. MULTIPLE STATE TYPES:
 *    - useState for simple values
 *    - useReducer for complex, related state
 *    - useLocalStorage for persistent state
 *    - useRef for non-reactive values
 * 
 * 2. REACTIVE COMPUTATIONS:
 *    - useMemo for expensive calculations
 *    - Automatic updates when dependencies change
 *    - Performance optimization through memoization
 * 
 * 3. EFFECT PATTERNS:
 *    - Timer effects with cleanup
 *    - State synchronization effects
 *    - Debounced effects for performance
 *    - Document modification effects
 * 
 * 4. COMPONENT COMMUNICATION:
 *    - Props flowing down
 *    - Callbacks flowing up
 *    - Shared state through custom hooks
 *    - Cross-tab communication
 * 
 * 5. PERFORMANCE MONITORING:
 *    - Render counting and timing
 *    - Understanding re-render triggers
 *    - Optimization opportunities identification
 * 
 * 6. REAL-WORLD PATTERNS:
 *    - Form state management
 *    - API call lifecycle
 *    - User preference handling
 *    - Live data updates
 * 
 * This component serves as a comprehensive demonstration of React's
 * reactive capabilities and provides a foundation for understanding
 * how data flows and updates propagate through React applications.
 */
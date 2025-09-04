/**
 * AdvancedPatternsShowcase Component - Professional React Patterns
 * 
 * This component demonstrates advanced React patterns that are commonly used
 * in production applications. It serves as a comprehensive educational resource
 * for understanding sophisticated React development techniques:
 * 
 * 1. RENDER PROPS PATTERN: Flexible component composition with function children
 * 2. HIGHER-ORDER COMPONENTS (HOCs): Component enhancement and reuse
 * 3. COMPOUND COMPONENTS: Components that work together as a cohesive API
 * 4. CONTROLLED VS UNCONTROLLED: Different component control patterns
 * 5. FORWARDED REFS: Proper ref handling in component hierarchies
 * 6. PORTAL USAGE: Rendering outside the component tree
 * 7. SUSPENSE INTEGRATION: Handling async components gracefully
 * 8. ERROR TESTING: Demonstrating error boundary functionality
 * 9. PERFORMANCE PATTERNS: Advanced optimization techniques
 * 10. ACCESSIBILITY PATTERNS: Complex a11y implementations
 * 
 * Each pattern includes comprehensive explanations and practical examples.
 */

// React imports for advanced patterns
import React, { 
  Component,
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  forwardRef,
  createPortal,
  Suspense,
  lazy
} from 'react';

// Our components and hooks
import Button from '../ui/Button.jsx';
import ErrorBoundary, { useErrorHandler, DevErrorBoundary } from '../ui/ErrorBoundary.jsx';
import { useAppContext, useNotifications } from '../../contexts/AppContext.jsx';

// Utilities
import { clsx } from 'clsx';

/**
 * RENDER PROPS PATTERN DEMONSTRATION
 * 
 * The render props pattern allows components to share code through a prop
 * whose value is a function. This creates highly flexible and reusable components.
 */

/**
 * DataFetcher - Render Props Example
 * 
 * This component handles data fetching logic and lets the parent component
 * decide how to render the data through a render prop function.
 */
function DataFetcher({ url, render, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    console.log(`📡 DataFetcher: Fetching data from ${url}`);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data based on URL
      const mockData = {
        id: Date.now(),
        url: url,
        data: `Mock data for ${url}`,
        timestamp: Date.now(),
        items: Array.from({ length: 5 }, (_, i) => ({
          id: i,
          name: `Item ${i + 1}`,
          value: Math.random() * 100
        }))
      };
      
      setData(mockData);
      console.log('✅ DataFetcher: Data loaded successfully');
    } catch (err) {
      setError(err);
      console.error('❌ DataFetcher: Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [url]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Render using render prop or children function
  const renderFunction = render || children;
  
  if (typeof renderFunction !== 'function') {
    throw new Error('DataFetcher requires a render prop or children function');
  }
  
  return renderFunction({ data, loading, error, refetch: fetchData });
}

/**
 * HIGHER-ORDER COMPONENT (HOC) DEMONSTRATION
 * 
 * HOCs are functions that take a component and return a new component
 * with enhanced functionality. While hooks have largely replaced HOCs,
 * understanding them is important for legacy code and specific use cases.
 */

/**
 * withLoading HOC - Adds loading state to any component
 * 
 * @param {React.Component} WrappedComponent - Component to enhance
 * @returns {React.Component} Enhanced component with loading functionality
 */
function withLoading(WrappedComponent) {
  // HOC component definition
  function LoadingHOC(props) {
    const [isLoading, setIsLoading] = useState(false);
    
    console.log(`🔄 withLoading HOC: Rendering enhanced component, loading = ${isLoading}`);
    
    // Enhanced props with loading functionality
    const enhancedProps = {
      ...props,
      isLoading,
      setLoading: setIsLoading,
      startLoading: () => setIsLoading(true),
      stopLoading: () => setIsLoading(false),
    };
    
    // Show loading overlay if loading
    if (isLoading) {
      return (
        <div className="relative">
          <div className="opacity-50 pointer-events-none">
            <WrappedComponent {...enhancedProps} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...enhancedProps} />;
  }
  
  // Set display name for debugging
  LoadingHOC.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return LoadingHOC;
}

/**
 * COMPOUND COMPONENTS PATTERN
 * 
 * Compound components work together to form a cohesive API.
 * They share state implicitly and provide a flexible, composable interface.
 */

/**
 * Card Compound Component System
 * 
 * This creates a flexible card system where Header, Body, and Footer
 * can be composed in different ways.
 */
const CardContext = React.createContext();

function Card({ children, className = '', ...props }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue = useMemo(() => ({
    isExpanded,
    setIsExpanded,
    isLoading,
    setIsLoading,
    toggleExpanded: () => setIsExpanded(prev => !prev),
  }), [isExpanded, isLoading]);
  
  return (
    <CardContext.Provider value={contextValue}>
      <div className={clsx('card', className)} {...props}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

function CardHeader({ children, expandable = false, className = '' }) {
  const context = React.useContext(CardContext);
  
  const handleClick = expandable ? context?.toggleExpanded : undefined;
  
  return (
    <div 
      className={clsx(
        'p-4 border-b border-gray-200 bg-gray-50',
        expandable && 'cursor-pointer hover:bg-gray-100',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        {children}
        {expandable && (
          <span className={clsx(
            'text-gray-400 transition-transform duration-200',
            context?.isExpanded ? 'rotate-180' : 'rotate-0'
          )}>
            ▼
          </span>
        )}
      </div>
    </div>
  );
}

function CardBody({ children, className = '' }) {
  const context = React.useContext(CardContext);
  
  return (
    <div className={clsx(
      'p-4 transition-all duration-200',
      context?.isExpanded === false && 'hidden',
      className
    )}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('p-4 border-t border-gray-200 bg-gray-50', className)}>
      {children}
    </div>
  );
}

// Add sub-components as properties
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

/**
 * FORWARDED REF PATTERN
 * 
 * This demonstrates how to properly forward refs through component hierarchies.
 */
const FancyInput = forwardRef(function FancyInput(
  { label, error, className = '', ...props }, 
  ref
) {
  console.log('📝 FancyInput: Rendering with forwarded ref');
  
  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={clsx(
          'form-input',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

/**
 * PORTAL DEMONSTRATION
 * 
 * Portals allow rendering components outside the normal component tree.
 * This is useful for modals, tooltips, and overlays.
 */
function Portal({ children, target = 'portal-root' }) {
  const [portalRoot, setPortalRoot] = useState(null);
  
  useEffect(() => {
    // Create or find the portal target element
    let targetElement = document.getElementById(target);
    
    if (!targetElement) {
      targetElement = document.createElement('div');
      targetElement.id = target;
      targetElement.className = 'portal-container';
      document.body.appendChild(targetElement);
      
      console.log(`🚪 Portal: Created new portal target #${target}`);
    }
    
    setPortalRoot(targetElement);
    
    return () => {
      // Cleanup: remove portal target if empty
      if (targetElement && targetElement.children.length === 0 && targetElement.id !== 'portal-root') {
        document.body.removeChild(targetElement);
        console.log(`🧹 Portal: Cleaned up portal target #${target}`);
      }
    };
  }, [target]);
  
  if (!portalRoot) return null;
  
  return createPortal(children, portalRoot);
}

/**
 * ERROR TESTING COMPONENT
 * 
 * This component provides buttons to test different types of errors
 * and demonstrate how error boundaries handle them.
 */
function ErrorTester() {
  const [shouldError, setShouldError] = useState(false);
  const [errorType, setErrorType] = useState('render');
  const { captureError } = useErrorHandler();
  const notifications = useNotifications();
  
  // Throw error on next render if shouldError is true
  if (shouldError && errorType === 'render') {
    throw new Error(`Simulated ${errorType} error for testing error boundary`);
  }
  
  const throwAsyncError = useCallback(async () => {
    try {
      throw new Error('Simulated async error');
    } catch (error) {
      captureError(error, { type: 'async_test' });
      notifications.showError('Async error captured by custom handler');
    }
  }, [captureError, notifications]);
  
  const throwNetworkError = useCallback(() => {
    throw new Error('Network request failed: Connection timeout');
  }, []);
  
  const throwValidationError = useCallback(() => {
    throw new Error('Validation failed: Required prop missing');
  }, []);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Error Boundary Testing</h3>
      <p className="text-gray-600 text-sm">
        Test different types of errors to see how error boundaries handle them.
        These buttons will intentionally throw errors to demonstrate error handling.
      </p>
      
      {/* Error Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Error Type to Test
        </label>
        <div className="flex space-x-2">
          {['render', 'async', 'network', 'validation'].map(type => (
            <Button
              key={type}
              size="small"
              variant={errorType === type ? 'primary' : 'secondary'}
              onClick={() => setErrorType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Error Trigger Buttons */}
      <div className="flex space-x-2">
        <Button
          variant="danger"
          size="small"
          onClick={() => {
            switch (errorType) {
              case 'render':
                setShouldError(true);
                break;
              case 'async':
                throwAsyncError();
                break;
              case 'network':
                throwNetworkError();
                break;
              case 'validation':
                throwValidationError();
                break;
            }
          }}
        >
          🚨 Throw {errorType} Error
        </Button>
        
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShouldError(false)}
        >
          🧹 Clear Error State
        </Button>
      </div>
      
      {/* Error Warning */}
      <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
        ⚠️ <strong>Warning:</strong> These buttons will intentionally cause errors 
        to demonstrate error boundary functionality. The error boundary will catch 
        them and display appropriate fallback UI.
      </div>
    </div>
  );
}

/**
 * SUSPENSE DEMONSTRATION
 * 
 * Shows how React Suspense works with lazy-loaded components and async operations.
 */

// Lazy-loaded component for Suspense demo
const LazyComponent = lazy(() => new Promise(resolve => {
  setTimeout(() => {
    resolve({
      default: function LazyLoadedComponent() {
        return (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              🎉 Lazy Component Loaded!
            </h4>
            <p className="text-green-800 text-sm">
              This component was loaded asynchronously using React.lazy() and Suspense.
              It demonstrates code splitting and progressive loading patterns.
            </p>
            <div className="mt-3 text-xs text-green-600">
              Loaded at: {new Date().toLocaleTimeString()}
            </div>
          </div>
        );
      }
    });
  }, 2000); // 2 second loading delay for demonstration
}));

/**
 * PERFORMANCE OPTIMIZATION EXAMPLES
 * 
 * Components that demonstrate various React performance optimization techniques.
 */

// Expensive computation for demo purposes
const expensiveCalculation = (number) => {
  console.log(`🧮 Performing expensive calculation for: ${number}`);
  let result = 0;
  for (let i = 0; i < number * 100000; i++) {
    result += Math.sqrt(i);
  }
  return result.toFixed(2);
};

/**
 * MemoizedExpensiveComponent - Demonstrates React.memo
 */
const MemoizedExpensiveComponent = React.memo(function ExpensiveComponent({ number, onCalculate }) {
  console.log(`💎 MemoizedExpensiveComponent rendering for number: ${number}`);
  
  // This expensive calculation will only run when 'number' changes
  const result = useMemo(() => expensiveCalculation(number), [number]);
  
  return (
    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
      <h4 className="font-medium text-purple-900 mb-2">
        🧮 Expensive Calculation Component
      </h4>
      <p className="text-purple-800 text-sm mb-2">
        This component only re-renders when the number prop changes,
        thanks to React.memo optimization.
      </p>
      <div className="bg-white p-2 rounded border">
        <div className="text-sm text-gray-600">Input: {number}</div>
        <div className="font-mono text-lg font-bold text-purple-600">
          Result: {result}
        </div>
      </div>
      <Button 
        size="small" 
        variant="ghost" 
        onClick={() => onCalculate(result)}
        className="mt-2"
      >
        Use Result
      </Button>
    </div>
  );
});

/**
 * MAIN SHOWCASE COMPONENT
 * 
 * The main component that demonstrates all advanced patterns.
 */
function AdvancedPatternsShowcase() {
  console.log('🎭 AdvancedPatternsShowcase component rendering...');
  
  /**
   * STATE FOR PATTERN DEMONSTRATIONS
   */
  const [currentPattern, setCurrentPattern] = useState('render-props');
  const [showLazyComponent, setShowLazyComponent] = useState(false);
  const [showPortalDemo, setShowPortalDemo] = useState(false);
  const [expensiveNumber, setExpensiveNumber] = useState(5);
  const [calculationResults, setCalculationResults] = useState([]);
  
  // Ref for forwarded ref demonstration
  const fancyInputRef = useRef(null);
  
  // Context for accessing app-wide state
  const appContext = useAppContext();
  const notifications = useNotifications();
  
  /**
   * PATTERN NAVIGATION
   */
  const patterns = [
    { id: 'render-props', title: 'Render Props', emoji: '🎭' },
    { id: 'hoc', title: 'Higher-Order Components', emoji: '🎪' },
    { id: 'compound', title: 'Compound Components', emoji: '🧩' },
    { id: 'refs', title: 'Forwarded Refs', emoji: '👉' },
    { id: 'portals', title: 'Portals', emoji: '🚪' },
    { id: 'suspense', title: 'Suspense', emoji: '⏳' },
    { id: 'performance', title: 'Performance', emoji: '🚀' },
    { id: 'errors', title: 'Error Handling', emoji: '🚨' },
  ];
  
  /**
   * EVENT HANDLERS
   */
  const handlePatternChange = useCallback((patternId) => {
    console.log(`🎯 Switching to pattern: ${patternId}`);
    setCurrentPattern(patternId);
  }, []);
  
  const handleFocusInput = useCallback(() => {
    if (fancyInputRef.current) {
      fancyInputRef.current.focus();
      notifications.showInfo('Input focused via forwarded ref!');
    }
  }, [notifications]);
  
  const handleCalculationResult = useCallback((result) => {
    setCalculationResults(prev => [
      ...prev.slice(-4), // Keep last 4 results
      {
        input: expensiveNumber,
        result,
        timestamp: Date.now(),
      }
    ]);
    notifications.showSuccess(`Calculation completed: ${result}`);
  }, [expensiveNumber, notifications]);
  
  /**
   * PATTERN RENDERERS
   * 
   * Functions that render different pattern demonstrations.
   */
  const renderRenderPropsDemo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Render Props Pattern</h3>
        <p className="text-gray-600 mb-4">
          The render props pattern uses a function prop to share code between components.
          The DataFetcher component handles the logic, while the parent controls rendering.
        </p>
      </div>
      
      {/* DataFetcher with different render functions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Table Rendering */}
        <DataFetcher url="/api/movies">
          {({ data, loading, error, refetch }) => (
            <div>
              <h4 className="font-medium mb-3">Table Render (Render Prop)</h4>
              {loading && (
                <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800">
                  Error: {error.message}
                </div>
              )}
              {data && (
                <div className="bg-white border rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Item
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.value.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data && (
                <Button size="small" variant="ghost" onClick={refetch} className="mt-2">
                  🔄 Refetch
                </Button>
              )}
            </div>
          )}
        </DataFetcher>
        
        {/* Card Rendering */}
        <DataFetcher url="/api/stats">
          {({ data, loading, error, refetch }) => (
            <div>
              <h4 className="font-medium mb-3">Card Render (Children Function)</h4>
              {loading && (
                <div className="space-y-2">
                  <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800">
                  Failed to load stats
                </div>
              )}
              {data && (
                <div className="space-y-2">
                  {data.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-blue-900 font-medium">{item.name}</span>
                      <span className="text-blue-600">{item.value.toFixed(1)}</span>
                    </div>
                  ))}
                  <Button size="small" variant="ghost" onClick={refetch}>
                    🔄 Refresh Stats
                  </Button>
                </div>
              )}
            </div>
          )}
        </DataFetcher>
      </div>
    </div>
  );
  
  const renderCompoundDemo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Compound Components Pattern</h3>
        <p className="text-gray-600 mb-4">
          Compound components work together as a unified API, sharing state implicitly.
          This creates flexible, composable interfaces that are easy to use and maintain.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expandable Card */}
        <Card>
          <Card.Header expandable>
            <h4 className="font-medium">Expandable Card Demo</h4>
          </Card.Header>
          <Card.Body>
            <p className="text-gray-600 text-sm mb-3">
              This content is inside the Card.Body component. It's only visible
              when the card is expanded. Click the header to toggle visibility.
            </p>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-blue-800 text-sm">
                💡 The header and body components share state automatically
                through React Context, creating a seamless compound component API.
              </p>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Card Footer</span>
              <Button size="small" variant="ghost">Action</Button>
            </div>
          </Card.Footer>
        </Card>
        
        {/* Static Card */}
        <Card>
          <Card.Header>
            <h4 className="font-medium">Static Card Demo</h4>
          </Card.Header>
          <Card.Body>
            <p className="text-gray-600 text-sm">
              This card doesn't have the expandable prop, so the header
              doesn't respond to clicks and the body is always visible.
            </p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="text-green-600 font-bold">42</div>
                <div className="text-xs text-green-800">Metric A</div>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <div className="text-purple-600 font-bold">73</div>
                <div className="text-xs text-purple-800">Metric B</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
  
  const renderPerformanceDemo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Performance Optimization Demo</h3>
        <p className="text-gray-600 mb-4">
          This demonstrates React.memo, useMemo, and useCallback optimizations.
          Watch the console to see when components re-render and calculations execute.
        </p>
      </div>
      
      {/* Expensive Calculation Control */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium">
            Calculation Input: {expensiveNumber}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={expensiveNumber}
            onChange={(e) => setExpensiveNumber(parseInt(e.target.value))}
            className="flex-1"
          />
          <Button
            size="small"
            variant="secondary"
            onClick={() => setExpensiveNumber(Math.floor(Math.random() * 20) + 1)}
          >
            🎲 Random
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Change the value above. The expensive calculation only runs when the number changes,
          not when other parts of the component re-render.
        </p>
      </div>
      
      {/* Memoized Component */}
      <MemoizedExpensiveComponent 
        number={expensiveNumber}
        onCalculate={handleCalculationResult}
      />
      
      {/* Calculation History */}
      {calculationResults.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Calculation History</h4>
          <div className="space-y-1">
            {calculationResults.map((calc, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>Input: {calc.input} → Result: {calc.result}</span>
                <span className="text-blue-600 text-xs">
                  {new Date(calc.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          <Button 
            size="small" 
            variant="ghost" 
            onClick={() => setCalculationResults([])}
            className="mt-2"
          >
            🗑️ Clear History
          </Button>
        </div>
      )}
    </div>
  );
  
  /**
   * COMPONENT RENDER
   */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Advanced React Patterns
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore sophisticated React patterns used in production applications.
          Each pattern solves specific problems and enables powerful development techniques.
        </p>
      </header>
      
      {/* Pattern Navigation */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Pattern to Explore:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {patterns.map(pattern => (
            <Button
              key={pattern.id}
              size="small"
              variant={currentPattern === pattern.id ? 'primary' : 'secondary'}
              onClick={() => handlePatternChange(pattern.id)}
              className="flex items-center justify-center space-x-2"
            >
              <span>{pattern.emoji}</span>
              <span className="hidden sm:inline">{pattern.title}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Pattern Demonstrations */}
      <div className="card min-h-96">
        <ErrorBoundary
          enableRetry={true}
          maxRetries={3}
          onRetry={(error, retryCount) => {
            console.log(`🔄 Pattern demo retry attempt ${retryCount}`);
            notifications.showInfo(`Retry attempt ${retryCount} for pattern demo`);
          }}
        >
          
          {currentPattern === 'render-props' && renderRenderPropsDemo()}
          
          {currentPattern === 'compound' && renderCompoundDemo()}
          
          {currentPattern === 'performance' && renderPerformanceDemo()}
          
          {currentPattern === 'refs' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Forwarded Refs Pattern</h3>
              <p className="text-gray-600 mb-4">
                Ref forwarding allows parent components to access child component refs,
                enabling direct DOM manipulation and integration with third-party libraries.
              </p>
              
              <div className="max-w-md mx-auto space-y-4">
                <FancyInput
                  ref={fancyInputRef}
                  label="Fancy Input with Forwarded Ref"
                  placeholder="Type something here..."
                />
                
                <div className="text-center">
                  <Button onClick={handleFocusInput}>
                    👉 Focus Input via Ref
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                  <p className="text-blue-800">
                    💡 The button above can focus the input directly because
                    the FancyInput component forwards its ref to the input element.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {currentPattern === 'portals' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">React Portals</h3>
              <p className="text-gray-600 mb-4">
                Portals allow rendering components outside their parent's DOM hierarchy.
                This is essential for modals, tooltips, and overlays that need to escape
                CSS containment.
              </p>
              
              <div className="text-center">
                <Button 
                  onClick={() => setShowPortalDemo(!showPortalDemo)}
                  variant={showPortalDemo ? 'danger' : 'primary'}
                >
                  {showPortalDemo ? '❌ Close Portal Demo' : '🚪 Open Portal Demo'}
                </Button>
                
                {showPortalDemo && (
                  <Portal>
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md mx-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">
                          🚪 Portal Demo
                        </h4>
                        <p className="text-gray-600 mb-4">
                          This modal is rendered outside the normal component tree
                          using React Portal! Check the DOM inspector to see how
                          it's rendered directly under the body element.
                        </p>
                        <div className="text-center">
                          <Button 
                            variant="primary"
                            onClick={() => setShowPortalDemo(false)}
                          >
                            ✅ Close Modal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Portal>
                )}
              </div>
            </div>
          )}
          
          {currentPattern === 'suspense' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">React Suspense</h3>
              <p className="text-gray-600 mb-4">
                Suspense enables declarative loading states for asynchronous components.
                It provides a clean way to handle code splitting and async operations.
              </p>
              
              <div className="text-center">
                <Button 
                  onClick={() => setShowLazyComponent(!showLazyComponent)}
                  variant={showLazyComponent ? 'danger' : 'primary'}
                  disabled={showLazyComponent}
                >
                  {showLazyComponent ? '⏳ Loading...' : '📦 Load Component'}
                </Button>
                
                {showLazyComponent && (
                  <div className="mt-6">
                    <Suspense 
                      fallback={
                        <div className="bg-gray-100 p-8 rounded-lg animate-pulse">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600">Loading lazy component...</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            This fallback UI shows while the component loads
                          </p>
                        </div>
                      }
                    >
                      <LazyComponent />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {currentPattern === 'errors' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Error Boundary Testing</h3>
              <p className="text-gray-600 mb-4">
                Test how error boundaries catch and handle different types of errors.
                This is crucial for building resilient React applications.
              </p>
              
              <DevErrorBoundary>
                <ErrorTester />
              </DevErrorBoundary>
            </div>
          )}
          
          {/* Default case for other patterns */}
          {!['render-props', 'compound', 'performance', 'refs', 'portals', 'suspense', 'errors'].includes(currentPattern) && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p>This pattern demonstration is being prepared.</p>
            </div>
          )}
          
        </ErrorBoundary>
      </div>
      
      {/* Educational Notes */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">
          📚 Pattern Learning Notes
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">When to Use These Patterns:</h4>
            <ul className="text-indigo-700 space-y-1">
              <li>• <strong>Render Props:</strong> When you need flexible rendering logic</li>
              <li>• <strong>HOCs:</strong> For cross-cutting concerns and legacy integration</li>
              <li>• <strong>Compound:</strong> For component APIs with multiple related parts</li>
              <li>• <strong>Portals:</strong> For modals, tooltips, and overlays</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800 mb-2">Modern Alternatives:</h4>
            <ul className="text-indigo-700 space-y-1">
              <li>• <strong>Custom Hooks:</strong> Often better than HOCs for logic sharing</li>
              <li>• <strong>Context API:</strong> Better than prop drilling for deep state</li>
              <li>• <strong>Suspense:</strong> Declarative loading states</li>
              <li>• <strong>Error Boundaries:</strong> Graceful error handling</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdvancedPatternsShowcase;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. RENDER PROPS PATTERN:
 *    - Function as children pattern
 *    - Flexible component composition
 *    - Logic sharing without inheritance
 * 
 * 2. HIGHER-ORDER COMPONENTS:
 *    - Component enhancement patterns
 *    - Cross-cutting concerns
 *    - Function composition principles
 * 
 * 3. COMPOUND COMPONENTS:
 *    - Related components working together
 *    - Implicit state sharing through context
 *    - Flexible composition APIs
 * 
 * 4. FORWARDED REFS:
 *    - Proper ref handling in component hierarchies
 *    - Integration with third-party libraries
 *    - Direct DOM access patterns
 * 
 * 5. REACT PORTALS:
 *    - Rendering outside component tree
 *    - Modal and overlay patterns
 *    - CSS containment escape
 * 
 * 6. SUSPENSE PATTERNS:
 *    - Declarative loading states
 *    - Code splitting integration
 *    - Async component handling
 * 
 * 7. ERROR BOUNDARIES:
 *    - Error catching and recovery
 *    - Fallback UI patterns
 *    - Production error handling
 * 
 * 8. PERFORMANCE OPTIMIZATION:
 *    - React.memo for component memoization
 *    - useMemo for expensive calculations
 *    - useCallback for stable references
 * 
 * These patterns represent advanced React development techniques that
 * enable building sophisticated, maintainable applications.
 */
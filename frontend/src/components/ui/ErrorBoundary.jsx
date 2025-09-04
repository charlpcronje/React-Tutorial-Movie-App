/**
 * ErrorBoundary Component - Complete Educational Guide to React Error Handling
 * 
 * Error boundaries are React components that catch JavaScript errors anywhere in their
 * child component tree, log those errors, and display a fallback UI instead of crashing
 * the entire application. This implementation serves as a comprehensive educational
 * example that demonstrates:
 * 
 * 1. ERROR BOUNDARY BASICS: How to create and use error boundaries
 * 2. ERROR RECOVERY: Allowing users to recover from errors gracefully
 * 3. ERROR LOGGING: Capturing and reporting errors for debugging
 * 4. FALLBACK UIs: Creating informative error displays
 * 5. ERROR TYPES: Handling different kinds of errors appropriately
 * 6. DEVELOPMENT VS PRODUCTION: Different error handling strategies
 * 7. USER EXPERIENCE: Maintaining good UX even when things go wrong
 * 8. ERROR PREVENTION: Patterns that help prevent errors
 * 9. MONITORING INTEGRATION: How to integrate with error tracking services
 * 10. EDUCATIONAL VALUE: Learning from errors and error patterns
 * 
 * Note: Error boundaries are class components because they use lifecycle methods
 * that aren't available in function components (yet).
 */

// React imports - Error boundaries must be class components
import React, { Component } from 'react';

// Our UI components for fallback displays
import Button from './Button.jsx';

// Utilities for error handling
import { clsx } from 'clsx';

/**
 * ERROR TYPES AND CLASSIFICATIONS
 * 
 * We define different types of errors to provide appropriate handling
 * and user messaging for each category.
 */
const ERROR_TYPES = {
  RENDER_ERROR: 'render_error',           // Errors during component rendering
  EVENT_HANDLER_ERROR: 'event_error',     // Errors in event handlers (not caught by boundaries)
  ASYNC_ERROR: 'async_error',             // Errors in async operations
  CHUNK_LOAD_ERROR: 'chunk_error',        // Code splitting/lazy loading errors
  NETWORK_ERROR: 'network_error',         // API and network-related errors
  VALIDATION_ERROR: 'validation_error',   // Data validation errors
  UNKNOWN_ERROR: 'unknown_error',         // Unclassified errors
};

/**
 * ERROR SEVERITY LEVELS
 * 
 * Different severity levels help determine appropriate responses
 * and recovery strategies.
 */
const ERROR_SEVERITY = {
  LOW: 'low',           // Minor issues that don't affect functionality
  MEDIUM: 'medium',     // Issues that affect some functionality
  HIGH: 'high',         // Issues that significantly impact user experience
  CRITICAL: 'critical', // Issues that make the app unusable
};

/**
 * ErrorBoundary Class Component
 * 
 * This class component implements the error boundary pattern with
 * comprehensive error handling, logging, and recovery features.
 */
class ErrorBoundary extends Component {
  /**
   * CONSTRUCTOR AND INITIAL STATE
   * 
   * We initialize the error boundary with state to track errors
   * and configure error handling behavior.
   * 
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    
    // Initial state for error boundary
    this.state = {
      // Error tracking
      hasError: false,              // Whether an error has occurred
      error: null,                  // The actual error object
      errorInfo: null,              // Additional error information from React
      errorId: null,                // Unique ID for this error occurrence
      
      // Error metadata
      errorType: null,              // Classified error type
      severity: ERROR_SEVERITY.MEDIUM, // Error severity level
      timestamp: null,              // When the error occurred
      
      // Recovery state
      retryCount: 0,                // Number of recovery attempts
      maxRetries: 3,                // Maximum retry attempts
      isRecovering: false,          // Whether recovery is in progress
      
      // User interaction
      userFeedbackGiven: false,     // Whether user provided feedback
      errorReported: false,         // Whether error was reported to monitoring
    };
    
    // Bind methods to ensure correct 'this' context
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleErrorReport = this.handleErrorReport.bind(this);
    this.classifyError = this.classifyError.bind(this);
  }
  
  /**
   * STATIC getDerivedStateFromError METHOD
   * 
   * This static method is called when an error is thrown during rendering.
   * It receives the error and returns new state to trigger the error UI.
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    console.error('🚨 Error caught by boundary:', error);
    
    // Create unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Return new state to trigger error UI
    return {
      hasError: true,
      error: error,
      errorId: errorId,
      timestamp: Date.now(),
    };
  }
  
  /**
   * componentDidCatch LIFECYCLE METHOD
   * 
   * This method is called after an error has been thrown and caught.
   * It receives the error and additional error information from React.
   * This is where we perform error logging and classification.
   * 
   * @param {Error} error - The error object
   * @param {Object} errorInfo - Additional error information from React
   */
  componentDidCatch(error, errorInfo) {
    console.group('🚨 Error Boundary - Detailed Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
    
    // Classify the error for appropriate handling
    const errorType = this.classifyError(error);
    const severity = this.determineSeverity(error, errorType);
    
    // Update state with additional error information
    this.setState({
      errorInfo: errorInfo,
      errorType: errorType,
      severity: severity,
    });
    
    // Log error for monitoring and analytics
    this.logError(error, errorInfo, errorType, severity);
    
    // Report to external error tracking service (in production)
    if (this.props.enableErrorReporting && process.env.NODE_ENV === 'production') {
      this.reportToErrorService(error, errorInfo, errorType);
    }
  }
  
  /**
   * ERROR CLASSIFICATION
   * 
   * Classify errors to provide appropriate handling and messaging.
   * 
   * @param {Error} error - The error to classify
   * @returns {string} Error type classification
   */
  classifyError(error) {
    const message = error.message.toLowerCase();
    const stack = error.stack ? error.stack.toLowerCase() : '';
    
    // Chunk loading errors (code splitting)
    if (message.includes('loading chunk') || message.includes('loading css chunk')) {
      return ERROR_TYPES.CHUNK_LOAD_ERROR;
    }
    
    // Network-related errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('cors') || message.includes('timeout')) {
      return ERROR_TYPES.NETWORK_ERROR;
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid prop') ||
        message.includes('required prop') || message.includes('prop type')) {
      return ERROR_TYPES.VALIDATION_ERROR;
    }
    
    // Async operation errors
    if (stack.includes('promise') || stack.includes('async') || 
        message.includes('unhandled promise')) {
      return ERROR_TYPES.ASYNC_ERROR;
    }
    
    // Default to render error
    return ERROR_TYPES.RENDER_ERROR;
  }
  
  /**
   * ERROR SEVERITY DETERMINATION
   * 
   * Determine how severe an error is based on its type and context.
   * 
   * @param {Error} error - The error object
   * @param {string} errorType - Classified error type
   * @returns {string} Severity level
   */
  determineSeverity(error, errorType) {
    switch (errorType) {
      case ERROR_TYPES.CHUNK_LOAD_ERROR:
        return ERROR_SEVERITY.MEDIUM; // Usually recoverable with refresh
        
      case ERROR_TYPES.NETWORK_ERROR:
        return ERROR_SEVERITY.MEDIUM; // Often temporary
        
      case ERROR_TYPES.VALIDATION_ERROR:
        return ERROR_SEVERITY.LOW; // Usually development issues
        
      case ERROR_TYPES.ASYNC_ERROR:
        return ERROR_SEVERITY.MEDIUM; // Depends on the async operation
        
      case ERROR_TYPES.RENDER_ERROR:
      default:
        return ERROR_SEVERITY.HIGH; // Render errors are serious
    }
  }
  
  /**
   * ERROR LOGGING
   * 
   * Comprehensive error logging for debugging and monitoring.
   * 
   * @param {Error} error - The error object
   * @param {Object} errorInfo - React error information
   * @param {string} errorType - Classified error type
   * @param {string} severity - Error severity level
   */
  logError(error, errorInfo, errorType, severity) {
    const errorReport = {
      // Basic error information
      message: error.message,
      stack: error.stack,
      name: error.name,
      
      // React-specific information
      componentStack: errorInfo.componentStack,
      
      // Classification
      type: errorType,
      severity: severity,
      errorId: this.state.errorId,
      
      // Context information
      timestamp: this.state.timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      
      // Application state
      retryCount: this.state.retryCount,
      
      // Props context (what was the component trying to do?)
      boundaryProps: {
        fallbackComponent: this.props.fallbackComponent ? 'custom' : 'default',
        enableRetry: this.props.enableRetry,
        maxRetries: this.props.maxRetries,
      },
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table(errorReport);
    }
    
    // Store error report in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      const updatedErrors = [...existingErrors.slice(-4), errorReport]; // Keep last 5 errors
      localStorage.setItem('error_reports', JSON.stringify(updatedErrors));
    } catch (storageError) {
      console.warn('Failed to store error report in localStorage:', storageError);
    }
  }
  
  /**
   * EXTERNAL ERROR REPORTING
   * 
   * In production, we would send errors to monitoring services like Sentry.
   * 
   * @param {Error} error - The error object
   * @param {Object} errorInfo - React error information  
   * @param {string} errorType - Classified error type
   */
  reportToErrorService(error, errorInfo, errorType) {
    // In a real application, this would integrate with services like:
    // - Sentry for error tracking
    // - LogRocket for session replay
    // - DataDog for monitoring
    // - Custom analytics endpoints
    
    console.log('📊 Would report to error monitoring service:', {
      error: error.message,
      type: errorType,
      component: errorInfo.componentStack,
    });
    
    this.setState({ errorReported: true });
  }
  
  /**
   * RECOVERY METHODS
   * 
   * These methods handle different recovery strategies for different error types.
   */
  
  /**
   * Retry the failed operation
   */
  handleRetry() {
    console.log(`🔄 Attempting error recovery (retry ${this.state.retryCount + 1}/${this.state.maxRetries})`);
    
    this.setState({
      isRecovering: true,
    });
    
    // Simulate recovery delay for better UX
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRecovering: false,
      });
      
      // Call onRetry callback if provided
      if (this.props.onRetry) {
        this.props.onRetry(this.state.error, this.state.retryCount + 1);
      }
    }, 1000);
  }
  
  /**
   * Reset error boundary completely
   */
  handleReset() {
    console.log('🔄 Resetting error boundary to initial state');
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      errorType: null,
      severity: ERROR_SEVERITY.MEDIUM,
      timestamp: null,
      retryCount: 0,
      isRecovering: false,
      userFeedbackGiven: false,
      errorReported: false,
    });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }
  
  /**
   * Handle error feedback from user
   */
  handleErrorReport() {
    console.log('📝 User provided error feedback');
    
    this.setState({ userFeedbackGiven: true });
    
    // In a real app, this might open a feedback form or send data to support
    alert('Thank you for reporting this error! Our team has been notified.');
  }
  
  /**
   * RENDER METHOD
   * 
   * The main render method that shows either the children or error UI.
   */
  render() {
    // If there's an error, show the error UI
    if (this.state.hasError) {
      return this.renderErrorUI();
    }
    
    // Otherwise, render children normally
    return this.props.children;
  }
  
  /**
   * ERROR UI RENDERING
   * 
   * Creates appropriate error displays based on error type and severity.
   */
  renderErrorUI() {
    const { error, errorType, severity, retryCount, maxRetries, isRecovering } = this.state;
    const { enableRetry = true, fallbackComponent: CustomFallback } = this.props;
    
    // If a custom fallback component is provided, use it
    if (CustomFallback) {
      return (
        <CustomFallback
          error={error}
          errorType={errorType}
          severity={severity}
          onRetry={enableRetry ? this.handleRetry : null}
          onReset={this.handleReset}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      );
    }
    
    // Default error UI based on error type
    return this.renderDefaultErrorUI();
  }
  
  /**
   * DEFAULT ERROR UI
   * 
   * Comprehensive error display with recovery options.
   */
  renderDefaultErrorUI() {
    const { error, errorType, severity, retryCount, maxRetries, isRecovering } = this.state;
    const canRetry = retryCount < maxRetries && this.props.enableRetry !== false;
    
    // Error UI styling based on severity
    const errorStyles = {
      [ERROR_SEVERITY.LOW]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      [ERROR_SEVERITY.MEDIUM]: 'bg-orange-50 border-orange-200 text-orange-800', 
      [ERROR_SEVERITY.HIGH]: 'bg-red-50 border-red-200 text-red-800',
      [ERROR_SEVERITY.CRITICAL]: 'bg-red-100 border-red-300 text-red-900',
    };
    
    // Error icons based on type
    const errorIcons = {
      [ERROR_TYPES.RENDER_ERROR]: '🔧',
      [ERROR_TYPES.NETWORK_ERROR]: '🌐',
      [ERROR_TYPES.CHUNK_LOAD_ERROR]: '📦',
      [ERROR_TYPES.ASYNC_ERROR]: '⏳',
      [ERROR_TYPES.VALIDATION_ERROR]: '✅',
      [ERROR_TYPES.UNKNOWN_ERROR]: '❓',
    };
    
    // User-friendly error messages
    const errorMessages = {
      [ERROR_TYPES.RENDER_ERROR]: 'Something went wrong while displaying this content.',
      [ERROR_TYPES.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
      [ERROR_TYPES.CHUNK_LOAD_ERROR]: 'Failed to load application resources. This may be due to a network issue.',
      [ERROR_TYPES.ASYNC_ERROR]: 'An operation did not complete successfully.',
      [ERROR_TYPES.VALIDATION_ERROR]: 'The application received unexpected data.',
      [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred.',
    };
    
    const icon = errorIcons[errorType] || '❌';
    const message = errorMessages[errorType] || 'Something went wrong.';
    
    return (
      <div className={clsx(
        'rounded-lg border p-6 m-4',
        errorStyles[severity] || errorStyles[ERROR_SEVERITY.MEDIUM]
      )}>
        <div className="text-center">
          {/* Error Icon */}
          <div className="text-4xl mb-4">{icon}</div>
          
          {/* Error Title */}
          <h2 className="text-xl font-bold mb-2">
            {severity === ERROR_SEVERITY.CRITICAL ? 'Critical Error' :
             severity === ERROR_SEVERITY.HIGH ? 'Application Error' :
             severity === ERROR_SEVERITY.MEDIUM ? 'Something Went Wrong' :
             'Minor Issue Detected'}
          </h2>
          
          {/* User-friendly message */}
          <p className="mb-4 max-w-md mx-auto">
            {message}
          </p>
          
          {/* Technical details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer font-medium mb-2">
                🔧 Technical Details (Development Only)
              </summary>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                <div><strong>Error:</strong> {error?.message}</div>
                <div><strong>Type:</strong> {errorType}</div>
                <div><strong>Severity:</strong> {severity}</div>
                <div><strong>Error ID:</strong> {this.state.errorId}</div>
                {error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs mt-1 overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Component Stack</summary>
                    <pre className="text-xs mt-1 overflow-x-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </details>
          )}
          
          {/* Recovery Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            
            {/* Retry Button */}
            {canRetry && (
              <Button
                variant="primary"
                onClick={this.handleRetry}
                disabled={isRecovering}
                loading={isRecovering}
              >
                {isRecovering ? 'Recovering...' : 
                 retryCount > 0 ? `Try Again (${retryCount}/${maxRetries})` : 'Try Again'}
              </Button>
            )}
            
            {/* Reset Button */}
            <Button
              variant="secondary"
              onClick={this.handleReset}
              disabled={isRecovering}
            >
              Reset Component
            </Button>
            
            {/* Reload Page Button (for critical errors) */}
            {severity === ERROR_SEVERITY.CRITICAL && (
              <Button
                variant="danger"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            )}
          </div>
          
          {/* Additional Actions */}
          <div className="mt-4 flex justify-center space-x-3 text-sm">
            
            {/* Report Error */}
            {!this.state.userFeedbackGiven && (
              <button
                onClick={this.handleErrorReport}
                className="text-current hover:underline"
              >
                📝 Report this error
              </button>
            )}
            
            {/* Go Home */}
            <button
              onClick={() => window.location.href = '/'}
              className="text-current hover:underline"
            >
              🏠 Go to home page
              </button>
              
            {/* Get Help */}
            <button
              onClick={() => alert('In a real app, this would open help documentation or contact support.')}
              className="text-current hover:underline"
            >
              ❓ Get help
            </button>
          </div>
          
          {/* Error Statistics */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 text-xs opacity-75">
              <p>Error occurred at: {new Date(this.state.timestamp).toLocaleString()}</p>
              <p>Recovery attempts: {retryCount}/{maxRetries}</p>
              {this.state.errorReported && <p>✅ Error reported to monitoring service</p>}
              {this.state.userFeedbackGiven && <p>📝 User feedback received</p>}
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * ERROR BOUNDARY HOOK (for functional components)
 * 
 * While error boundaries must be class components, we can create a hook
 * that provides error boundary functionality for specific use cases.
 */
export function useErrorHandler() {
  const [error, setError] = React.useState(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error, errorInfo = {}) => {
    console.error('🚨 Manual error capture:', error);
    setError({ error, errorInfo, timestamp: Date.now() });
  }, []);
  
  // Automatically log errors when they're set
  React.useEffect(() => {
    if (error) {
      console.error('🚨 Error captured by useErrorHandler:', error);
    }
  }, [error]);
  
  return {
    error,
    hasError: error !== null,
    resetError,
    captureError,
  };
}

/**
 * SPECIALIZED ERROR BOUNDARY COMPONENTS
 * 
 * Pre-configured error boundaries for common use cases.
 */

/**
 * ChunkErrorBoundary - Specifically for code splitting errors
 */
export function ChunkErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      enableRetry={true}
      maxRetries={2}
      onRetry={() => window.location.reload()}
      fallbackComponent={({ onRetry }) => (
        <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Loading Error
          </h2>
          <p className="text-blue-800 mb-4">
            Failed to load application resources. Please refresh the page.
          </p>
          <Button variant="primary" onClick={onRetry}>
            🔄 Refresh Page
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * ApiErrorBoundary - For API-related component errors
 */
export function ApiErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      enableRetry={true}
      maxRetries={3}
      fallbackComponent={({ error, onRetry, retryCount, maxRetries }) => (
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Connection Error
          </h2>
          <p className="text-red-800 mb-4">
            Unable to load data. Please check your connection and try again.
          </p>
          <div className="space-x-2">
            <Button variant="primary" onClick={onRetry}>
              🔄 Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Development-only error boundary with extra debugging features
 */
export function DevErrorBoundary({ children }) {
  if (process.env.NODE_ENV !== 'development') {
    return children; // No error boundary in production
  }
  
  return (
    <ErrorBoundary
      enableRetry={true}
      enableErrorReporting={false}
      fallbackComponent={({ error, errorInfo, onRetry, onReset }) => (
        <div className="m-4 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🐛</div>
            <h2 className="text-xl font-bold text-yellow-900">Development Error</h2>
            <p className="text-yellow-800 text-sm">
              This error boundary is only active in development mode
            </p>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            <div><strong>Error:</strong> {error?.message}</div>
            <div><strong>Stack:</strong></div>
            <pre className="text-xs whitespace-pre-wrap">{error?.stack}</pre>
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button size="small" variant="primary" onClick={onRetry}>
              🔄 Retry Render
            </Button>
            <Button size="small" variant="secondary" onClick={onReset}>
              🧹 Reset State
            </Button>
            <Button size="small" variant="ghost" onClick={() => console.clear()}>
              🗑️ Clear Console
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;

/**
 * COMPREHENSIVE USAGE EXAMPLES:
 * 
 * BASIC ERROR BOUNDARY:
 * ```jsx
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <Header />
 *       <MainContent />
 *       <Footer />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * NESTED ERROR BOUNDARIES:
 * ```jsx
 * function App() {
 *   return (
 *     <ErrorBoundary> // App-level boundary
 *       <Header />
 *       
 *       <main>
 *         <ErrorBoundary> // Page-level boundary
 *           <MovieGrid />
 *         </ErrorBoundary>
 *         
 *         <ErrorBoundary> // Sidebar boundary
 *           <Sidebar />
 *         </ErrorBoundary>
 *       </main>
 *       
 *       <Footer />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * CUSTOM FALLBACK COMPONENT:
 * ```jsx
 * function CustomErrorFallback({ error, onRetry, retryCount }) {
 *   return (
 *     <div className="error-display">
 *       <h2>Oops! Something went wrong</h2>
 *       <p>{error?.message}</p>
 *       <Button onClick={onRetry}>
 *         Try Again {retryCount > 0 && `(Attempt ${retryCount + 1})`}
 *       </Button>
 *     </div>
 *   );
 * }
 * 
 * function App() {
 *   return (
 *     <ErrorBoundary 
 *       fallbackComponent={CustomErrorFallback}
 *       enableRetry={true}
 *       maxRetries={3}
 *       onRetry={(error, retryCount) => console.log('Retry attempt:', retryCount)}
 *     >
 *       <MovieApp />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * SPECIALIZED ERROR BOUNDARIES:
 * ```jsx
 * function MovieDetailsPage() {
 *   return (
 *     <div>
 *       <ChunkErrorBoundary>
 *         <LazyMovieDetails />
 *       </ChunkErrorBoundary>
 *       
 *       <ApiErrorBoundary>
 *         <MovieReviews />
 *       </ApiErrorBoundary>
 *       
 *       <DevErrorBoundary>
 *         <ExperimentalFeature />
 *       </DevErrorBoundary>
 *     </div>
 *   );
 * }
 * ```
 * 
 * ERROR TESTING COMPONENT:
 * ```jsx
 * function ErrorTester() {
 *   const throwError = (type) => {
 *     switch (type) {
 *       case 'render':
 *         throw new Error('Simulated render error');
 *       case 'async':
 *         Promise.reject(new Error('Simulated async error'));
 *         break;
 *       case 'chunk':
 *         throw new Error('Loading chunk failed');
 *       default:
 *         throw new Error('Unknown error type');
 *     }
 *   };
 *   
 *   return (
 *     <div className="space-x-2">
 *       <Button onClick={() => throwError('render')}>Test Render Error</Button>
 *       <Button onClick={() => throwError('async')}>Test Async Error</Button>
 *       <Button onClick={() => throwError('chunk')}>Test Chunk Error</Button>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. ERROR BOUNDARY IMPLEMENTATION:
 *    - Class component lifecycle methods
 *    - Static getDerivedStateFromError method
 *    - componentDidCatch for error logging
 * 
 * 2. ERROR CLASSIFICATION AND HANDLING:
 *    - Different error types require different responses
 *    - Severity levels determine recovery strategies
 *    - User-friendly messaging for different error categories
 * 
 * 3. RECOVERY STRATEGIES:
 *    - Retry mechanisms for transient errors
 *    - Reset functionality for component state errors
 *    - Graceful degradation for critical errors
 * 
 * 4. ERROR MONITORING AND DEBUGGING:
 *    - Comprehensive error logging
 *    - Integration with external monitoring services
 *    - Development vs production error handling
 * 
 * 5. USER EXPERIENCE CONSIDERATIONS:
 *    - Clear, helpful error messages
 *    - Recovery options that make sense to users
 *    - Maintaining app functionality despite errors
 * 
 * Error boundaries are essential for production React applications,
 * providing resilience and better user experience when things go wrong.
 */
# 🚨 Chapter 7: Error Handling Strategies

Error handling is crucial for robust applications. TypeScript's type system enables sophisticated error handling patterns that catch problems early and provide excellent developer experiences.

## 🎯 What You'll Learn: Error Handling

> **Learning Goal #4**: Comprehensive error type strategies

Traditional JavaScript error handling often involves guesswork. TypeScript transforms this by providing:
- **Typed error hierarchies** for different error categories
- **Discriminated unions** for result types
- **Type-safe error boundaries** in React
- **Validation errors** with specific field information
- **API error mapping** from HTTP status codes

## 🏗️ Error Type Hierarchy

### **Base Error Class**
```typescript
// Abstract base class for all application errors
abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Convert to JSON for logging/reporting
  toJSON(): {
    name: string;
    message: string;
    code: string;
    statusCode: number;
    context?: Record<string, unknown>;
    stack?: string;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    };
  }
}
```

### **Specific Error Classes**
```typescript
// Validation errors
class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, context);
  }
}

// Not found errors
class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;
  
  constructor(resource: string, id?: string | number) {
    super(`${resource} not found${id ? ` with id: ${id}` : ''}`);
  }
}

// Authentication errors
class AuthenticationError extends AppError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;
  
  constructor(message = 'Authentication required') {
    super(message);
  }
}

// Authorization errors
class AuthorizationError extends AppError {
  readonly code = 'AUTHORIZATION_ERROR';
  readonly statusCode = 403;
  
  constructor(action: string, resource: string) {
    super(`Not authorized to ${action} ${resource}`);
  }
}

// API/Network errors
class ApiError extends AppError {
  readonly code = 'API_ERROR';
  
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}

// Business logic errors
class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR';
  readonly statusCode = 422;
  
  constructor(
    message: string,
    public readonly rule: string
  ) {
    super(message);
  }
}
```

## 🔄 Result Types for Safe Error Handling

### **Basic Result Pattern**
```typescript
// Result type that can be success or error
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions for creating results
function success<T>(data: T): Result<T> {
  return { success: true, data };
}

function failure<E extends AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

// Safe function that returns Result instead of throwing
async function safeGetMovie(id: number): Promise<Result<Movie, NotFoundError | ApiError>> {
  try {
    const response = await fetch(`/api/movies/${id}`);
    
    if (response.status === 404) {
      return failure(new NotFoundError('Movie', id));
    }
    
    if (!response.ok) {
      return failure(new ApiError(`HTTP ${response.status}`, response.status));
    }
    
    const movie: Movie = await response.json();
    return success(movie);
  } catch (error) {
    return failure(new ApiError(
      'Network error',
      0,
      error instanceof Error ? error : new Error(String(error))
    ));
  }
}

// Usage - no try/catch needed!
const result = await safeGetMovie(123);

if (result.success) {
  // TypeScript knows result.data is Movie
  console.log('Movie title:', result.data.title);
} else {
  // TypeScript knows result.error is NotFoundError | ApiError
  if (result.error instanceof NotFoundError) {
    console.log('Movie not found');
  } else if (result.error instanceof ApiError) {
    console.log('API error:', result.error.message);
  }
}
```

### **Advanced Result Patterns**
```typescript
// Result with multiple error types
type MovieOperationResult = Result<
  Movie,
  | ValidationError
  | NotFoundError
  | AuthorizationError
  | ApiError
>;

// Async operations with comprehensive error handling
async function updateMovie(
  id: number, 
  updates: Partial<Movie>,
  userId: number
): Promise<MovieOperationResult> {
  // Validation
  if (Object.keys(updates).length === 0) {
    return failure(new ValidationError('No updates provided', 'updates', updates));
  }

  if (updates.title && updates.title.length < 1) {
    return failure(new ValidationError('Title cannot be empty', 'title', updates.title));
  }

  if (updates.releaseYear && (updates.releaseYear < 1900 || updates.releaseYear > 2030)) {
    return failure(new ValidationError(
      'Invalid release year',
      'releaseYear',
      updates.releaseYear
    ));
  }

  try {
    // Check if movie exists
    const existingMovie = await getMovie(id);
    if (!existingMovie) {
      return failure(new NotFoundError('Movie', id));
    }

    // Check authorization
    if (!canUserEditMovie(userId, existingMovie)) {
      return failure(new AuthorizationError('update', 'movie'));
    }

    // Perform update
    const updatedMovie = await api.updateMovie(id, updates);
    return success(updatedMovie);

  } catch (error) {
    return failure(new ApiError(
      'Failed to update movie',
      500,
      error instanceof Error ? error : new Error(String(error))
    ));
  }
}
```

## ⚛️ React Error Boundaries with TypeScript

### **Type-Safe Error Boundary**
```tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class MovieErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Report error to logging service
    this.props.onError?.(error, errorInfo);
    
    console.error('Movie app error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Custom error component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} errorInfo={this.state.errorInfo} />;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <h2>🎬 Something went wrong with the movie app</h2>
          <p>We're sorry! An error occurred while displaying this content.</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details (Development Only)</summary>
              <pre>{this.state.error.message}</pre>
              <pre>{this.state.error.stack}</pre>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error fallback component
const MovieErrorFallback: FC<{ error: Error; errorInfo: React.ErrorInfo }> = ({ error }) => (
  <div className="movie-error">
    <h3>🎬 Movie Loading Error</h3>
    <p>We couldn't load the movie content: {error.message}</p>
    <button onClick={() => window.location.reload()}>
      Try Again
    </button>
  </div>
);

// Usage
const App: FC = () => (
  <MovieErrorBoundary 
    fallback={MovieErrorFallback}
    onError={(error, errorInfo) => {
      // Send to error reporting service
      reportError(error, errorInfo);
    }}
  >
    <MovieApp />
  </MovieErrorBoundary>
);
```

### **Hook-Based Error Handling**
```tsx
// Custom error handling hook
interface UseErrorHandlerReturn {
  error: AppError | null;
  clearError: () => void;
  handleError: (error: unknown) => void;
  isError: boolean;
}

function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((error: unknown): void => {
    if (error instanceof AppError) {
      setError(error);
    } else if (error instanceof Error) {
      setError(new ApiError(error.message));
    } else {
      setError(new ApiError('Unknown error occurred'));
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    error,
    clearError,
    handleError,
    isError: error !== null
  };
}

// Error display component
interface ErrorDisplayProps {
  error: AppError;
  onDismiss: () => void;
  onRetry?: () => void;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({ error, onDismiss, onRetry }) => {
  const getErrorIcon = (): string => {
    if (error instanceof ValidationError) return '⚠️';
    if (error instanceof NotFoundError) return '🔍';
    if (error instanceof AuthenticationError) return '🔐';
    if (error instanceof AuthorizationError) return '🚫';
    return '❌';
  };

  const getErrorColor = (): string => {
    if (error instanceof ValidationError) return 'yellow';
    if (error instanceof NotFoundError) return 'blue';
    if (error instanceof AuthenticationError) return 'purple';
    if (error instanceof AuthorizationError) return 'red';
    return 'red';
  };

  return (
    <div className={`error-display error-display--${getErrorColor()}`}>
      <div className="error-content">
        <span className="error-icon">{getErrorIcon()}</span>
        <div className="error-text">
          <h3>{error.name}</h3>
          <p>{error.message}</p>
          
          {error instanceof ValidationError && (
            <p className="error-field">Field: {error.field}</p>
          )}
          
          {error.context && (
            <details className="error-context">
              <summary>Additional Details</summary>
              <pre>{JSON.stringify(error.context, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
      
      <div className="error-actions">
        <button onClick={onDismiss}>Dismiss</button>
        {onRetry && (
          <button onClick={onRetry}>Retry</button>
        )}
      </div>
    </div>
  );
};

// Using the error handling system
const MovieForm: FC = () => {
  const { error, clearError, handleError } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (movieData: Omit<Movie, 'id'>): Promise<void> => {
    setIsSubmitting(true);
    clearError();

    try {
      const result = await updateMovie(0, movieData, getCurrentUserId());
      
      if (!result.success) {
        handleError(result.error);
        return;
      }

      // Success!
      console.log('Movie created:', result.data.title);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={clearError}
          onRetry={() => {
            clearError();
            // Retry logic here
          }}
        />
      )}
      
      <MovieFormComponent 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
```

## 🎯 Validation with Zod

### **Runtime Type Validation**
```typescript
import { z } from 'zod';

// Zod schemas with TypeScript integration
const MovieSchema = z.object({
  id: z.number().positive('Movie ID must be positive'),
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title too long'),
  overview: z.string()
    .min(10, 'Overview must be at least 10 characters')
    .max(2000, 'Overview too long'),
  releaseYear: z.number()
    .int('Release year must be an integer')
    .min(1900, 'Release year too early')
    .max(new Date().getFullYear() + 10, 'Release year too far in future'),
  voteAverage: z.number()
    .min(0, 'Rating cannot be negative')
    .max(10, 'Rating cannot exceed 10'),
  genres: z.array(z.object({
    id: z.number(),
    name: z.string()
  })).min(1, 'At least one genre is required')
});

// Infer TypeScript type from Zod schema
type Movie = z.infer<typeof MovieSchema>;

// Validation function with detailed error info
function validateMovie(data: unknown): Result<Movie, ValidationError> {
  try {
    const movie = MovieSchema.parse(data);
    return success(movie);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return failure(new ValidationError(
        firstError.message,
        firstError.path.join('.'),
        firstError.received,
        {
          allErrors: error.errors,
          invalidData: data
        }
      ));
    }
    
    return failure(new ValidationError(
      'Invalid data format',
      'unknown',
      data
    ));
  }
}

// Usage in API endpoint
async function createMovieEndpoint(requestData: unknown): Promise<Result<Movie, ValidationError | ApiError>> {
  // Validate input data
  const validationResult = validateMovie(requestData);
  if (!validationResult.success) {
    return validationResult; // Return validation error
  }

  try {
    // Save to database
    const savedMovie = await database.saveMovie(validationResult.data);
    return success(savedMovie);
  } catch (error) {
    return failure(new ApiError('Failed to save movie', 500, error as Error));
  }
}
```

### **Form Validation with TypeScript**
```tsx
// Form validation hook
interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  validate: (field: keyof T, value: any) => boolean;
  validateAll: (data: T) => boolean;
  clearErrors: () => void;
  hasErrors: boolean;
}

function useFormValidation<T>(schema: z.ZodSchema<T>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback((field: keyof T, value: any): boolean => {
    try {
      // Validate single field
      const fieldSchema = schema.shape[field as string];
      fieldSchema.parse(value);
      
      // Clear error if validation passed
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0].message
        }));
      }
      return false;
    }
  }, [schema]);

  const validateAll = useCallback((data: T): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        for (const err of error.errors) {
          const field = err.path[0] as keyof T;
          newErrors[field] = err.message;
        }
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback((): void => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateAll,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}

// Movie form with validation
const MovieForm: FC<{ onSubmit: (movie: Omit<Movie, 'id'>) => void }> = ({ onSubmit }) => {
  const validation = useFormValidation(MovieSchema.omit({ id: true }));
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    releaseYear: new Date().getFullYear(),
    voteAverage: 0,
    genres: []
  });

  const handleFieldChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const value = event.target.type === 'number' 
      ? Number(event.target.value)
      : event.target.value;
      
    setFormData(prev => ({ ...prev, [field]: value }));
    validation.validate(field, value);
  };

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    
    if (validation.validateAll(formData)) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Movie title"
          value={formData.title}
          onChange={handleFieldChange('title')}
        />
        {validation.errors.title && (
          <span className="error">{validation.errors.title}</span>
        )}
      </div>

      <div>
        <textarea
          placeholder="Movie overview"
          value={formData.overview}
          onChange={handleFieldChange('overview')}
        />
        {validation.errors.overview && (
          <span className="error">{validation.errors.overview}</span>
        )}
      </div>

      <div>
        <input
          type="number"
          placeholder="Release year"
          value={formData.releaseYear}
          onChange={handleFieldChange('releaseYear')}
        />
        {validation.errors.releaseYear && (
          <span className="error">{validation.errors.releaseYear}</span>
        )}
      </div>

      <button type="submit" disabled={validation.hasErrors}>
        Create Movie
      </button>
    </form>
  );
};
```

## 🌐 Global Error Handling

### **Global Error Context**
```tsx
interface ErrorContextValue {
  errors: AppError[];
  addError: (error: AppError) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

const ErrorProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: AppError): void => {
    // Add unique ID for tracking
    const errorWithId = {
      ...error,
      id: Math.random().toString(36)
    };
    
    setErrors(prev => [...prev, errorWithId as AppError]);

    // Auto-remove after timeout
    setTimeout(() => {
      removeError(errorWithId.id);
    }, 5000);
  }, []);

  const removeError = useCallback((id: string): void => {
    setErrors(prev => prev.filter(error => (error as any).id !== id));
  }, []);

  const clearAllErrors = useCallback((): void => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearAllErrors }}>
      {children}
      <ErrorToastContainer errors={errors} onDismiss={removeError} />
    </ErrorContext.Provider>
  );
};

// Error toast container
const ErrorToastContainer: FC<{
  errors: AppError[];
  onDismiss: (id: string) => void;
}> = ({ errors, onDismiss }) => (
  <div className="error-toast-container">
    {errors.map(error => (
      <ErrorToast
        key={(error as any).id}
        error={error}
        onDismiss={() => onDismiss((error as any).id)}
      />
    ))}
  </div>
);

// Individual error toast
const ErrorToast: FC<{
  error: AppError;
  onDismiss: () => void;
}> = ({ error, onDismiss }) => (
  <div className={`error-toast error-toast--${error.statusCode >= 500 ? 'server' : 'client'}`}>
    <div className="error-content">
      <h4>{error.name}</h4>
      <p>{error.message}</p>
    </div>
    <button onClick={onDismiss}>×</button>
  </div>
);

// Hook for using error context
function useErrorHandler(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
}
```

## 📊 Async Error Handling

### **Async State with Error Types**
```typescript
// Discriminated union for async operations
type AsyncState<T, E = AppError> = 
  | { status: 'idle' }
  | { status: 'loading'; startTime: number }
  | { status: 'success'; data: T; loadTime: number }
  | { status: 'error'; error: E; retryCount: number };

// Hook for async operations with error handling
interface UseAsyncOperationReturn<T, E = AppError> {
  state: AsyncState<T, E>;
  execute: (...args: any[]) => Promise<void>;
  retry: () => void;
  reset: () => void;
}

function useAsyncOperation<T, E = AppError>(
  operation: (...args: any[]) => Promise<Result<T, E>>
): UseAsyncOperationReturn<T, E> {
  const [state, setState] = useState<AsyncState<T, E>>({ status: 'idle' });
  const [lastArgs, setLastArgs] = useState<any[]>([]);

  const execute = useCallback(async (...args: any[]): Promise<void> => {
    setLastArgs(args);
    const startTime = Date.now();
    
    setState({ status: 'loading', startTime });

    try {
      const result = await operation(...args);
      
      if (result.success) {
        setState({
          status: 'success',
          data: result.data,
          loadTime: Date.now() - startTime
        });
      } else {
        setState({
          status: 'error',
          error: result.error,
          retryCount: 0
        });
      }
    } catch (error) {
      setState({
        status: 'error',
        error: error as E,
        retryCount: 0
      });
    }
  }, [operation]);

  const retry = useCallback((): void => {
    if (state.status === 'error') {
      setState(prev => ({
        ...prev,
        retryCount: (prev as any).retryCount + 1
      }));
      execute(...lastArgs);
    }
  }, [state, lastArgs, execute]);

  const reset = useCallback((): void => {
    setState({ status: 'idle' });
  }, []);

  return { state, execute, retry, reset };
}

// Usage
const MovieDetails: FC<{ movieId: number }> = ({ movieId }) => {
  const movieOperation = useAsyncOperation(safeGetMovie);

  useEffect(() => {
    movieOperation.execute(movieId);
  }, [movieId]);

  const { state } = movieOperation;

  switch (state.status) {
    case 'idle':
      return <div>Ready to load movie</div>;
      
    case 'loading':
      return <div>Loading movie...</div>;
      
    case 'success':
      return (
        <div>
          <h1>{state.data.title}</h1>
          <p>Loaded in {state.loadTime}ms</p>
        </div>
      );
      
    case 'error':
      return (
        <ErrorDisplay
          error={state.error}
          onDismiss={movieOperation.reset}
          onRetry={movieOperation.retry}
        />
      );
  }
};
```

## 🎯 Key Takeaways

### **Error Handling Strategies**
- **Type Hierarchies**: Create specific error classes for different scenarios
- **Result Types**: Use Result<T, E> pattern for safe error handling
- **Validation**: Integrate runtime validation with TypeScript types
- **Global Handling**: Centralized error management with context
- **User Experience**: Provide clear, actionable error messages

### **Best Practices**
- Create specific error classes for different types of failures
- Use Result types to avoid throwing exceptions
- Validate data at boundaries (API endpoints, form submissions)
- Provide meaningful error messages with context
- Implement retry logic for transient errors
- Log errors appropriately for debugging

### **React Integration**
- Error boundaries for component-level error catching
- Custom hooks for consistent error handling patterns
- Context providers for global error state
- Toast notifications for user-friendly error display

## 🚀 Next Steps

Now that you understand comprehensive error handling, explore:

- **Chapter 8**: [Advanced TypeScript Patterns](./08-advanced-patterns.md) - Production-ready patterns and architectures
- **RPC Deep Dive**: Study our complete RPC implementation in `services/rpc-client.ts`
- **Real-World Examples**: See error handling in action throughout the codebase

Error handling with TypeScript transforms debugging from guesswork into systematic problem-solving! 🛡️

---

**Next Up:** [Chapter 8: Advanced TypeScript Patterns](./08-advanced-patterns.md) - Master production-ready TypeScript patterns and architectural decisions.
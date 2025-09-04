# 🧪 Complete React Testing Guide

This comprehensive guide demonstrates how to test React components, hooks, and applications effectively. It covers everything from basic component tests to advanced testing strategies used in production applications.

## Testing Philosophy and Approach

Our testing approach follows the principle: **"Test behavior, not implementation."** This means we test what users can do with our components rather than how the code works internally. This approach results in more maintainable tests that don't break when you refactor your code.

### Testing Pyramid for React Applications

1. **Unit Tests (70%)**: Test individual components and functions in isolation
2. **Integration Tests (20%)**: Test how components work together
3. **End-to-End Tests (10%)**: Test complete user workflows

## Testing Tools Setup

### Core Testing Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest-environment-jsdom": "^29.7.0",
    "vitest": "^1.0.0"
  }
}
```

### Testing Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
```

```javascript
// src/test/setup.js
import '@testing-library/jest-dom';

// Mock global objects
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

## Component Testing Examples

### Testing Our Button Component

```javascript
// src/components/ui/__tests__/Button.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button Component', () => {
  // Test basic rendering
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  // Test variants
  test('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });
  
  // Test sizes
  test('applies correct size classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('text-xs');
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-base');
  });
  
  // Test loading state
  test('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  // Test disabled state
  test('handles disabled state', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  // Test click handlers
  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  // Test accessibility
  test('has proper accessibility attributes', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
  
  // Test custom props
  test('passes through additional props', () => {
    render(
      <Button 
        data-testid="custom-button" 
        id="test-button"
        className="custom-class"
      >
        Custom Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('id', 'test-button');
    expect(button).toHaveClass('custom-class');
  });
});
```

### Testing MovieCard Component

```javascript
// src/components/features/__tests__/MovieCard.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieCard from '../MovieCard';

const mockMovie = {
  id: 1,
  title: 'Test Movie',
  overview: 'A great test movie for demonstrating component testing.',
  releaseYear: 2024,
  voteAverage: 8.5,
  voteCount: 1000,
  ratingStars: 4,
  genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }],
  posterUrl: 'https://example.com/poster.jpg',
  isPopular: true,
  isHighRated: true,
};

describe('MovieCard Component', () => {
  test('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('A great test movie')).toBeInTheDocument();
  });
  
  test('handles missing movie data gracefully', () => {
    render(<MovieCard movie={null} />);
    
    expect(screen.getByText('Error: Invalid movie data')).toBeInTheDocument();
  });
  
  test('calls onMovieClick when card is clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<MovieCard movie={mockMovie} onMovieClick={handleClick} />);
    
    await user.click(screen.getByRole('button', { name: /test movie/i }));
    expect(handleClick).toHaveBeenCalledWith(mockMovie);
  });
  
  test('toggles favorite state when favorite button is clicked', async () => {
    const handleFavoriteChange = jest.fn();
    const user = userEvent.setup();
    
    render(
      <MovieCard 
        movie={mockMovie} 
        onFavoriteChange={handleFavoriteChange}
        showFavorite={true}
      />
    );
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    await user.click(favoriteButton);
    
    expect(handleFavoriteChange).toHaveBeenCalledWith(mockMovie, true);
  });
  
  test('shows different sizes correctly', () => {
    const { rerender } = render(<MovieCard movie={mockMovie} size="small" />);
    
    expect(screen.getByRole('article')).toHaveClass('w-32');
    
    rerender(<MovieCard movie={mockMovie} size="large" />);
    expect(screen.getByRole('article')).toHaveClass('w-64');
  });
  
  test('handles image loading states', () => {
    render(<MovieCard movie={mockMovie} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
    
    // Simulate image load
    fireEvent.load(image);
    // Test loading state changes would go here
  });
});
```

### Testing Custom Hooks

```javascript
// src/hooks/__tests__/useLocalStorage.test.js

import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
  });
  
  test('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated value');
    });
    
    expect(result.current[0]).toBe('updated value');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'test-key', 
      JSON.stringify('updated value')
    );
  });
  
  test('loads value from localStorage on mount', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('stored value');
  });
  
  test('handles localStorage errors gracefully', () => {
    localStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
  });
  
  test('removes value correctly', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('some value');
    });
    
    act(() => {
      result.current[2](); // removeValue function
    });
    
    expect(result.current[0]).toBe('initial');
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
  
  test('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
  });
});
```

### Testing useToggle Hook

```javascript
// src/hooks/__tests__/useToggle.test.js

import { renderHook, act } from '@testing-library/react';
import useToggle from '../useToggle';

describe('useToggle Hook', () => {
  test('initializes with default false value', () => {
    const { result } = renderHook(() => useToggle());
    
    expect(result.current[0]).toBe(false);
  });
  
  test('initializes with provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    
    expect(result.current[0]).toBe(true);
  });
  
  test('toggles value correctly', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[1].toggle();
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1].toggle();
    });
    
    expect(result.current[0]).toBe(false);
  });
  
  test('sets value to true', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[1].setTrue();
    });
    
    expect(result.current[0]).toBe(true);
  });
  
  test('sets value to false', () => {
    const { result } = renderHook(() => useToggle(true));
    
    act(() => {
      result.current[1].setFalse();
    });
    
    expect(result.current[0]).toBe(false);
  });
  
  test('resets to initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    
    // Change the value
    act(() => {
      result.current[1].setFalse();
    });
    
    expect(result.current[0]).toBe(false);
    
    // Reset to initial
    act(() => {
      result.current[1].reset();
    });
    
    expect(result.current[0]).toBe(true);
  });
  
  test('calls callbacks when provided', () => {
    const onToggle = jest.fn();
    const onToggleTrue = jest.fn();
    const onToggleFalse = jest.fn();
    
    const { result } = renderHook(() => useToggle(false, {
      onToggle,
      onToggleTrue,
      onToggleFalse
    }));
    
    act(() => {
      result.current[1].setTrue();
    });
    
    expect(onToggle).toHaveBeenCalledWith(true, false);
    expect(onToggleTrue).toHaveBeenCalled();
    expect(onToggleFalse).not.toHaveBeenCalled();
  });
  
  test('tracks history when enabled', () => {
    const { result } = renderHook(() => useToggle(false, {
      trackHistory: true,
      maxHistoryLength: 5
    }));
    
    // Perform some toggles
    act(() => {
      result.current[1].setTrue();
    });
    
    act(() => {
      result.current[1].setFalse();
    });
    
    act(() => {
      result.current[1].toggle();
    });
    
    const metadata = result.current[2];
    expect(metadata.historyLength).toBe(4); // Including initial state
    expect(metadata.hasHistory).toBe(true);
  });
});
```

### Integration Testing

```javascript
// src/components/__tests__/AppIntegration.test.jsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import AppProvider from '../../contexts/AppContext';

// Test wrapper with all providers
function TestWrapper({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}

describe('App Integration Tests', () => {
  test('full user workflow: navigation and interaction', async () => {
    const user = userEvent.setup();
    
    render(<App />, { wrapper: TestWrapper });
    
    // User starts at welcome section
    expect(screen.getByText('Welcome to React Learning')).toBeInTheDocument();
    
    // Navigate to components section
    await user.click(screen.getByText('Components'));
    
    // Check that components section loads
    await waitFor(() => {
      expect(screen.getByText('React Components Deep Dive')).toBeInTheDocument();
    });
    
    // Interact with button demo
    const incrementButton = screen.getByText('Increment');
    await user.click(incrementButton);
    
    // Verify counter updated
    expect(screen.getByText(/Count: 1/)).toBeInTheDocument();
  });
  
  test('theme switching works across components', async () => {
    const user = userEvent.setup();
    
    render(<App />, { wrapper: TestWrapper });
    
    // Find and click theme toggle
    const themeButton = screen.getByTitle('Toggle dark mode');
    await user.click(themeButton);
    
    // Verify theme change applied
    const appContainer = screen.getByRole('main').closest('div');
    expect(appContainer).toHaveClass('dark');
  });
  
  test('error boundary catches component errors', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Component that throws an error
    function ErrorComponent() {
      throw new Error('Test error');
    }
    
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      </TestWrapper>
    );
    
    // Verify error boundary caught the error
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});
```

### Testing Context API

```javascript
// src/contexts/__tests__/AppContext.test.jsx

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppProvider, { useAppContext, useTheme, useNotifications } from '../AppContext';

// Test wrapper
function ContextWrapper({ children }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('AppContext', () => {
  test('provides initial state correctly', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: ContextWrapper
    });
    
    expect(result.current.theme.mode).toBe('light');
    expect(result.current.features.developerMode).toBe(false);
    expect(result.current.notifications).toEqual([]);
  });
  
  test('theme toggle works correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ContextWrapper
    });
    
    expect(result.current.isDarkMode).toBe(false);
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(true);
  });
  
  test('notifications system works', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ContextWrapper
    });
    
    act(() => {
      result.current.showSuccess('Test notification');
    });
    
    expect(result.current.activeNotifications).toHaveLength(1);
    expect(result.current.activeNotifications[0].message).toBe('Test notification');
    expect(result.current.activeNotifications[0].type).toBe('success');
  });
  
  test('notification dismissal works', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: ContextWrapper
    });
    
    let notificationId;
    
    act(() => {
      result.current.showInfo('Test notification');
      notificationId = result.current.activeNotifications[0].id;
    });
    
    expect(result.current.activeNotifications).toHaveLength(1);
    
    act(() => {
      result.current.dismissNotification(notificationId);
    });
    
    expect(result.current.activeNotifications).toHaveLength(0);
  });
});
```

### Testing API Service

```javascript
// src/services/__tests__/movieApi.test.js

import axios from 'axios';
import { 
  fetchPopularMovies, 
  searchMovies, 
  buildImageUrl, 
  formatRuntime 
} from '../movieApi';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Movie API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('fetchPopularMovies returns transformed data', async () => {
    const mockResponse = {
      data: {
        results: [
          {
            id: 1,
            title: 'Test Movie',
            overview: 'Test overview',
            vote_average: 8.5,
            release_date: '2024-01-01'
          }
        ],
        page: 1,
        total_pages: 10,
        total_results: 200
      }
    };
    
    mockedAxios.get.mockResolvedValue(mockResponse);
    
    const result = await fetchPopularMovies(1);
    
    expect(result.movies).toHaveLength(1);
    expect(result.movies[0].title).toBe('Test Movie');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(10);
  });
  
  test('searchMovies handles empty query', async () => {
    await expect(searchMovies('')).rejects.toMatchObject({
      type: 'INVALID_SEARCH_QUERY',
      message: 'Search query cannot be empty'
    });
  });
  
  test('buildImageUrl constructs URLs correctly', () => {
    expect(buildImageUrl('/test.jpg', 'w500'))
      .toBe('https://image.tmdb.org/t/p/w500/test.jpg');
    
    expect(buildImageUrl(null)).toBe(null);
    expect(buildImageUrl('')).toBe(null);
  });
  
  test('formatRuntime formats time correctly', () => {
    expect(formatRuntime(90)).toBe('1h 30m');
    expect(formatRuntime(60)).toBe('1h');
    expect(formatRuntime(30)).toBe('30m');
    expect(formatRuntime(0)).toBe('Unknown runtime');
    expect(formatRuntime(null)).toBe('Unknown runtime');
  });
});
```

## Testing Strategies by Component Type

### UI Components (Button, Input, Card)
**Focus on:** Props, events, accessibility, visual states
**Test:** Different variants, sizes, disabled states, click handlers, keyboard navigation

```javascript
test('button variants render correctly', () => {
  const variants = ['primary', 'secondary', 'danger', 'ghost'];
  
  variants.forEach(variant => {
    const { unmount } = render(<Button variant={variant}>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass(`bg-${variant === 'primary' ? 'blue' : variant === 'danger' ? 'red' : 'gray'}-`);
    unmount();
  });
});
```

### Feature Components (MovieCard, SearchBox)
**Focus on:** Business logic, user interactions, data handling
**Test:** Props processing, event callbacks, conditional rendering, error states

```javascript
test('movie card shows correct information', () => {
  const movie = { title: 'Test', year: 2024, rating: 8.5 };
  render(<MovieCard movie={movie} />);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
  expect(screen.getByText('2024')).toBeInTheDocument();
  expect(screen.getByText('8.5')).toBeInTheDocument();
});
```

### Layout Components (Navigation, Header, Footer)
**Focus on:** Responsive behavior, navigation logic, accessibility
**Test:** Menu toggles, responsive breakpoints, keyboard navigation

### Page Components (Home, Search, Details)
**Focus on:** Data integration, routing, complex workflows
**Test:** Data loading, error states, user workflows, navigation

## Advanced Testing Patterns

### Testing with Context

```javascript
function renderWithContext(component, contextValue = {}) {
  const Wrapper = ({ children }) => (
    <AppProvider initialState={contextValue}>
      {children}
    </AppProvider>
  );
  
  return render(component, { wrapper: Wrapper });
}

test('component uses context correctly', () => {
  renderWithContext(
    <ThemeToggle />,
    { theme: { mode: 'dark' } }
  );
  
  expect(screen.getByText('Light Mode')).toBeInTheDocument();
});
```

### Testing Async Operations

```javascript
test('handles async operations correctly', async () => {
  const user = userEvent.setup();
  render(<AsyncComponent />);
  
  const button = screen.getByText('Load Data');
  await user.click(button);
  
  // Wait for loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Data loaded!')).toBeInTheDocument();
  });
});
```

### Testing Error Scenarios

```javascript
test('handles API errors gracefully', async () => {
  // Mock API to throw error
  jest.spyOn(movieApi, 'fetchPopularMovies').mockRejectedValue(
    new Error('API Error')
  );
  
  render(<MovieList />);
  
  await waitFor(() => {
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
  
  // Test retry functionality
  const retryButton = screen.getByText('Try Again');
  await userEvent.click(retryButton);
  
  // Verify retry was attempted
  expect(movieApi.fetchPopularMovies).toHaveBeenCalledTimes(2);
});
```

### Accessibility Testing

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('component is accessible', async () => {
  const { container } = render(<MovieCard movie={mockMovie} />);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('keyboard navigation works', async () => {
  const user = userEvent.setup();
  render(<Navigation />);
  
  // Test tab navigation
  await user.tab();
  expect(screen.getByText('Home')).toHaveFocus();
  
  // Test arrow key navigation
  await user.keyboard('{ArrowRight}');
  expect(screen.getByText('Movies')).toHaveFocus();
});
```

## Test Utilities and Helpers

### Custom Render Function

```javascript
// src/test/utils.js

import React from 'react';
import { render } from '@testing-library/react';
import AppProvider from '../contexts/AppContext';

export function renderWithProviders(ui, options = {}) {
  const { initialState = {}, ...renderOptions } = options;
  
  function Wrapper({ children }) {
    return (
      <AppProvider initialState={initialState}>
        {children}
      </AppProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Custom matchers
export const customMatchers = {
  toBeVisible: (element) => ({
    pass: element.style.display !== 'none' && element.style.visibility !== 'hidden',
    message: () => `Expected element to be visible`
  })
};
```

### Mock Data Generators

```javascript
// src/test/mockData.js

export function createMockMovie(overrides = {}) {
  return {
    id: Math.floor(Math.random() * 10000),
    title: 'Mock Movie Title',
    overview: 'This is a mock movie for testing purposes.',
    releaseYear: 2024,
    voteAverage: 7.5,
    voteCount: 1000,
    ratingStars: 4,
    genres: [{ id: 1, name: 'Action' }],
    posterUrl: 'https://example.com/poster.jpg',
    isPopular: false,
    isHighRated: false,
    ...overrides
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    isAuthenticated: true,
    preferences: {
      theme: 'light',
      language: 'en',
      emailNotifications: true,
    },
    ...overrides
  };
}
```

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```javascript
test('descriptive test name', () => {
  // Arrange - Set up test data and render component
  const mockProps = { title: 'Test' };
  render(<Component {...mockProps} />);
  
  // Act - Perform user interactions
  fireEvent.click(screen.getByText('Click me'));
  
  // Assert - Verify expected behavior
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

### 2. User-Centric Testing

```javascript
// Good: Test user behavior
test('user can add movie to favorites', async () => {
  const user = userEvent.setup();
  render(<MovieCard movie={mockMovie} />);
  
  await user.click(screen.getByLabelText('Add to favorites'));
  expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
});

// Avoid: Testing implementation details
test('setState is called with correct value', () => {
  // This tests implementation, not behavior
});
```

### 3. Comprehensive Error Testing

```javascript
test('handles all error scenarios', async () => {
  const errorScenarios = [
    { error: new Error('Network error'), expectedMessage: /network/i },
    { error: new Error('Validation failed'), expectedMessage: /validation/i },
    { error: new Error('Unknown error'), expectedMessage: /unexpected/i },
  ];
  
  for (const scenario of errorScenarios) {
    jest.spyOn(api, 'fetchData').mockRejectedValue(scenario.error);
    
    render(<DataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument();
    });
  }
});
```

### 4. Performance Testing

```javascript
test('component renders efficiently', () => {
  const renderSpy = jest.fn();
  
  function TestComponent(props) {
    renderSpy();
    return <div>{props.value}</div>;
  }
  
  const MemoizedComponent = React.memo(TestComponent);
  
  const { rerender } = render(<MemoizedComponent value="test" />);
  expect(renderSpy).toHaveBeenCalledTimes(1);
  
  // Re-render with same props
  rerender(<MemoizedComponent value="test" />);
  expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render
  
  // Re-render with different props
  rerender(<MemoizedComponent value="different" />);
  expect(renderSpy).toHaveBeenCalledTimes(2); // Should re-render
});
```

## Running Tests

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for specific file
npm test -- Button.test.jsx

# Run tests matching pattern
npm test -- --grep "Button Component"
```

## Test Coverage Goals

### Coverage Targets
- **Statements**: 80%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 80%+

### What to Test
✅ **High Priority**
- User interactions and workflows
- Error handling and edge cases
- Accessibility features
- Critical business logic
- API integrations

⚠️ **Medium Priority**
- Component variants and props
- State management logic
- Performance optimizations
- Responsive behavior

❌ **Low Priority**
- Implementation details
- Third-party library behavior
- Trivial getters/setters
- Console.log statements

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

This comprehensive testing approach ensures that our educational movie app is not only functional but also maintainable, reliable, and serves as an excellent example of testing best practices for React applications.
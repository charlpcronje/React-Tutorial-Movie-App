/**
 * AppContext - Complete Educational Guide to React Context API
 * 
 * The React Context API is one of the most powerful features for managing application-wide state.
 * This implementation serves as a comprehensive educational example that demonstrates:
 * 
 * 1. CONTEXT CREATION: How to create and configure React contexts
 * 2. PROVIDER PATTERNS: How to wrap applications with context providers
 * 3. CONTEXT CONSUMPTION: Different ways to consume context data
 * 4. STATE MANAGEMENT: Complex state management with useReducer
 * 5. PERFORMANCE OPTIMIZATION: Preventing unnecessary re-renders
 * 6. CONTEXT COMPOSITION: Using multiple contexts together effectively
 * 7. CUSTOM HOOKS: Creating convenient hooks for context consumption
 * 8. TYPE SAFETY: Using JSDoc for better development experience
 * 9. DEBUGGING: Tools and patterns for debugging context issues
 * 10. REAL-WORLD PATTERNS: How context is used in production applications
 * 
 * Let's build this step by step with comprehensive explanations for every pattern.
 */

// React imports for context functionality
import React, { 
  createContext,     // For creating new contexts
  useContext,        // For consuming context values
  useReducer,        // For complex state management  
  useMemo,          // For performance optimization
  useCallback,      // For stable function references
  useEffect,        // For side effects and persistence
  useState          // For simple state values
} from 'react';

// Our custom hooks for additional functionality
import useLocalStorage from '../hooks/useLocalStorage.js';

/**
 * CONTEXT DEFINITIONS
 * 
 * We create multiple contexts for different concerns rather than one giant context.
 * This separation provides better performance and clearer responsibilities.
 */

/**
 * AppStateContext - Application-wide state
 * 
 * This context holds global application state that many components need access to:
 * - User preferences and settings
 * - Application configuration
 * - Global UI states (modals, notifications, etc.)
 * - Performance metrics and debugging info
 */
const AppStateContext = createContext(undefined);

/**
 * AppActionsContext - Action functions
 * 
 * We separate actions from state to prevent unnecessary re-renders.
 * Components that only need to trigger actions won't re-render when state changes.
 */
const AppActionsContext = createContext(undefined);

/**
 * UserContext - User-specific state and preferences
 * 
 * This context manages user-related data:
 * - User profile information
 * - Authentication status
 * - Personal preferences
 * - User activity and history
 */
const UserContext = createContext(undefined);

/**
 * MoviesContext - Movie-related global state
 * 
 * This context manages movie-specific data that needs to be shared:
 * - User's favorite movies
 * - Personal movie ratings
 * - Watch history
 * - Search history and preferences
 */
const MoviesContext = createContext(undefined);

/**
 * STATE MANAGEMENT WITH REDUCERS
 * 
 * We use useReducer for complex state management because it provides:
 * - Predictable state updates
 * - Clear action definitions
 * - Easy debugging and testing
 * - Better performance for complex updates
 */

// Action types for app state reducer
const APP_ACTIONS = {
  // Theme and appearance
  SET_THEME: 'SET_THEME',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  SET_ANIMATIONS: 'SET_ANIMATIONS',
  
  // UI state
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  DISMISS_NOTIFICATION: 'DISMISS_NOTIFICATION',
  
  // Application features
  TOGGLE_DEVELOPER_MODE: 'TOGGLE_DEVELOPER_MODE',
  SET_SOUND_EFFECTS: 'SET_SOUND_EFFECTS',
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
};

// Initial state for the application
const initialAppState = {
  // Theme and appearance settings
  theme: {
    mode: 'light',           // 'light' | 'dark' | 'auto'
    primaryColor: 'blue',    // Primary color scheme
    animations: true,        // Enable/disable animations globally
    reducedMotion: false,    // Respect user's motion preferences
  },
  
  // UI state
  modals: {
    isMovieDetailOpen: false,
    isSettingsOpen: false,
    isHelpOpen: false,
  },
  
  notifications: [],         // Array of notification objects
  
  // Application features
  features: {
    developerMode: false,    // Show debug information
    soundEffects: false,     // Enable sound feedback
    offlineMode: false,      // Offline functionality
    betaFeatures: false,     // Enable experimental features
  },
  
  // Loading states for different operations
  loading: {
    app: false,              // Overall app loading
    movies: false,           // Movies data loading
    userProfile: false,      // User data loading
    settings: false,         // Settings update loading
  },
  
  // Error state
  error: null,               // Current global error
  
  // Performance metrics
  performance: {
    renderCount: 0,
    navigationCount: 0,
    apiCallCount: 0,
    lastActionTime: null,
  },
  
  // Application metadata
  metadata: {
    version: '1.0.0',
    buildTime: Date.now(),
    environment: 'development',
  },
};

/**
 * App State Reducer
 * 
 * This reducer handles all application state updates in a predictable way.
 * Each action type has a specific responsibility and clear input/output contracts.
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
function appStateReducer(state, action) {
  console.log(`🔄 App State Action: ${action.type}`, action.payload);
  
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: {
          ...state.theme,
          mode: action.payload.mode || state.theme.mode,
          primaryColor: action.payload.primaryColor || state.theme.primaryColor,
        },
        performance: {
          ...state.performance,
          lastActionTime: Date.now(),
        }
      };
      
    case APP_ACTIONS.TOGGLE_DARK_MODE:
      const newMode = state.theme.mode === 'dark' ? 'light' : 'dark';
      return {
        ...state,
        theme: {
          ...state.theme,
          mode: newMode,
        },
        performance: {
          ...state.performance,
          lastActionTime: Date.now(),
        }
      };
      
    case APP_ACTIONS.SET_ANIMATIONS:
      return {
        ...state,
        theme: {
          ...state.theme,
          animations: action.payload,
        }
      };
      
    case APP_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalType]: true,
        }
      };
      
    case APP_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalType]: false,
        }
      };
      
    case APP_ACTIONS.SHOW_NOTIFICATION:
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
      };
      
      return {
        ...state,
        notifications: [...state.notifications, notification],
      };
      
    case APP_ACTIONS.DISMISS_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        ),
      };
      
    case APP_ACTIONS.TOGGLE_DEVELOPER_MODE:
      return {
        ...state,
        features: {
          ...state.features,
          developerMode: !state.features.developerMode,
        }
      };
      
    case APP_ACTIONS.SET_SOUND_EFFECTS:
      return {
        ...state,
        features: {
          ...state.features,
          soundEffects: action.payload,
        }
      };
      
    case APP_ACTIONS.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        performance: {
          ...state.performance,
          ...action.payload,
          lastActionTime: Date.now(),
        }
      };
      
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: {
          message: action.payload.message,
          type: action.payload.type || 'error',
          timestamp: Date.now(),
          details: action.payload.details,
        }
      };
      
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.operation]: true,
        }
      };
      
    case APP_ACTIONS.CLEAR_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.operation]: false,
        }
      };
      
    default:
      console.warn(`Unknown app action type: ${action.type}`);
      return state;
  }
}

/**
 * USER STATE MANAGEMENT
 * 
 * Separate reducer for user-specific state to demonstrate
 * how to organize complex state across multiple reducers.
 */

const USER_ACTIONS = {
  SET_USER_INFO: 'SET_USER_INFO',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

const initialUserState = {
  // User profile
  profile: {
    name: '',
    email: '',
    avatar: null,
    joinDate: null,
    isAuthenticated: false,
  },
  
  // User preferences
  preferences: {
    language: 'en',
    timezone: 'auto',
    emailNotifications: true,
    pushNotifications: false,
    autoplay: false,
    defaultMovieQuality: 'HD',
  },
  
  // User activity
  activity: {
    viewHistory: [],         // Movies viewed
    searchHistory: [],       // Recent searches
    sessionStartTime: Date.now(),
    totalSessions: 0,
  },
};

function userStateReducer(state, action) {
  console.log(`👤 User State Action: ${action.type}`, action.payload);
  
  switch (action.type) {
    case USER_ACTIONS.SET_USER_INFO:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        }
      };
      
    case USER_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        }
      };
      
    case USER_ACTIONS.ADD_TO_HISTORY:
      const historyType = action.payload.type; // 'view' | 'search'
      const historyArray = historyType === 'view' ? 'viewHistory' : 'searchHistory';
      
      return {
        ...state,
        activity: {
          ...state.activity,
          [historyArray]: [
            ...state.activity[historyArray].slice(-19), // Keep last 19 items
            {
              ...action.payload.data,
              timestamp: Date.now(),
            }
          ]
        }
      };
      
    case USER_ACTIONS.CLEAR_HISTORY:
      return {
        ...state,
        activity: {
          ...state.activity,
          viewHistory: [],
          searchHistory: [],
        }
      };
      
    case USER_ACTIONS.LOGIN:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload.userInfo,
          isAuthenticated: true,
        },
        activity: {
          ...state.activity,
          totalSessions: state.activity.totalSessions + 1,
          sessionStartTime: Date.now(),
        }
      };
      
    case USER_ACTIONS.LOGOUT:
      return {
        ...initialUserState,
        activity: {
          ...state.activity,
          totalSessions: state.activity.totalSessions,
        }
      };
      
    default:
      return state;
  }
}

/**
 * MOVIES STATE MANAGEMENT
 * 
 * Separate context for movie-related data and user interactions.
 */

const MOVIES_ACTIONS = {
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE', 
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_RATING: 'SET_RATING',
  REMOVE_RATING: 'REMOVE_RATING',
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_WATCHLIST: 'UPDATE_WATCHLIST',
  SET_RECENTLY_VIEWED: 'SET_RECENTLY_VIEWED',
};

const initialMoviesState = {
  // User's personalized movie data
  favorites: [],               // Array of favorite movie objects
  ratings: {},                // Object mapping movieId to rating (1-5)
  comments: {},               // Object mapping movieId to comment arrays
  watchlist: [],              // Movies to watch later
  recentlyViewed: [],         // Recently viewed movies
  
  // User preferences for movie browsing
  viewPreferences: {
    defaultSort: 'popularity',  // popularity, rating, release_date, title
    defaultGenre: 'all',       // Filter preference
    cardsPerRow: 'auto',       // Layout preference
    showAdultContent: false,   // Content filtering
  },
  
  // Search and discovery state
  searchState: {
    recentSearches: [],        // Last 10 searches
    savedFilters: [],          // User's saved filter combinations
    recommendations: [],        // Personalized recommendations
  },
};

function moviesStateReducer(state, action) {
  console.log(`🎬 Movies State Action: ${action.type}`, action.payload);
  
  switch (action.type) {
    case MOVIES_ACTIONS.ADD_FAVORITE:
      const movieToAdd = action.payload;
      const isAlreadyFavorite = state.favorites.some(fav => fav.id === movieToAdd.id);
      
      if (isAlreadyFavorite) {
        console.log(`Movie ${movieToAdd.title} is already in favorites`);
        return state;
      }
      
      return {
        ...state,
        favorites: [...state.favorites, movieToAdd],
      };
      
    case MOVIES_ACTIONS.REMOVE_FAVORITE:
      const movieIdToRemove = action.payload;
      return {
        ...state,
        favorites: state.favorites.filter(movie => movie.id !== movieIdToRemove),
      };
      
    case MOVIES_ACTIONS.SET_RATING:
      const { movieId, rating } = action.payload;
      return {
        ...state,
        ratings: {
          ...state.ratings,
          [movieId]: rating,
        }
      };
      
    case MOVIES_ACTIONS.REMOVE_RATING:
      const { [action.payload]: removed, ...remainingRatings } = state.ratings;
      return {
        ...state,
        ratings: remainingRatings,
      };
      
    case MOVIES_ACTIONS.ADD_COMMENT:
      const { movieId: commentMovieId, comment } = action.payload;
      const existingComments = state.comments[commentMovieId] || [];
      
      return {
        ...state,
        comments: {
          ...state.comments,
          [commentMovieId]: [
            ...existingComments,
            {
              id: Date.now(),
              text: comment,
              timestamp: Date.now(),
            }
          ]
        }
      };
      
    case MOVIES_ACTIONS.SET_RECENTLY_VIEWED:
      const viewedMovie = action.payload;
      const filteredRecent = state.recentlyViewed.filter(movie => movie.id !== viewedMovie.id);
      
      return {
        ...state,
        recentlyViewed: [
          viewedMovie,
          ...filteredRecent.slice(0, 9) // Keep last 10 items
        ],
      };
      
    default:
      return state;
  }
}

/**
 * MAIN APP PROVIDER COMPONENT
 * 
 * This component wraps our entire application and provides all contexts.
 * It demonstrates the provider pattern and context composition.
 */
function AppProvider({ children }) {
  console.log('🏗️ AppProvider rendering...');
  
  /**
   * STATE INITIALIZATION
   * 
   * We initialize all our different pieces of state using different strategies
   * to demonstrate various state management approaches.
   */
  
  // App state with useReducer (for complex, coordinated updates)
  const [appState, appDispatch] = useReducer(appStateReducer, initialAppState);
  
  // User state with useReducer (for user-specific complex state)
  const [userState, userDispatch] = useReducer(userStateReducer, initialUserState);
  
  // Movies state with useReducer (for movie-related complex state)
  const [moviesState, moviesDispatch] = useReducer(moviesStateReducer, initialMoviesState);
  
  // Simple state for immediate UI feedback (when reducer would be overkill)
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  /**
   * PERSISTENT STATE SYNCHRONIZATION
   * 
   * We sync certain state values with localStorage to demonstrate
   * how to persist context state across browser sessions.
   */
  
  // Persist user preferences
  const [persistedUserPrefs, setPersistedUserPrefs] = useLocalStorage('user_preferences', {});
  const [persistedAppSettings, setPersistedAppSettings] = useLocalStorage('app_settings', {});
  const [persistedMovieData, setPersistedMovieData] = useLocalStorage('movie_data', {});
  
  /**
   * DERIVED STATE AND COMPUTED VALUES
   * 
   * We compute derived values using useMemo to demonstrate
   * how to create efficient computed state in context.
   */
  
  // Computed app state values
  const computedAppState = useMemo(() => ({
    // Theme information
    isDarkMode: appState.theme.mode === 'dark',
    isLightMode: appState.theme.mode === 'light',
    shouldReduceMotion: appState.theme.reducedMotion || !appState.theme.animations,
    
    // UI state helpers
    hasOpenModals: Object.values(appState.modals).some(isOpen => isOpen),
    activeNotifications: appState.notifications.filter(n => !n.dismissed),
    notificationCount: appState.notifications.length,
    
    // Feature flags
    isDebugMode: appState.features.developerMode,
    hasAdvancedFeatures: appState.features.betaFeatures,
    
    // Loading state helpers
    isAnyLoading: Object.values(appState.loading).some(loading => loading),
    loadingOperations: Object.entries(appState.loading)
      .filter(([operation, loading]) => loading)
      .map(([operation]) => operation),
    
    // Error state helpers
    hasError: appState.error !== null,
    errorMessage: appState.error?.message,
  }), [appState]);
  
  // Computed user state values
  const computedUserState = useMemo(() => ({
    // Authentication helpers
    isLoggedIn: userState.profile.isAuthenticated,
    userDisplayName: userState.profile.name || 'Guest User',
    
    // Activity statistics
    viewCount: userState.activity.viewHistory.length,
    searchCount: userState.activity.searchHistory.length,
    sessionDuration: Date.now() - userState.activity.sessionStartTime,
    
    // Preference helpers
    prefersDarkMode: userState.preferences.theme === 'dark',
    hasNotificationsEnabled: userState.preferences.emailNotifications || userState.preferences.pushNotifications,
  }), [userState]);
  
  // Computed movies state values
  const computedMoviesState = useMemo(() => ({
    // Collection statistics
    favoritesCount: moviesState.favorites.length,
    ratingsCount: Object.keys(moviesState.ratings).length,
    watchlistCount: moviesState.watchlist.length,
    
    // User preferences
    averageRating: Object.keys(moviesState.ratings).length > 0
      ? Object.values(moviesState.ratings).reduce((sum, rating) => sum + rating, 0) / Object.keys(moviesState.ratings).length
      : 0,
    
    // Helper functions for checking movie status
    isFavorite: (movieId) => moviesState.favorites.some(fav => fav.id === movieId),
    getUserRating: (movieId) => moviesState.ratings[movieId] || 0,
    getComments: (movieId) => moviesState.comments[movieId] || [],
  }), [moviesState]);
  
  /**
   * ACTION CREATORS
   * 
   * We create action creator functions that provide a clean API for components
   * to interact with our state. This demonstrates the action creator pattern.
   */
  
  // App action creators
  const appActions = useMemo(() => ({
    // Theme actions
    setTheme: (themeConfig) => {
      appDispatch({ type: APP_ACTIONS.SET_THEME, payload: themeConfig });
    },
    
    toggleDarkMode: () => {
      appDispatch({ type: APP_ACTIONS.TOGGLE_DARK_MODE });
    },
    
    setAnimations: (enabled) => {
      appDispatch({ type: APP_ACTIONS.SET_ANIMATIONS, payload: enabled });
    },
    
    // Modal actions
    openModal: (modalType) => {
      appDispatch({ type: APP_ACTIONS.OPEN_MODAL, payload: { modalType } });
    },
    
    closeModal: (modalType) => {
      appDispatch({ type: APP_ACTIONS.CLOSE_MODAL, payload: { modalType } });
    },
    
    // Notification actions
    showNotification: (message, type = 'info', duration = 5000) => {
      appDispatch({ 
        type: APP_ACTIONS.SHOW_NOTIFICATION, 
        payload: { message, type, duration } 
      });
    },
    
    dismissNotification: (notificationId) => {
      appDispatch({ 
        type: APP_ACTIONS.DISMISS_NOTIFICATION, 
        payload: { id: notificationId } 
      });
    },
    
    // Feature toggles
    toggleDeveloperMode: () => {
      appDispatch({ type: APP_ACTIONS.TOGGLE_DEVELOPER_MODE });
    },
    
    setSoundEffects: (enabled) => {
      appDispatch({ type: APP_ACTIONS.SET_SOUND_EFFECTS, payload: enabled });
    },
    
    // Performance tracking
    updatePerformanceMetrics: (metrics) => {
      appDispatch({ 
        type: APP_ACTIONS.UPDATE_PERFORMANCE_METRICS, 
        payload: metrics 
      });
    },
    
    // Error handling
    setError: (message, details = null, type = 'error') => {
      appDispatch({ 
        type: APP_ACTIONS.SET_ERROR, 
        payload: { message, details, type } 
      });
    },
    
    clearError: () => {
      appDispatch({ type: APP_ACTIONS.CLEAR_ERROR });
    },
    
    // Loading states
    setLoading: (operation) => {
      appDispatch({ type: APP_ACTIONS.SET_LOADING, payload: { operation } });
    },
    
    clearLoading: (operation) => {
      appDispatch({ type: APP_ACTIONS.CLEAR_LOADING, payload: { operation } });
    },
  }), []);
  
  // User action creators
  const userActions = useMemo(() => ({
    setUserInfo: (userInfo) => {
      userDispatch({ type: USER_ACTIONS.SET_USER_INFO, payload: userInfo });
    },
    
    updatePreferences: (preferences) => {
      userDispatch({ type: USER_ACTIONS.UPDATE_PREFERENCES, payload: preferences });
    },
    
    addToHistory: (type, data) => {
      userDispatch({ type: USER_ACTIONS.ADD_TO_HISTORY, payload: { type, data } });
    },
    
    clearHistory: () => {
      userDispatch({ type: USER_ACTIONS.CLEAR_HISTORY });
    },
    
    login: (userInfo) => {
      userDispatch({ type: USER_ACTIONS.LOGIN, payload: { userInfo } });
    },
    
    logout: () => {
      userDispatch({ type: USER_ACTIONS.LOGOUT });
    },
  }), []);
  
  // Movies action creators
  const moviesActions = useMemo(() => ({
    addFavorite: (movie) => {
      moviesDispatch({ type: MOVIES_ACTIONS.ADD_FAVORITE, payload: movie });
    },
    
    removeFavorite: (movieId) => {
      moviesDispatch({ type: MOVIES_ACTIONS.REMOVE_FAVORITE, payload: movieId });
    },
    
    setRating: (movieId, rating) => {
      moviesDispatch({ type: MOVIES_ACTIONS.SET_RATING, payload: { movieId, rating } });
    },
    
    removeRating: (movieId) => {
      moviesDispatch({ type: MOVIES_ACTIONS.REMOVE_RATING, payload: movieId });
    },
    
    addComment: (movieId, comment) => {
      moviesDispatch({ type: MOVIES_ACTIONS.ADD_COMMENT, payload: { movieId, comment } });
    },
    
    addToRecentlyViewed: (movie) => {
      moviesDispatch({ type: MOVIES_ACTIONS.SET_RECENTLY_VIEWED, payload: movie });
    },
  }), []);
  
  /**
   * SIDE EFFECTS AND PERSISTENCE
   * 
   * These effects handle synchronization with external systems
   * and demonstrate how to manage side effects in context providers.
   */
  
  // Sync with localStorage
  useEffect(() => {
    // Sync user preferences
    setPersistedUserPrefs({
      profile: userState.profile,
      preferences: userState.preferences,
    });
  }, [userState.profile, userState.preferences, setPersistedUserPrefs]);
  
  useEffect(() => {
    // Sync app settings
    setPersistedAppSettings({
      theme: appState.theme,
      features: appState.features,
    });
  }, [appState.theme, appState.features, setPersistedAppSettings]);
  
  useEffect(() => {
    // Sync movie data
    setPersistedMovieData({
      favorites: moviesState.favorites,
      ratings: moviesState.ratings,
      watchlist: moviesState.watchlist,
    });
  }, [moviesState.favorites, moviesState.ratings, moviesState.watchlist, setPersistedMovieData]);
  
  // Online/offline status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Auto-dismiss notifications
  useEffect(() => {
    appState.notifications.forEach(notification => {
      if (notification.duration > 0) {
        setTimeout(() => {
          appActions.dismissNotification(notification.id);
        }, notification.duration);
      }
    });
  }, [appState.notifications, appActions]);
  
  /**
   * CONTEXT VALUES
   * 
   * We prepare the values that will be provided through context.
   * These are memoized to prevent unnecessary re-renders.
   */
  
  const appContextValue = useMemo(() => ({
    // State
    ...appState,
    ...computedAppState,
    
    // Additional runtime info
    isOnline,
    
    // Actions
    actions: appActions,
  }), [appState, computedAppState, isOnline, appActions]);
  
  const userContextValue = useMemo(() => ({
    // State
    ...userState,
    ...computedUserState,
    
    // Actions
    actions: userActions,
  }), [userState, computedUserState, userActions]);
  
  const moviesContextValue = useMemo(() => ({
    // State
    ...moviesState,
    ...computedMoviesState,
    
    // Actions
    actions: moviesActions,
  }), [moviesState, computedMoviesState, moviesActions]);
  
  /**
   * PROVIDER COMPOSITION
   * 
   * We compose multiple providers together. The order matters for dependencies,
   * but these contexts are designed to be independent.
   */
  return (
    <AppStateContext.Provider value={appContextValue}>
      <AppActionsContext.Provider value={appActions}>
        <UserContext.Provider value={userContextValue}>
          <MoviesContext.Provider value={moviesContextValue}>
            {children}
          </MoviesContext.Provider>
        </UserContext.Provider>
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

/**
 * CUSTOM HOOKS FOR CONTEXT CONSUMPTION
 * 
 * We create custom hooks that provide convenient APIs for consuming our contexts.
 * This is the recommended pattern for accessing context data.
 */

/**
 * useAppContext Hook - Access app-wide state and actions
 * 
 * @returns {Object} App state and actions
 */
export function useAppContext() {
  const context = useContext(AppStateContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

/**
 * useUserContext Hook - Access user state and actions
 * 
 * @returns {Object} User state and actions
 */
export function useUserContext() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserContext must be used within an AppProvider');
  }
  
  return context;
}

/**
 * useMoviesContext Hook - Access movies state and actions
 * 
 * @returns {Object} Movies state and actions
 */
export function useMoviesContext() {
  const context = useContext(MoviesContext);
  
  if (context === undefined) {
    throw new Error('useMoviesContext must be used within an AppProvider');
  }
  
  return context;
}

/**
 * SPECIALIZED CONTEXT HOOKS
 * 
 * We can create more specialized hooks that provide specific slices of context data.
 */

/**
 * useTheme Hook - Access only theme-related state and actions
 */
export function useTheme() {
  const { theme, isDarkMode, isLightMode, actions } = useAppContext();
  
  return {
    theme,
    isDarkMode,
    isLightMode,
    toggleDarkMode: actions.toggleDarkMode,
    setTheme: actions.setTheme,
    setAnimations: actions.setAnimations,
  };
}

/**
 * useNotifications Hook - Access notification system
 */
export function useNotifications() {
  const { notifications, activeNotifications, actions } = useAppContext();
  
  return {
    notifications,
    activeNotifications,
    showNotification: actions.showNotification,
    dismissNotification: actions.dismissNotification,
    
    // Convenience methods
    showSuccess: (message) => actions.showNotification(message, 'success'),
    showError: (message) => actions.showNotification(message, 'error'),
    showWarning: (message) => actions.showNotification(message, 'warning'),
    showInfo: (message) => actions.showNotification(message, 'info'),
  };
}

/**
 * useFavorites Hook - Access user's favorite movies
 */
export function useFavorites() {
  const { favorites, favoritesCount, actions } = useMoviesContext();
  
  return {
    favorites,
    favoritesCount,
    addFavorite: actions.addFavorite,
    removeFavorite: actions.removeFavorite,
    
    // Helper functions
    isFavorite: (movieId) => favorites.some(fav => fav.id === movieId),
    toggleFavorite: (movie) => {
      const isCurrentlyFavorite = favorites.some(fav => fav.id === movie.id);
      if (isCurrentlyFavorite) {
        actions.removeFavorite(movie.id);
      } else {
        actions.addFavorite(movie);
      }
    },
  };
}

// Export the provider and action constants
export default AppProvider;
export { APP_ACTIONS, USER_ACTIONS, MOVIES_ACTIONS };

/**
 * COMPREHENSIVE USAGE EXAMPLES:
 * 
 * BASIC CONTEXT CONSUMPTION:
 * ```jsx
 * function ThemeToggle() {
 *   const { isDarkMode, toggleDarkMode } = useTheme();
 *   
 *   return (
 *     <Button onClick={toggleDarkMode} variant={isDarkMode ? 'secondary' : 'primary'}>
 *       {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
 *     </Button>
 *   );
 * }
 * ```
 * 
 * NOTIFICATION SYSTEM:
 * ```jsx
 * function NotificationExample() {
 *   const { showSuccess, showError, activeNotifications } = useNotifications();
 *   
 *   return (
 *     <div>
 *       <Button onClick={() => showSuccess('Operation completed!')}>
 *         Show Success
 *       </Button>
 *       <Button onClick={() => showError('Something went wrong!')}>
 *         Show Error
 *       </Button>
 *       
 *       {activeNotifications.length > 0 && (
 *         <div className="notifications">
 *           {activeNotifications.map(notification => (
 *             <div key={notification.id} className={`alert alert-${notification.type}`}>
 *               {notification.message}
 *             </div>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * FAVORITES MANAGEMENT:
 * ```jsx
 * function MovieFavoriteButton({ movie }) {
 *   const { isFavorite, toggleFavorite } = useFavorites();
 *   const isMovieFavorite = isFavorite(movie.id);
 *   
 *   return (
 *     <Button
 *       variant={isMovieFavorite ? 'danger' : 'secondary'}
 *       onClick={() => toggleFavorite(movie)}
 *     >
 *       {isMovieFavorite ? '💔 Remove' : '❤️ Add to Favorites'}
 *     </Button>
 *   );
 * }
 * ```
 * 
 * USER AUTHENTICATION:
 * ```jsx
 * function UserProfile() {
 *   const { profile, isLoggedIn, userDisplayName, actions } = useUserContext();
 *   
 *   if (!isLoggedIn) {
 *     return (
 *       <Button onClick={() => actions.login({ name: 'Demo User', email: 'demo@example.com' })}>
 *         Log In
 *       </Button>
 *     );
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {userDisplayName}!</p>
 *       <Button onClick={actions.logout} variant="secondary">
 *         Log Out
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. CONTEXT ARCHITECTURE:
 *    - Multiple contexts for separation of concerns
 *    - Provider composition patterns
 *    - Context dependency management
 * 
 * 2. STATE MANAGEMENT PATTERNS:
 *    - useReducer for complex, coordinated state
 *    - Action creators for clean APIs
 *    - Computed state with useMemo
 * 
 * 3. PERFORMANCE OPTIMIZATION:
 *    - Memoized context values to prevent unnecessary re-renders
 *    - Separated state and actions contexts
 *    - Efficient state updates and subscriptions
 * 
 * 4. PERSISTENCE STRATEGIES:
 *    - localStorage integration
 *    - Cross-tab synchronization
 *    - State hydration and dehydration
 * 
 * 5. ERROR HANDLING:
 *    - Context consumption validation
 *    - Graceful error boundaries integration
 *    - User-friendly error messaging
 * 
 * 6. REAL-WORLD PATTERNS:
 *    - Authentication state management
 *    - User preferences and personalization
 *    - Notification systems
 *    - Theme and appearance control
 * 
 * This context implementation provides a solid foundation for managing
 * complex application state while maintaining performance and developer experience.
 */
/**
 * ContextShowcase Component - Complete Context API Educational Demo
 * 
 * This component provides a comprehensive demonstration of React Context API
 * through practical, interactive examples. It shows how global state management
 * works in real React applications and teaches:
 * 
 * 1. CONTEXT CONSUMPTION: Different ways to access context data
 * 2. GLOBAL STATE UPDATES: How changes propagate through component trees
 * 3. PERFORMANCE PATTERNS: When and how context re-renders components
 * 4. MULTIPLE CONTEXTS: Using different contexts for different concerns
 * 5. CUSTOM CONTEXT HOOKS: Convenient APIs for context consumption
 * 6. CONTEXT COMPOSITION: Building complex state from multiple contexts
 * 7. STATE PERSISTENCE: Integrating context with localStorage
 * 8. REAL-WORLD PATTERNS: Theme switching, user preferences, notifications
 * 9. DEBUGGING CONTEXT: Tools and techniques for debugging context issues
 * 10. PERFORMANCE OPTIMIZATION: Preventing unnecessary re-renders
 * 
 * Every pattern demonstrated here is used in production React applications.
 */

// React imports for context consumption
import React, { useState, useEffect, useCallback } from 'react';

// Our context hooks
import { 
  useAppContext, 
  useUserContext, 
  useMoviesContext, 
  useTheme, 
  useNotifications,
  useFavorites 
} from '../../contexts/AppContext.jsx';

// Our UI components
import Button from '../ui/Button.jsx';

// Utilities
import { clsx } from 'clsx';

/**
 * ContextShowcase Component Definition
 * 
 * This component must be wrapped in our AppProvider to access context values.
 * It demonstrates various context consumption patterns.
 */
function ContextShowcase() {
  console.log('🌍 ContextShowcase component rendering...');
  
  /**
   * CONTEXT CONSUMPTION EXAMPLES
   * 
   * We demonstrate different ways to access context data,
   * from simple hooks to complex derived state.
   */
  
  // Using our custom context hooks
  const appContext = useAppContext();
  const userContext = useUserContext();
  const moviesContext = useMoviesContext();
  
  // Using specialized context hooks
  const theme = useTheme();
  const notifications = useNotifications();
  const favorites = useFavorites();
  
  /**
   * LOCAL STATE FOR DEMONSTRATIONS
   * 
   * Local state for context interaction examples.
   */
  const [demoNotificationText, setDemoNotificationText] = useState('Hello from Context API!');
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [contextMetrics, setContextMetrics] = useState({
    renderCount: 0,
    lastUpdate: Date.now(),
  });
  
  /**
   * PERFORMANCE TRACKING
   * 
   * Track re-renders to demonstrate context performance patterns.
   */
  useEffect(() => {
    setContextMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastUpdate: Date.now(),
    }));
  });
  
  /**
   * EVENT HANDLERS FOR CONTEXT INTERACTIONS
   * 
   * These functions demonstrate how to trigger context updates
   * and how those updates propagate through the component tree.
   */
  
  // Theme-related actions
  const handleThemeChange = useCallback(() => {
    console.log('🎨 Toggling theme via context...');
    theme.toggleDarkMode();
  }, [theme]);
  
  const handleAnimationToggle = useCallback(() => {
    console.log('✨ Toggling animations via context...');
    theme.setAnimations(!appContext.theme.animations);
  }, [theme, appContext.theme.animations]);
  
  // Notification actions
  const handleShowNotification = useCallback((type = 'info') => {
    console.log(`📢 Showing ${type} notification via context...`);
    
    const messages = {
      info: demoNotificationText,
      success: '✅ Context API is working perfectly!',
      warning: '⚠️ This is a warning from the context system',
      error: '❌ This is an error notification example',
    };
    
    notifications.showNotification(messages[type], type);
  }, [demoNotificationText, notifications]);
  
  // User context actions
  const handleUserLogin = useCallback(() => {
    console.log('👤 Logging in user via context...');
    
    userContext.actions.login({
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: '👤',
      joinDate: Date.now(),
    });
    
    notifications.showSuccess('Welcome to the Educational Movie App!');
  }, [userContext.actions, notifications]);
  
  const handleUserLogout = useCallback(() => {
    console.log('👋 Logging out user via context...');
    
    userContext.actions.logout();
    notifications.showInfo('You have been logged out successfully');
  }, [userContext.actions, notifications]);
  
  // Movies context actions
  const handleAddSampleFavorite = useCallback(() => {
    console.log('❤️ Adding sample movie to favorites via context...');
    
    const sampleMovie = {
      id: Date.now(),
      title: `Context Demo Movie ${Math.floor(Math.random() * 100)}`,
      overview: 'This movie was added through the Context API!',
      releaseYear: 2024,
      voteAverage: Math.floor(Math.random() * 5) + 5,
      genres: [{ id: 1, name: 'Educational' }],
    };
    
    favorites.addFavorite(sampleMovie);
    notifications.showSuccess(`Added "${sampleMovie.title}" to favorites!`);
  }, [favorites, notifications]);
  
  /**
   * CONTEXT STATE VISUALIZATION
   * 
   * Helper function to display current context state in a readable format.
   */
  const renderContextState = useCallback((label, contextData, maxDepth = 2) => {
    const formatValue = (value, depth = 0) => {
      if (depth > maxDepth) return '...';
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return `[${value.length} items]`;
        }
        return `{${Object.keys(value).length} properties}`;
      }
      
      if (typeof value === 'function') {
        return '[Function]';
      }
      
      if (typeof value === 'string' && value.length > 30) {
        return `"${value.substring(0, 30)}..."`;
      }
      
      return JSON.stringify(value);
    };
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="font-medium text-gray-900 mb-2">{label}</h4>
        <div className="space-y-1 text-sm font-mono">
          {Object.entries(contextData).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-blue-600">{key}:</span>
              <span className="text-gray-700">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }, []);
  
  /**
   * COMPONENT RENDER
   * 
   * The showcase interface demonstrating all Context API patterns.
   */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Section */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Context API Deep Dive
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore React Context API through interactive examples that demonstrate
          global state management, cross-component communication, and real-world patterns.
        </p>
        
        {/* Performance Metrics */}
        <div className="mt-6 inline-flex items-center space-x-4 bg-yellow-50 px-4 py-2 rounded-full text-sm">
          <span>Render #{contextMetrics.renderCount}</span>
          <span>•</span>
          <span>Last update: {new Date(contextMetrics.lastUpdate).toLocaleTimeString()}</span>
        </div>
      </header>
      
      {/* Theme Context Demo */}
      <section className="card">
        <h2 className="text-2xl font-semibold mb-4">1. Theme Context Demo</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates global theme management through Context API. 
          Changes here affect the entire application instantly, showing how 
          context enables app-wide state synchronization.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Theme Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Theme Controls</h3>
            <div className="space-y-4">
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Dark Mode</span>
                  <p className="text-sm text-gray-600">
                    Toggle between light and dark themes
                  </p>
                </div>
                <Button
                  size="small"
                  variant={theme.isDarkMode ? 'primary' : 'secondary'}
                  onClick={handleThemeChange}
                >
                  {theme.isDarkMode ? '🌙 Dark' : '☀️ Light'}
                </Button>
              </div>
              
              {/* Animations Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">Animations</span>
                  <p className="text-sm text-gray-600">
                    Enable or disable UI animations globally
                  </p>
                </div>
                <Button
                  size="small"
                  variant={appContext.theme.animations ? 'primary' : 'secondary'}
                  onClick={handleAnimationToggle}
                >
                  {appContext.theme.animations ? '✨ On' : '⏸️ Off'}
                </Button>
              </div>
              
              {/* Primary Color Selection */}
              <div>
                <span className="block font-medium mb-2">Primary Color</span>
                <div className="flex space-x-2">
                  {['blue', 'purple', 'green', 'red'].map(color => (
                    <Button
                      key={color}
                      size="small"
                      variant={appContext.theme.primaryColor === color ? 'primary' : 'secondary'}
                      onClick={() => theme.setTheme({ primaryColor: color })}
                      className="capitalize"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Theme State Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Theme State</h3>
            
            {/* Theme Preview */}
            <div className={clsx(
              'p-4 rounded-lg border-2 transition-all duration-300',
              theme.isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            )}>
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {theme.isDarkMode ? '🌙' : '☀️'}
                </div>
                <h4 className="font-semibold mb-2">
                  {theme.isDarkMode ? 'Dark Theme' : 'Light Theme'}
                </h4>
                <p className="text-sm opacity-80">
                  Animations: {appContext.theme.animations ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-sm opacity-80">
                  Primary: {appContext.theme.primaryColor}
                </p>
              </div>
            </div>
            
            {/* Context State Visualization */}
            <div className="mt-4">
              {renderContextState('Theme Context State', {
                mode: theme.theme.mode,
                animations: appContext.theme.animations,
                primaryColor: appContext.theme.primaryColor,
                isDarkMode: theme.isDarkMode,
                isLightMode: theme.isLightMode,
              })}
            </div>
          </div>
        </div>
      </section>
      
      {/* User Context Demo */}
      <section className="card">
        <h2 className="text-2xl font-semibold mb-4">2. User Context Demo</h2>
        <p className="text-gray-600 mb-6">
          This shows how user authentication and profile data can be managed
          globally through Context API, making user information available
          throughout the entire application.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* User Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Authentication</h3>
            
            {!userContext.isLoggedIn ? (
              <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-4xl mb-4">👤</div>
                <h4 className="font-semibold text-blue-900 mb-2">Not Logged In</h4>
                <p className="text-blue-800 text-sm mb-4">
                  Experience how user context works by logging in
                </p>
                <Button variant="primary" onClick={handleUserLogin}>
                  Demo Login
                </Button>
              </div>
            ) : (
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-4xl mb-4">{userContext.profile.avatar}</div>
                <h4 className="font-semibold text-green-900 mb-2">
                  Welcome, {userContext.userDisplayName}!
                </h4>
                <p className="text-green-800 text-sm mb-4">
                  {userContext.profile.email}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-green-900">Sessions</div>
                    <div className="text-green-700">{userContext.activity.totalSessions}</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-green-900">Session Time</div>
                    <div className="text-green-700">
                      {Math.round(userContext.sessionDuration / 1000)}s
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" onClick={handleUserLogout}>
                  Demo Logout
                </Button>
              </div>
            )}
            
            {/* User Preferences */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">User Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={userContext.preferences.emailNotifications}
                    onChange={(e) => userContext.actions.updatePreferences({
                      emailNotifications: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </label>
                
                <label className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Auto-play Videos</span>
                  <input
                    type="checkbox"
                    checked={userContext.preferences.autoplay}
                    onChange={(e) => userContext.actions.updatePreferences({
                      autoplay: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </label>
                
                <div className="p-2 bg-gray-50 rounded">
                  <span className="block text-sm mb-1">Language</span>
                  <select
                    value={userContext.preferences.language}
                    onChange={(e) => userContext.actions.updatePreferences({
                      language: e.target.value
                    })}
                    className="form-input text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* User State Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Context State</h3>
            
            {renderContextState('Current User State', {
              isLoggedIn: userContext.isLoggedIn,
              userName: userContext.userDisplayName,
              email: userContext.profile.email,
              language: userContext.preferences.language,
              notifications: userContext.preferences.emailNotifications,
              autoplay: userContext.preferences.autoplay,
              sessionTime: `${Math.round(userContext.sessionDuration / 1000)}s`,
              totalSessions: userContext.activity.totalSessions,
            })}
            
            {/* User Activity History */}
            {userContext.activity.viewHistory.length > 0 && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-medium text-purple-900 mb-2">Recent Activity</h4>
                <div className="space-y-1 text-sm">
                  {userContext.activity.viewHistory.slice(-5).map((item, index) => (
                    <div key={index} className="flex justify-between text-purple-800">
                      <span>{item.title || item.action}</span>
                      <span className="text-purple-600 text-xs">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Movies Context Demo */}
      <section className="card">
        <h2 className="text-2xl font-semibold mb-4">3. Movies Context Demo</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates how movie-specific data like favorites, ratings, and
          watchlists can be managed globally and accessed by any component.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Movie Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Movie Collection Management</h3>
            
            <div className="space-y-4">
              {/* Add Demo Favorite */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Favorites Collection</h4>
                <p className="text-red-800 text-sm mb-3">
                  Current favorites: {favorites.favoritesCount}
                </p>
                
                <div className="flex space-x-2">
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={handleAddSampleFavorite}
                  >
                    ❤️ Add Demo Favorite
                  </Button>
                  
                  {favorites.favoritesCount > 0 && (
                    <Button 
                      size="small" 
                      variant="secondary"
                      onClick={() => {
                        const firstFavorite = moviesContext.favorites[0];
                        if (firstFavorite) {
                          favorites.removeFavorite(firstFavorite.id);
                          notifications.showInfo(`Removed "${firstFavorite.title}" from favorites`);
                        }
                      }}
                    >
                      💔 Remove One
                    </Button>
                  )}
                </div>
                
                {/* Favorites List */}
                {favorites.favoritesCount > 0 && (
                  <div className="mt-3 space-y-1">
                    <h5 className="text-sm font-medium text-red-900">Your Favorites:</h5>
                    {moviesContext.favorites.slice(0, 3).map(movie => (
                      <div 
                        key={movie.id}
                        className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                      >
                        <span className="text-gray-900">{movie.title}</span>
                        <Button 
                          size="small" 
                          variant="ghost"
                          onClick={() => {
                            favorites.removeFavorite(movie.id);
                            notifications.showInfo(`Removed "${movie.title}"`);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    {moviesContext.favorites.length > 3 && (
                      <p className="text-xs text-red-600">
                        +{moviesContext.favorites.length - 3} more favorites
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Rating Demo */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Rating System</h4>
                <p className="text-yellow-800 text-sm mb-3">
                  Ratings: {moviesContext.ratingsCount} • Average: {moviesContext.averageRating.toFixed(1)}/5
                </p>
                
                <Button 
                  size="small" 
                  variant="primary"
                  onClick={() => {
                    const demoMovieId = Date.now();
                    const randomRating = Math.floor(Math.random() * 5) + 1;
                    moviesContext.actions.setRating(demoMovieId, randomRating);
                    notifications.showSuccess(`Rated demo movie: ${randomRating}/5 stars`);
                  }}
                >
                  ⭐ Add Demo Rating
                </Button>
              </div>
            </div>
          </div>
          
          {/* Movies State Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Movies Context State</h3>
            
            {renderContextState('Movies Context Overview', {
              favoritesCount: favorites.favoritesCount,
              ratingsCount: moviesContext.ratingsCount,
              averageRating: moviesContext.averageRating.toFixed(1),
              watchlistCount: moviesContext.watchlistCount,
              recentlyViewedCount: moviesContext.recentlyViewed.length,
            })}
            
            {/* Detailed Statistics */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {favorites.favoritesCount}
                </div>
                <div className="text-xs text-blue-800">Favorites</div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded border text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {moviesContext.ratingsCount}
                </div>
                <div className="text-xs text-yellow-800">Ratings</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {moviesContext.averageRating.toFixed(1)}
                </div>
                <div className="text-xs text-green-800">Avg Rating</div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {moviesContext.recentlyViewed.length}
                </div>
                <div className="text-xs text-purple-800">Recent</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Notifications Context Demo */}
      <section className="card">
        <h2 className="text-2xl font-semibold mb-4">4. Notifications Context Demo</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates a global notification system built with Context API.
          Notifications can be triggered from anywhere in the app and will appear
          consistently across all components.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Notification Controls */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Notification Controls</h3>
            
            <div className="space-y-4">
              {/* Custom Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message
                </label>
                <input
                  type="text"
                  value={demoNotificationText}
                  onChange={(e) => setDemoNotificationText(e.target.value)}
                  className="form-input mb-2"
                  placeholder="Enter your notification message..."
                />
              </div>
              
              {/* Notification Type Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={() => handleShowNotification('info')}
                  >
                    ℹ️ Info
                  </Button>
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={() => handleShowNotification('success')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✅ Success
                  </Button>
                  <Button 
                    size="small" 
                    variant="primary"
                    onClick={() => handleShowNotification('warning')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    ⚠️ Warning
                  </Button>
                  <Button 
                    size="small" 
                    variant="danger"
                    onClick={() => handleShowNotification('error')}
                  >
                    ❌ Error
                  </Button>
                </div>
              </div>
              
              {/* Notification Statistics */}
              <div className="p-3 bg-gray-50 rounded border">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Stats</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total notifications:</span>
                    <span className="font-medium">{appContext.notificationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active notifications:</span>
                    <span className="font-medium">{notifications.activeNotifications.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Notifications Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Notifications</h3>
            
            {notifications.activeNotifications.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-gray-400 text-3xl mb-2">📭</div>
                <p className="text-gray-600">No active notifications</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click the buttons on the left to see notifications appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.activeNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={clsx(
                      'p-3 rounded-lg border animate-fade-in',
                      notification.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800',
                      notification.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
                      notification.type === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
                      notification.type === 'error' && 'bg-red-50 border-red-200 text-red-800'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => notifications.dismissNotification(notification.id)}
                        className="ml-2"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Cross-Context Communication Demo */}
      <section className="card">
        <h2 className="text-2xl font-semibold mb-4">5. Cross-Context Communication</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates how different contexts can work together to create
          complex application behaviors. Watch how actions in one context
          can trigger updates in other contexts.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* App Context Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">App Context</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Theme:</span>
                <span className="font-medium">{theme.isDarkMode ? 'Dark' : 'Light'}</span>
              </div>
              <div className="flex justify-between">
                <span>Online:</span>
                <span className="font-medium">{appContext.isOnline ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Animations:</span>
                <span className="font-medium">{appContext.theme.animations ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span>Debug Mode:</span>
                <span className="font-medium">{appContext.isDebugMode ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
          
          {/* User Context Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-3">User Context</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium">
                  {userContext.isLoggedIn ? 'Logged In' : 'Guest'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">{userContext.userDisplayName}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium">{userContext.preferences.language}</span>
              </div>
              <div className="flex justify-between">
                <span>Sessions:</span>
                <span className="font-medium">{userContext.activity.totalSessions}</span>
              </div>
            </div>
          </div>
          
          {/* Movies Context Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-3">Movies Context</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Favorites:</span>
                <span className="font-medium">{favorites.favoritesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Ratings:</span>
                <span className="font-medium">{moviesContext.ratingsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Rating:</span>
                <span className="font-medium">{moviesContext.averageRating.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Watchlist:</span>
                <span className="font-medium">{moviesContext.watchlistCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Combined Actions Demo */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
          <h3 className="font-medium text-indigo-900 mb-3">Complex Context Interactions</h3>
          <p className="text-indigo-800 text-sm mb-4">
            These actions demonstrate how changes in one context can trigger
            updates across multiple contexts, creating coordinated application behavior.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              onClick={() => {
                // Multi-context action: login user, add favorite, show notification
                if (!userContext.isLoggedIn) {
                  userContext.actions.login({
                    name: 'Context Demo User',
                    email: 'context@example.com',
                    avatar: '🎭',
                  });
                }
                
                handleAddSampleFavorite();
                
                theme.setTheme({ primaryColor: 'purple' });
                
                notifications.showSuccess('Multi-context action completed! Check theme, user status, and favorites.');
              }}
            >
              🎭 Multi-Context Demo
            </Button>
            
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                // Reset everything
                userContext.actions.logout();
                moviesContext.favorites.forEach(fav => favorites.removeFavorite(fav.id));
                theme.setTheme({ mode: 'light', primaryColor: 'blue' });
                notifications.showInfo('All contexts reset to initial state');
              }}
            >
              🔄 Reset All Contexts
            </Button>
            
            <Button
              size="small"
              variant="ghost"
              onClick={() => {
                appContext.actions.toggleDeveloperMode();
                notifications.showInfo(`Developer mode ${appContext.isDebugMode ? 'disabled' : 'enabled'}`);
              }}
            >
              🔧 Toggle Debug Mode
            </Button>
          </div>
        </div>
      </section>
      
      {/* Performance and Re-render Analysis */}
      <section className="card bg-gradient-to-r from-yellow-50 to-orange-50">
        <h2 className="text-2xl font-semibold mb-4">6. Context Performance Analysis</h2>
        <p className="text-gray-600 mb-6">
          Monitor how Context API affects component re-renders and learn
          optimization techniques for large-scale applications.
        </p>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-xl font-bold text-orange-600">{contextMetrics.renderCount}</div>
            <div className="text-xs text-gray-600">Component Renders</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-xl font-bold text-orange-600">
              {appContext.performance.navigationCount}
            </div>
            <div className="text-xs text-gray-600">Navigation Events</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-xl font-bold text-orange-600">
              {appContext.performance.apiCallCount}
            </div>
            <div className="text-xs text-gray-600">API Calls</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-xl font-bold text-orange-600">
              {notifications.activeNotifications.length}
            </div>
            <div className="text-xs text-gray-600">Active Notifications</div>
          </div>
        </div>
        
        {/* Performance Tips */}
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Context Performance Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Split contexts by concern to minimize re-renders</li>
            <li>• Use useMemo for context values to prevent object recreation</li>
            <li>• Separate state and actions contexts for better performance</li>
            <li>• Consider context selectors for large state objects</li>
            <li>• Monitor render counts to identify optimization opportunities</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default ContextShowcase;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. CONTEXT CONSUMPTION PATTERNS:
 *    - Custom hooks for clean context APIs
 *    - Multiple context usage in single components
 *    - Conditional context consumption based on authentication
 * 
 * 2. GLOBAL STATE MANAGEMENT:
 *    - Theme management affecting entire app
 *    - User authentication state sharing
 *    - Cross-component data synchronization
 * 
 * 3. PERFORMANCE CONSIDERATIONS:
 *    - Context value memoization
 *    - Render optimization strategies
 *    - Context splitting for efficiency
 * 
 * 4. REAL-WORLD PATTERNS:
 *    - Notification systems
 *    - User preference management
 *    - Authentication state handling
 *    - Theme and appearance control
 * 
 * 5. ERROR HANDLING:
 *    - Context validation and error boundaries
 *    - Graceful degradation patterns
 *    - Development vs production behavior
 * 
 * This component serves as a comprehensive guide to using Context API
 * effectively in production React applications.
 */
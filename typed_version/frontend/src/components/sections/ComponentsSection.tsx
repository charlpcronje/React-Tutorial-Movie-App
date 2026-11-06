/**
 * ComponentsSection - TypeScript Component Showcase
 * 
 * TypeScript port of the JavaScript ComponentsSection with:
 * - Comprehensive TypeScript typing
 * - All original functionality preserved
 * - Enhanced type safety and IntelliSense
 * - Production-ready patterns
 */

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import type { Movie } from '../../types';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface ComponentsSectionProps {
  readonly movies?: readonly Movie[];
}

interface ButtonExample {
  readonly variant: 'primary' | 'secondary' | 'ghost' | 'outline';
  readonly size: 'small' | 'medium' | 'large';
  readonly label: string;
  readonly description: string;
}

// ============================================================================
// SAMPLE DATA WITH TYPESCRIPT
// ============================================================================

const BUTTON_EXAMPLES: readonly ButtonExample[] = [
  { variant: 'primary', size: 'large', label: 'Primary Large', description: 'Main call-to-action button' },
  { variant: 'secondary', size: 'medium', label: 'Secondary Medium', description: 'Secondary actions' },
  { variant: 'ghost', size: 'small', label: 'Ghost Small', description: 'Subtle actions' },
  { variant: 'outline', size: 'medium', label: 'Outline Medium', description: 'Outlined style' },
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ComponentsSection: React.FC<ComponentsSectionProps> = ({ movies = [] }) => {
  // ============================================================================
  // TYPED STATE MANAGEMENT
  // ============================================================================
  
  const [selectedButton, setSelectedButton] = useState<ButtonExample | null>(null);
  const [componentDemo, setComponentDemo] = useState<'buttons' | 'cards' | 'forms'>('buttons');
  const [interactionCount, setInteractionCount] = useState<number>(0);

  // ============================================================================
  // TYPED EVENT HANDLERS
  // ============================================================================
  
  const handleButtonClick = useCallback((example: ButtonExample): void => {
    setSelectedButton(example);
    setInteractionCount(prev => prev + 1);
    console.log(`🔘 Button clicked: ${example.label}`);
  }, []);

  const handleDemoChange = useCallback((demo: 'buttons' | 'cards' | 'forms'): void => {
    setComponentDemo(demo);
  }, []);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  
  const demoStats = useMemo(() => ({
    totalButtons: BUTTON_EXAMPLES.length,
    totalMovies: movies.length,
    interactions: interactionCount
  }), [movies.length, interactionCount]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript Components Showcase
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Explore type-safe React components with comprehensive TypeScript integration.
          Every component demonstrates production-ready typing patterns.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
          <span>📊 Components: {demoStats.totalButtons}</span>
          <span>🎬 Movies: {demoStats.totalMovies}</span>
          <span>🔄 Interactions: {demoStats.interactions}</span>
        </div>
      </section>

      {/* Demo Navigation */}
      <section className="mb-12">
        <div className="flex justify-center space-x-4">
          {(['buttons', 'cards', 'forms'] as const).map((demo) => (
            <Button
              key={demo}
              variant={componentDemo === demo ? 'primary' : 'ghost'}
              onClick={() => handleDemoChange(demo)}
            >
              {demo.charAt(0).toUpperCase() + demo.slice(1)} Demo
            </Button>
          ))}
        </div>
      </section>

      {/* Button Demo */}
      {componentDemo === 'buttons' && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Button Component Variants
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {BUTTON_EXAMPLES.map((example, index) => (
              <div
                key={index}
                className={clsx(
                  'p-6 rounded-lg border-2 transition-all cursor-pointer',
                  selectedButton === example 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                )}
                onClick={() => handleButtonClick(example)}
              >
                <div className="text-center mb-4">
                  <Button
                    variant={example.variant}
                    size={example.size}
                  >
                    {example.label}
                  </Button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  {example.description}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {example.variant} • {example.size}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Button Info */}
          {selectedButton && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Selected: {selectedButton.label}
              </h3>
              <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
                {selectedButton.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900 dark:text-blue-200">Variant:</span>
                  <span className="ml-2 text-blue-800 dark:text-blue-300">{selectedButton.variant}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-900 dark:text-blue-200">Size:</span>
                  <span className="ml-2 text-blue-800 dark:text-blue-300">{selectedButton.size}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Movie Cards Demo */}
      {componentDemo === 'cards' && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Type-Safe Movie Cards
          </h2>
          
          {movies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.slice(0, 6).map((movie) => (
                <div
                  key={movie.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {movie.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {movie.overview}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500">
                      {'★'.repeat(movie.ratingStars)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {movie.releaseYear}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Button size="small" fullWidth>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No movies available for demo</p>
            </div>
          )}
        </section>
      )}

      {/* Forms Demo */}
      {componentDemo === 'forms' && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            TypeScript Form Components
          </h2>
          
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Movie Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter movie title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select rating...</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="primary" type="submit" fullWidth>
                  Submit
                </Button>
                <Button variant="secondary" type="button" fullWidth>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* TypeScript Features Showcase */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            TypeScript Component Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">Type Safety</h3>
              <p className="text-blue-100">Compile-time error checking prevents runtime issues</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-semibold mb-2">IntelliSense</h3>
              <p className="text-blue-100">Enhanced IDE support with auto-completion</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold mb-2">Refactoring</h3>
              <p className="text-blue-100">Safe refactoring across the entire codebase</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentsSection;
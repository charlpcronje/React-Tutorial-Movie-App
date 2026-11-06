/**
 * InteractiveExamples - TypeScript Interactive Components
 * 
 * Demonstrates interactive patterns with TypeScript event handling
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface InteractiveDemo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'forms' | 'animations' | 'gestures' | 'keyboard';
}

interface FormData {
  readonly name: string;
  readonly email: string;
  readonly rating: number;
  readonly comments: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

const INTERACTIVE_DEMOS: readonly InteractiveDemo[] = [
  {
    id: 'form-handling',
    title: 'Type-Safe Forms',
    description: 'Form handling with TypeScript validation',
    category: 'forms'
  },
  {
    id: 'animations',
    title: 'CSS Animations',
    description: 'Smooth animations with Tailwind CSS',
    category: 'animations'
  },
  {
    id: 'mouse-gestures',
    title: 'Mouse Interactions',
    description: 'Mouse events with proper TypeScript typing',
    category: 'gestures'
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Keyboard event handling with TypeScript',
    category: 'keyboard'
  }
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InteractiveExamples: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [selectedDemo, setSelectedDemo] = useState<InteractiveDemo>(INTERACTIVE_DEMOS[0]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    rating: 5,
    comments: ''
  });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [keyPresses, setKeyPresses] = useState<string[]>([]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleDemoSelect = useCallback((demo: InteractiveDemo): void => {
    setSelectedDemo(demo);
  }, []);

  const handleFormChange = useCallback(<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  }, []);

  const triggerAnimation = useCallback((): void => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent): void => {
    setKeyPresses(prev => [...prev.slice(-4), event.key]);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript Interactive Examples
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience interactive React patterns with comprehensive TypeScript typing.
          Every interaction is type-safe and fully validated.
        </p>
      </section>

      {/* Demo Selection */}
      <section className="mb-12">
        <div className="grid md:grid-cols-4 gap-4">
          {INTERACTIVE_DEMOS.map((demo) => (
            <Button
              key={demo.id}
              variant={selectedDemo.id === demo.id ? 'primary' : 'ghost'}
              onClick={() => handleDemoSelect(demo)}
              fullWidth
            >
              {demo.title}
            </Button>
          ))}
        </div>
      </section>

      {/* Demo Content */}
      <section className="mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {selectedDemo.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {selectedDemo.description}
          </p>

          {/* Form Demo */}
          {selectedDemo.id === 'form-handling' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating: {formData.rating}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleFormChange('rating', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Form State (Type-Safe):</h4>
                <pre className="text-xs text-gray-600 dark:text-gray-300">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Animation Demo */}
          {selectedDemo.id === 'animations' && (
            <div className="text-center">
              <div className={clsx(
                'w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-2000',
                isAnimating && 'scale-150 rotate-180'
              )}>
                🎬
              </div>
              <Button onClick={triggerAnimation}>
                Trigger Animation
              </Button>
            </div>
          )}

          {/* Mouse Gestures Demo */}
          {selectedDemo.id === 'mouse-gestures' && (
            <div
              className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg relative overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
            >
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-2 -translate-y-2 transition-all duration-100"
                style={{
                  left: mousePosition.x,
                  top: mousePosition.y
                }}
              />
              <div className="absolute bottom-4 left-4 text-sm text-gray-600 dark:text-gray-300">
                Mouse: ({mousePosition.x}, {mousePosition.y})
              </div>
            </div>
          )}

          {/* Keyboard Demo */}
          {selectedDemo.id === 'keyboard-shortcuts' && (
            <div className="text-center">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Type here to see key presses..."
                  onKeyDown={handleKeyPress}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-center space-x-2">
                {keyPresses.map((key, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded"
                  >
                    {key}
                  </span>
                ))}
              </div>
              {keyPresses.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Last 5 key presses will appear here...
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InteractiveExamples;
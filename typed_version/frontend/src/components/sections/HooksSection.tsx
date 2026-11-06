/**
 * HooksSection - TypeScript Hooks Showcase
 * 
 * TypeScript port demonstrating custom hooks with comprehensive typing
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useToggle } from '../../hooks/useToggle';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface HookExample {
  readonly name: string;
  readonly description: string;
  readonly code: string;
  readonly category: 'state' | 'effect' | 'performance' | 'custom';
}

// ============================================================================
// HOOKS EXAMPLES DATA
// ============================================================================

const HOOKS_EXAMPLES: readonly HookExample[] = [
  {
    name: 'useState',
    description: 'Manage component state with type safety',
    category: 'state',
    code: `const [count, setCount] = useState<number>(0);`
  },
  {
    name: 'useEffect', 
    description: 'Handle side effects with proper typing',
    category: 'effect',
    code: `useEffect((): void => {
  // Effect logic
}, [dependencies]);`
  },
  {
    name: 'useCallback',
    description: 'Memoize functions to prevent unnecessary re-renders',
    category: 'performance',
    code: `const handleClick = useCallback((id: string): void => {
  // Handler logic
}, [dependency]);`
  },
  {
    name: 'useLocalStorage',
    description: 'Persist state in localStorage with type safety',
    category: 'custom',
    code: `const [value, setValue] = useLocalStorage<string>('key', 'default');`
  }
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HooksSection: React.FC = () => {
  // ============================================================================
  // HOOK DEMONSTRATIONS
  // ============================================================================
  
  // useState with TypeScript
  const [counter, setCounter] = useState<number>(0);
  const [selectedHook, setSelectedHook] = useState<HookExample | null>(null);
  
  // useLocalStorage with TypeScript
  const [persistentValue, setPersistentValue] = useLocalStorage<string>('hooks-demo', 'Type-safe localStorage!');
  
  // useToggle with TypeScript
  const [isToggled, toggle] = useToggle(false);
  
  // useCallback with TypeScript
  const incrementCounter = useCallback((): void => {
    setCounter(prev => prev + 1);
  }, []);
  
  const resetCounter = useCallback((): void => {
    setCounter(0);
  }, []);
  
  // useMemo with TypeScript
  const counterStats = useMemo(() => ({
    isEven: counter % 2 === 0,
    isPrime: isPrime(counter),
    squared: counter * counter
  }), [counter]);
  
  // useEffect with TypeScript
  useEffect((): void => {
    console.log(`📊 Counter changed to: ${counter}`);
  }, [counter]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleHookSelect = useCallback((hook: HookExample): void => {
    setSelectedHook(hook);
  }, []);

  const handlePersistentValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setPersistentValue(event.target.value);
  }, [setPersistentValue]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript Hooks Mastery
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Master React hooks with comprehensive TypeScript typing. See how type safety
          enhances hook development and prevents common errors.
        </p>
      </section>

      {/* Interactive Hooks Demo */}
      <section className="grid lg:grid-cols-2 gap-12 mb-16">
        
        {/* Live Demo Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Live Hook Examples
          </h2>
          
          {/* Counter Demo */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              useState Counter Demo
            </h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {counter}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-x-4">
                <span>Even: {counterStats.isEven ? '✅' : '❌'}</span>
                <span>Prime: {counterStats.isPrime ? '✅' : '❌'}</span>
                <span>Squared: {counterStats.squared}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={incrementCounter} fullWidth>
                Increment
              </Button>
              <Button variant="secondary" onClick={resetCounter} fullWidth>
                Reset
              </Button>
            </div>
          </div>

          {/* Toggle Demo */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              useToggle Demo
            </h3>
            <div className="text-center mb-4">
              <div className={clsx(
                'w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl transition-all duration-300',
                isToggled ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              )}>
                {isToggled ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Toggle state: {isToggled.toString()}
              </p>
            </div>
            <Button onClick={toggle} fullWidth>
              Toggle State
            </Button>
          </div>

          {/* localStorage Demo */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              useLocalStorage Demo
            </h3>
            <input
              type="text"
              value={persistentValue}
              onChange={handlePersistentValueChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              placeholder="This value persists in localStorage..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This value is automatically saved to localStorage with full TypeScript typing!
            </p>
          </div>
        </div>

        {/* Hook Examples List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            TypeScript Hook Patterns
          </h2>
          
          {HOOKS_EXAMPLES.map((hook, index) => (
            <div
              key={index}
              className={clsx(
                'p-4 rounded-lg border-2 cursor-pointer transition-all',
                selectedHook === hook
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => handleHookSelect(hook)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {hook.name}
                </h3>
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full',
                  {
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': hook.category === 'state',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': hook.category === 'effect',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': hook.category === 'performance',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': hook.category === 'custom'
                  }
                )}>
                  {hook.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {hook.description}
              </p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{hook.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Helper function for prime number checking
function isPrime(num: number): boolean {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

export default HooksSection;
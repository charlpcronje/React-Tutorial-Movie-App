/**
 * ReactivityShowcase - TypeScript Reactivity Patterns
 * 
 * Demonstrates reactive programming patterns with TypeScript
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface ReactiveState {
  readonly value: number;
  readonly timestamp: Date;
  readonly isActive: boolean;
}

interface ReactivityExample {
  readonly name: string;
  readonly description: string;
  readonly pattern: 'state' | 'effect' | 'memo' | 'callback';
}

// ============================================================================
// REACTIVITY EXAMPLES
// ============================================================================

const REACTIVITY_EXAMPLES: readonly ReactivityExample[] = [
  {
    name: 'State Reactivity',
    description: 'How state changes trigger re-renders',
    pattern: 'state'
  },
  {
    name: 'Effect Reactivity',
    description: 'Side effects responding to dependency changes',
    pattern: 'effect'
  },
  {
    name: 'Memoized Values',
    description: 'Computed values that only update when needed',
    pattern: 'memo'
  },
  {
    name: 'Callback Memoization',
    description: 'Functions that maintain referential equality',
    pattern: 'callback'
  }
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ReactivityShowcase: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [reactiveState, setReactiveState] = useState<ReactiveState>({
    value: 0,
    timestamp: new Date(),
    isActive: false
  });
  
  const [selectedExample, setSelectedExample] = useState<ReactivityExample>(REACTIVITY_EXAMPLES[0]);
  const [renderCount, setRenderCount] = useState<number>(0);

  // ============================================================================
  // REACTIVE PATTERNS DEMONSTRATION
  // ============================================================================
  
  // Memoized computation (only recalculates when value changes)
  const computedValue = useMemo((): number => {
    console.log('🔄 Computing expensive calculation...');
    return reactiveState.value * reactiveState.value + Math.floor(reactiveState.value / 2);
  }, [reactiveState.value]);
  
  // Memoized callback (maintains referential equality)
  const handleStateUpdate = useCallback((): void => {
    setReactiveState(prev => ({
      value: prev.value + 1,
      timestamp: new Date(),
      isActive: !prev.isActive
    }));
  }, []);
  
  // Effect that responds to state changes
  useEffect((): void => {
    console.log('📊 Reactive state changed:', reactiveState);
  }, [reactiveState]);
  
  // Render count tracking
  useEffect((): void => {
    setRenderCount(prev => prev + 1);
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleExampleSelect = useCallback((example: ReactivityExample): void => {
    setSelectedExample(example);
  }, []);

  const resetState = useCallback((): void => {
    setReactiveState({
      value: 0,
      timestamp: new Date(),
      isActive: false
    });
    setRenderCount(0);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript Reactivity Showcase
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Explore reactive programming patterns with TypeScript. See how state changes
          propagate through the component tree with full type safety.
        </p>
      </section>

      {/* Reactivity Stats */}
      <section className="mb-12">
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reactiveState.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Current Value</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {computedValue}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Computed Value</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {renderCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Render Count</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className={clsx(
              'text-2xl font-bold',
              reactiveState.isActive ? 'text-green-500' : 'text-gray-400'
            )}>
              {reactiveState.isActive ? '✅' : '❌'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active State</div>
          </div>
        </div>
      </section>

      {/* Interactive Controls */}
      <section className="mb-16">
        <div className="text-center">
          <div className="space-x-4 mb-8">
            <Button onClick={handleStateUpdate}>
              Update State
            </Button>
            <Button variant="secondary" onClick={resetState}>
              Reset
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Last updated: {reactiveState.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </section>

      {/* Reactivity Patterns */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Reactivity Patterns
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {REACTIVITY_EXAMPLES.map((example, index) => (
            <div
              key={index}
              className={clsx(
                'p-4 rounded-lg border-2 cursor-pointer transition-all text-center',
                selectedExample === example
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => handleExampleSelect(example)}
            >
              <div className="text-2xl mb-2">
                {example.pattern === 'state' && '🔄'}
                {example.pattern === 'effect' && '⚡'}
                {example.pattern === 'memo' && '🧠'}
                {example.pattern === 'callback' && '📞'}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                {example.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {example.description}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Pattern Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {selectedExample.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {selectedExample.description}
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm">
            <code>
              {selectedExample.pattern === 'state' && `const [state, setState] = useState<ReactiveState>(initialValue);`}
              {selectedExample.pattern === 'effect' && `useEffect((): void => {
  // Effect runs when dependencies change
}, [reactiveState]);`}
              {selectedExample.pattern === 'memo' && `const computedValue = useMemo((): number => {
  return expensiveCalculation(state.value);
}, [state.value]);`}
              {selectedExample.pattern === 'callback' && `const memoizedCallback = useCallback((): void => {
  // Function maintains referential equality
}, [dependencies]);`}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReactivityShowcase;
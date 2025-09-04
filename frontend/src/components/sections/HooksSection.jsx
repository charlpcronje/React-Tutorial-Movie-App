/**
 * HooksSection Component - Custom Hooks Educational Showcase
 * 
 * This section demonstrates our custom hooks in action and explains
 * how to build and use custom hooks effectively in React applications.
 */

import React from 'react';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import useToggle from '../../hooks/useToggle.js';
import Button from '../ui/Button.jsx';

function HooksSection() {
  // Demonstrate our custom hooks
  const [persistentValue, setPersistentValue] = useLocalStorage('hooks_demo', 'Try changing this text!');
  const [showAdvanced, { toggle, setTrue, setFalse, reset }] = useToggle(false);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Custom Hooks Deep Dive
        </h1>
        <p className="text-xl text-gray-600">
          Learn to create reusable logic with custom React hooks
        </p>
      </header>
      
      {/* useLocalStorage Demo */}
      <section className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">useLocalStorage Hook Demo</h2>
        <p className="text-gray-600 mb-4">
          This hook persists state to localStorage automatically. 
          Try changing the text below and refreshing the page!
        </p>
        
        <input
          type="text"
          value={persistentValue}
          onChange={(e) => setPersistentValue(e.target.value)}
          className="form-input mb-4"
          placeholder="This value persists!"
        />
        
        <div className="bg-green-50 p-3 rounded border">
          <p className="text-sm text-green-800">
            <strong>Stored value:</strong> "{persistentValue}"
          </p>
          <p className="text-xs text-green-600 mt-1">
            This value is automatically saved to localStorage and will persist between sessions.
          </p>
        </div>
      </section>
      
      {/* useToggle Demo */}
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">useToggle Hook Demo</h2>
        <p className="text-gray-600 mb-4">
          This hook provides convenient boolean state management with helper functions.
        </p>
        
        <div className="flex space-x-2 mb-4">
          <Button onClick={toggle}>Toggle: {showAdvanced ? 'ON' : 'OFF'}</Button>
          <Button variant="secondary" onClick={setTrue}>Set True</Button>
          <Button variant="secondary" onClick={setFalse}>Set False</Button>
          <Button variant="ghost" onClick={reset}>Reset</Button>
        </div>
        
        {showAdvanced && (
          <div className="bg-blue-50 p-4 rounded border animate-fade-in">
            <h3 className="font-medium text-blue-900 mb-2">Advanced Options</h3>
            <p className="text-blue-800 text-sm">
              This content is conditionally rendered based on the toggle state!
              This pattern is perfect for modals, dropdowns, and progressive disclosure.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default HooksSection;
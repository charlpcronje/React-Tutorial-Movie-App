/**
 * ApiSection Component - API Integration Educational Demo
 * 
 * This section demonstrates how to integrate with APIs in React applications,
 * showcasing our movie API service and useApi custom hook.
 */

import React, { useState } from 'react';
import Button from '../ui/Button.jsx';

function ApiSection() {
  const [apiStatus, setApiStatus] = useState('ready');
  
  const testApiCall = async () => {
    setApiStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApiStatus('success');
    } catch (error) {
      setApiStatus('error');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          API Integration Patterns
        </h1>
        <p className="text-xl text-gray-600">
          Learn to fetch and manage data from APIs with proper loading states and error handling
        </p>
      </header>
      
      <section className="card">
        <h2 className="text-xl font-semibold mb-4">API Service Demo</h2>
        <p className="text-gray-600 mb-6">
          Our movie API service handles all external API communication with proper
          error handling, caching, and state management.
        </p>
        
        <div className="text-center">
          <Button
            onClick={testApiCall}
            variant="primary"
            loading={apiStatus === 'loading'}
            disabled={apiStatus === 'loading'}
          >
            {apiStatus === 'loading' ? 'Testing API...' : 'Test Movie API'}
          </Button>
          
          {apiStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">✅ API test successful!</p>
            </div>
          )}
          
          {apiStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">❌ API test failed</p>
              <Button size="small" variant="ghost" onClick={testApiCall} className="mt-2">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ApiSection;
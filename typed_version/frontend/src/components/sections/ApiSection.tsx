/**
 * ApiSection - TypeScript API Integration Showcase
 * 
 * Demonstrates tRPC integration and type-safe API communication
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import type { Movie } from '../../types';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface ApiExample {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly endpoint: string;
  readonly description: string;
  readonly example: string;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: string;
}

// ============================================================================
// API EXAMPLES DATA
// ============================================================================

const API_EXAMPLES: readonly ApiExample[] = [
  {
    method: 'GET',
    endpoint: '/api/movies',
    description: 'Fetch all movies with type safety',
    example: `const { data: movies } = trpc.movie.getAll.useQuery();`
  },
  {
    method: 'POST',
    endpoint: '/api/movies',
    description: 'Create a new movie with validation',
    example: `const createMutation = trpc.movie.create.useMutation();`
  },
  {
    method: 'PUT',
    endpoint: '/api/movies/:id',
    description: 'Update movie with partial data',
    example: `const updateMutation = trpc.movie.update.useMutation();`
  },
  {
    method: 'DELETE',
    endpoint: '/api/movies/:id',
    description: 'Delete movie with confirmation',
    example: `const deleteMutation = trpc.movie.delete.useMutation();`
  }
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ApiSection: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [selectedApi, setSelectedApi] = useState<ApiExample | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse<Movie[]> | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleApiSelect = useCallback((api: ApiExample): void => {
    setSelectedApi(api);
  }, []);

  const simulateApiCall = useCallback(async (): Promise<void> => {
    if (!selectedApi) return;
    
    setIsLoading(true);
    setRequestCount(prev => prev + 1);
    
    // Simulate API delay
    setTimeout(() => {
      const mockResponse: ApiResponse<Movie[]> = {
        success: true,
        data: [
          {
            id: Date.now(),
            title: "TypeScript Movie",
            overview: "A movie created with type safety!",
            releaseYear: 2024,
            voteAverage: 9.5,
            voteCount: 1000,
            ratingStars: 5,
            genres: [{ id: 1, name: "Education" }],
            isPopular: true,
            isHighRated: true,
            hasImage: false
          }
        ],
        timestamp: new Date().toISOString()
      };
      
      setApiResponse(mockResponse);
      setIsLoading(false);
    }, 1500);
  }, [selectedApi]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          TypeScript API Integration
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Experience end-to-end type safety with tRPC. See how TypeScript eliminates
          API integration errors and enhances developer experience.
        </p>
        
        <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
          <span className="text-sm font-medium">🔒 End-to-End Type Safety</span>
        </div>
      </section>

      {/* API Methods Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          tRPC API Methods
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {API_EXAMPLES.map((api, index) => (
            <div
              key={index}
              className={clsx(
                'p-6 rounded-lg border-2 cursor-pointer transition-all',
                selectedApi === api
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => handleApiSelect(api)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className={clsx(
                  'px-2 py-1 text-xs font-bold rounded',
                  {
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': api.method === 'GET',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': api.method === 'POST',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': api.method === 'PUT',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': api.method === 'DELETE'
                  }
                )}>
                  {api.method}
                </span>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                  {api.endpoint}
                </span>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                {api.description}
              </p>
              
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{api.example}</code>
              </pre>
            </div>
          ))}
        </div>

        {/* API Test Panel */}
        {selectedApi && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test API: {selectedApi.method} {selectedApi.endpoint}
            </h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <Button 
                onClick={simulateApiCall}
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Calling API...' : 'Test API Call'}
              </Button>
              
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Requests made: {requestCount}
              </span>
            </div>

            {/* API Response */}
            {apiResponse && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Type-Safe Response:
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto">
                  <code>{JSON.stringify(apiResponse, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* tRPC Benefits */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">
            Why tRPC + TypeScript?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">Type Safety</h3>
              <p className="text-purple-100">Compile-time API validation and error checking</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Developer Experience</h3>
              <p className="text-purple-100">Auto-completion for all API calls</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold mb-2">Real-time Sync</h3>
              <p className="text-purple-100">Types automatically sync between client and server</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiSection;
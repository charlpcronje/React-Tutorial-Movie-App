/**
 * WelcomeSection Component - TypeScript Educational Implementation
 * 
 * This is a 1:1 TypeScript port of the JavaScript WelcomeSection with:
 * - Identical visual design and functionality
 * - Advanced TypeScript typing throughout
 * - All animations and interactive features preserved
 * - Enhanced with TypeScript-specific educational content
 */

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useDisclosure } from '../../hooks/useToggle';

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

interface LearningObjective {
  readonly id: string;
  readonly title: string;
  readonly emoji: string;
  readonly description: string;
  readonly skills: readonly string[];
  readonly estimatedTime: string;
}

interface FeatureHighlight {
  readonly title: string;
  readonly emoji: string;
  readonly description: string;
}

interface WelcomeSectionProps {
  readonly onNavigate?: (section: string) => void;
}

// ============================================================================
// TYPESCRIPT DATA WITH STRONG TYPING
// ============================================================================

const LEARNING_OBJECTIVES: readonly LearningObjective[] = [
  {
    id: 'typescript-basics',
    title: 'TypeScript Fundamentals', 
    emoji: '📘',
    description: 'Master TypeScript syntax, types, and integration with React',
    skills: ['Type annotations', 'Interfaces', 'Union types', 'Generics'],
    estimatedTime: '45 minutes'
  },
  {
    id: 'type-safety',
    title: 'Type Safety',
    emoji: '🛡️',
    description: 'Eliminate runtime errors with compile-time type checking',
    skills: ['Error prevention', 'IDE support', 'Refactoring safety', 'IntelliSense'],
    estimatedTime: '30 minutes'
  },
  {
    id: 'react-types',
    title: 'React + TypeScript',
    emoji: '⚛️',
    description: 'Type-safe React components, hooks, and event handling',
    skills: ['Component props', 'State typing', 'Event handlers', 'Custom hooks'],
    estimatedTime: '60 minutes'
  },
  {
    id: 'advanced-patterns',
    title: 'Advanced Patterns',
    emoji: '🧠',
    description: 'Master complex TypeScript patterns for production apps',
    skills: ['Utility types', 'Conditional types', 'Mapped types', 'Template literals'],
    estimatedTime: '75 minutes'
  },
  {
    id: 'api-integration',
    title: 'Type-Safe APIs',
    emoji: '🌐',
    description: 'End-to-end type safety with tRPC and Zod validation',
    skills: ['tRPC setup', 'Schema validation', 'Type inference', 'Error handling'],
    estimatedTime: '45 minutes'
  },
  {
    id: 'production-ready',
    title: 'Production Patterns',
    emoji: '🚀',
    description: 'Enterprise-level TypeScript patterns and best practices',
    skills: ['Performance', 'Testing', 'Deployment', 'Team collaboration'],
    estimatedTime: '90 minutes'
  }
] as const;

const FEATURE_HIGHLIGHTS: readonly FeatureHighlight[] = [
  {
    title: 'Type Safety First',
    emoji: '🔒',
    description: 'Catch errors at compile time, not in production',
  },
  {
    title: 'Enhanced IDE Support', 
    emoji: '💡',
    description: 'IntelliSense, auto-completion, and smart refactoring',
  },
  {
    title: 'Production Patterns',
    emoji: '🏭',
    description: 'Enterprise-level patterns used by top companies',
  },
  {
    title: 'Gradual Adoption',
    emoji: '📈',
    description: 'Start with JavaScript, gradually add TypeScript',
  },
  {
    title: 'Team Collaboration',
    emoji: '👥',
    description: 'Self-documenting code reduces onboarding time',
  },
  {
    title: 'Future-Proof',
    emoji: '🔮',
    description: 'Built for scalability and long-term maintenance',
  }
] as const;

// ============================================================================
// MAIN COMPONENT WITH TYPESCRIPT
// ============================================================================

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onNavigate }) => {
  // ============================================================================
  // TYPED STATE MANAGEMENT
  // ============================================================================
  
  const [userName, setUserName] = useLocalStorage<string>('user_name', '');
  const [hasStartedTutorial, setHasStartedTutorial] = useLocalStorage<boolean>('tutorial_started', false);
  const [currentObjective, setCurrentObjective] = useState<number>(0);
  const { isDisclosed: showFullDescription, toggle: toggleDescription } = useDisclosure(false);
  const [animationDemo, setAnimationDemo] = useState<boolean>(false);
  const [welcomeStep, setWelcomeStep] = useState<number>(1);
  const [showGetStarted, setShowGetStarted] = useState<boolean>(false);

  // ============================================================================
  // EFFECTS WITH TYPESCRIPT
  // ============================================================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (welcomeStep < 3) {
        setWelcomeStep(prev => prev + 1);
      } else {
        setShowGetStarted(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [welcomeStep]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentObjective(prev => (prev + 1) % LEARNING_OBJECTIVES.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // TYPED EVENT HANDLERS
  // ============================================================================
  
  const handleStartTutorial = useCallback((): void => {
    console.log('🚀 Starting TypeScript tutorial for user:', userName || 'Anonymous');
    setHasStartedTutorial(true);
    onNavigate?.('components');
  }, [userName, onNavigate]);
  
  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setUserName(event.target.value);
  }, []);
  
  const triggerAnimationDemo = useCallback((): void => {
    setAnimationDemo(true);
    setTimeout(() => setAnimationDemo(false), 1000);
  }, []);

  // ============================================================================
  // RENDER WITH IDENTICAL STYLING
  // ============================================================================
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Section with Animated Introduction */}
      <section className="text-center mb-16">
        <div className={clsx(
          'transition-all duration-1000 ease-out',
          welcomeStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Digital Cabinet
            </span>
            <br />
            Welcome to TypeScript Learning
          </h1>
        </div>
        
        <div className={clsx(
          'transition-all duration-1000 ease-out delay-500',
          welcomeStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            This comprehensive TypeScript movie application teaches you production-grade 
            type safety through practical examples. Every pattern you'll learn here is 
            used in enterprise React applications.
          </p>
        </div>
        
        <div className={clsx(
          'transition-all duration-1000 ease-out delay-1000',
          welcomeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="text-xl">🔒</span>
              <span className="font-medium">Type Safety</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <span className="text-xl">💡</span>
              <span className="font-medium">Enhanced IDE</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-xl">🚀</span>
              <span className="font-medium">Production Ready</span>
            </div>
          </div>
        </div>
        
        {/* Get Started Section */}
        {showGetStarted && (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Ready for TypeScript?
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What should we call you? (Optional)
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={userName}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name..."
                  />
                </div>
                
                {userName && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      👋 Great to meet you, <strong>{userName}</strong>! 
                      Ready to master TypeScript?
                    </p>
                  </div>
                )}
                
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStartTutorial}
                  fullWidth
                >
                  {userName ? `Start TypeScript Journey, ${userName}!` : 'Begin TypeScript Tutorial'}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={toggleDescription}
                    fullWidth
                  >
                    {showFullDescription ? 'Hide' : 'Show'} Details
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="medium"
                    onClick={triggerAnimationDemo}
                    fullWidth
                  >
                    🎬 Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Learning Objectives Overview */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What You'll Master
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our TypeScript curriculum covers everything from basic types to 
            advanced patterns used in production React applications.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {LEARNING_OBJECTIVES.map((objective, index) => (
            <div
              key={objective.id}
              className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 cursor-pointer',
                'hover:shadow-lg hover:border-blue-300 hover:-translate-y-1',
                currentObjective === index && 'ring-2 ring-blue-500 shadow-lg',
                animationDemo && 'animate-pulse'
              )}
              onClick={() => setCurrentObjective(index)}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {objective.emoji}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {objective.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {objective.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {objective.skills.slice(0, 2).map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {objective.skills.length > 2 && (
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        +{objective.skills.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ⏱️ {objective.estimatedTime}
                </div>
              </div>
              
              {currentObjective === index && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Skills covered:</h4>
                  <div className="space-y-1">
                    {objective.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center space-x-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-2">
          {LEARNING_OBJECTIVES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentObjective(index)}
              className={clsx(
                'w-3 h-3 rounded-full transition-all duration-200',
                currentObjective === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              )}
              aria-label={`View objective ${index + 1}`}
            />
          ))}
        </div>
      </section>
      
      {/* Feature Highlights */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Why TypeScript for React?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_HIGHLIGHTS.map((feature, index) => (
            <div
              key={index}
              className={clsx(
                'text-center p-6 rounded-xl transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-2',
                index % 3 === 0 && 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700',
                index % 3 === 1 && 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700', 
                index % 3 === 2 && 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700'
              )}
            >
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Course Information */}
      {showFullDescription && (
        <section className="mb-16 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Complete TypeScript Course Overview
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🗺️ Learning Path
                </h3>
                <div className="space-y-3">
                  {['Basic Types & Interfaces', 'React Component Typing', 'Advanced Type Patterns', 
                    'API Integration with tRPC', 'Performance & Testing', 'Production Deployment'].map((topic, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🛠️ Technologies Used
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'TypeScript 5.0+', description: 'Latest TypeScript with advanced features' },
                    { name: 'React 18', description: 'Modern React with concurrent features' },
                    { name: 'Vite', description: 'Lightning-fast build tool with TS support' },
                    { name: 'tRPC', description: 'End-to-end type safety for APIs' },
                    { name: 'Zod', description: 'Runtime schema validation' }
                  ].map((tech, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{tech.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">📚 Prerequisites</h3>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Basic JavaScript knowledge (ES6+) and React fundamentals. 
                No prior TypeScript experience required - we'll start from the basics!
              </p>
            </div>
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Type-Safe React Apps?
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of developers who have mastered TypeScript through practical learning.
            Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              size="large"
              onClick={handleStartTutorial}
            >
              🚀 Start TypeScript Learning
            </Button>
            
            <Button
              variant="secondary"
              size="large"
              onClick={toggleDescription}
            >
              📖 View Course Details
            </Button>
          </div>
          
          {hasStartedTutorial && (
            <div className="mt-6 p-4 bg-blue-500 rounded-lg">
              <p className="text-blue-100 mb-2">
                👋 Welcome back{userName && `, ${userName}`}!
              </p>
              <p className="text-sm text-blue-200">
                Continue your TypeScript learning journey or explore any section.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Animation Demo Overlay */}
      {animationDemo && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-4xl text-center mb-4">🎉</div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              TypeScript makes React development safer and more delightful!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeSection;
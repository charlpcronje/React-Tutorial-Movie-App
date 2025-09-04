/**
 * WelcomeSection Component - Educational Introduction and Overview
 * 
 * This component serves as the introduction to our educational React journey.
 * It demonstrates fundamental React concepts while providing an overview
 * of everything students will learn throughout the tutorial:
 * 
 * 1. COMPONENT STRUCTURE: Clean, semantic component organization
 * 2. PROPS HANDLING: Receiving and using props from parent components  
 * 3. EVENT HANDLING: Button clicks and user interactions
 * 4. CONDITIONAL RENDERING: Showing different content based on state
 * 5. RESPONSIVE DESIGN: Mobile-first layout with Tailwind CSS
 * 6. ACCESSIBILITY: Proper semantics and keyboard navigation
 * 7. ANIMATION: Smooth transitions and visual feedback
 * 8. DOCUMENTATION: Inline learning resources and explanations
 * 
 * This component sets the tone for the entire educational experience
 * and introduces learners to the React mindset.
 */

// React imports for component functionality
import React, { useState, useEffect, useCallback } from 'react';

// Our educational components
import Button from '../ui/Button.jsx';

// Custom hooks for state management
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { useDisclosure } from '../../hooks/useToggle.js';

// Utilities
import { clsx } from 'clsx';

/**
 * LEARNING OBJECTIVES DATA
 * 
 * We define our learning objectives as data to make them easy to maintain
 * and iterate over. This demonstrates the React pattern of "data-driven UI".
 */
const LEARNING_OBJECTIVES = [
  {
    id: 'components',
    title: 'Component Architecture', 
    emoji: '🧩',
    description: 'Learn how to build reusable, composable UI components',
    skills: ['JSX syntax', 'Props and state', 'Component composition', 'Event handling'],
    estimatedTime: '30 minutes'
  },
  {
    id: 'state',
    title: 'State Management',
    emoji: '⚡',
    description: 'Master React\'s reactive state management patterns',
    skills: ['useState hook', 'useReducer', 'State lifting', 'Derived state'],
    estimatedTime: '45 minutes'
  },
  {
    id: 'effects',
    title: 'Side Effects',
    emoji: '🌊',
    description: 'Handle side effects and lifecycle with useEffect',
    skills: ['useEffect patterns', 'Cleanup functions', 'Dependencies', 'Custom hooks'],
    estimatedTime: '40 minutes'
  },
  {
    id: 'performance',
    title: 'Performance Optimization',
    emoji: '🚀',
    description: 'Learn to build fast, efficient React applications',
    skills: ['React.memo', 'useMemo', 'useCallback', 'Code splitting'],
    estimatedTime: '35 minutes'
  },
  {
    id: 'patterns',
    title: 'Advanced Patterns',
    emoji: '🎭',
    description: 'Master complex patterns for real-world applications',
    skills: ['Context API', 'Error boundaries', 'HOCs', 'Render props'],
    estimatedTime: '50 minutes'
  },
  {
    id: 'testing',
    title: 'Testing Strategies',
    emoji: '🧪',
    description: 'Write reliable tests for React components',
    skills: ['Unit testing', 'Integration tests', 'Mock patterns', 'Test-driven development'],
    estimatedTime: '40 minutes'
  }
];

/**
 * FEATURE HIGHLIGHTS DATA
 * 
 * Key features of our educational app that demonstrate real-world patterns.
 */
const FEATURE_HIGHLIGHTS = [
  {
    title: 'Interactive Learning',
    emoji: '🎮',
    description: 'Learn by doing with hands-on examples and live code editing',
  },
  {
    title: 'Real-world Patterns', 
    emoji: '🏭',
    description: 'Every example reflects patterns used in production applications',
  },
  {
    title: 'Performance Focus',
    emoji: '⚡',
    description: 'Learn optimization techniques from the beginning',
  },
  {
    title: 'Accessibility First',
    emoji: '♿',
    description: 'Build inclusive applications that work for everyone',
  },
  {
    title: 'Modern Tooling',
    emoji: '🛠️',
    description: 'Use the latest tools and best practices in React development',
  },
  {
    title: 'Progressive Learning',
    emoji: '📈',
    description: 'Concepts build on each other for comprehensive understanding',
  }
];

/**
 * WelcomeSection Component Definition
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onNavigate - Function to handle navigation to other sections
 */
function WelcomeSection({ onNavigate }) {
  console.log('👋 WelcomeSection component rendering...');
  
  /**
   * LOCAL STATE FOR WELCOME INTERACTIONS
   * 
   * We manage several pieces of state to create an engaging welcome experience
   * that demonstrates React concepts right from the start.
   */
  
  // User progress and preferences
  const [userName, setUserName] = useLocalStorage('user_name', '');
  const [hasStartedTutorial, setHasStartedTutorial] = useLocalStorage('tutorial_started', false);
  
  // Interactive state for demonstrations
  const [currentObjective, setCurrentObjective] = useState(0);
  const { isDisclosed: showFullDescription, toggle: toggleDescription } = useDisclosure(false);
  const [animationDemo, setAnimationDemo] = useState(false);
  
  // Welcome flow state
  const [welcomeStep, setWelcomeStep] = useState(1);
  const [showGetStarted, setShowGetStarted] = useState(false);
  
  /**
   * WELCOME FLOW AUTOMATION
   * 
   * This effect creates a gentle introduction flow that demonstrates
   * useEffect and automated state management.
   */
  useEffect(() => {
    // Auto-advance through welcome steps
    const timer = setTimeout(() => {
      if (welcomeStep < 3) {
        setWelcomeStep(prev => prev + 1);
        console.log(`📚 Welcome step advanced to: ${welcomeStep + 1}`);
      } else {
        setShowGetStarted(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [welcomeStep]);
  
  /**
   * LEARNING OBJECTIVE CAROUSEL
   * 
   * Automatically cycles through learning objectives to showcase content.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentObjective(prev => (prev + 1) % LEARNING_OBJECTIVES.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * EVENT HANDLERS
   */
  
  // Handle starting the tutorial
  const handleStartTutorial = useCallback(() => {
    console.log('🚀 Starting tutorial for user:', userName || 'Anonymous');
    
    setHasStartedTutorial(true);
    
    // Navigate to first educational section
    if (onNavigate) {
      onNavigate('components');
    }
  }, [userName, setHasStartedTutorial, onNavigate]);
  
  // Handle name input changes
  const handleNameChange = useCallback((event) => {
    setUserName(event.target.value);
  }, [setUserName]);
  
  // Trigger animation demo
  const triggerAnimationDemo = useCallback(() => {
    setAnimationDemo(true);
    setTimeout(() => setAnimationDemo(false), 1000);
  }, []);
  
  /**
   * COMPONENT RENDER
   * 
   * The welcome interface with progressive disclosure and interactive elements.
   */
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
            Welcome to React Learning
          </h1>
        </div>
        
        <div className={clsx(
          'transition-all duration-1000 ease-out delay-500',
          welcomeStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            This comprehensive educational movie application teaches you React through 
            practical, real-world examples. Every component, hook, and pattern you'll 
            learn here is used in production applications.
          </p>
        </div>
        
        <div className={clsx(
          'transition-all duration-1000 ease-out delay-1000',
          welcomeStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-xl">✅</span>
              <span className="font-medium">Hands-on Learning</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <span className="text-xl">🎯</span>
              <span className="font-medium">Real-world Patterns</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <span className="text-xl">🚀</span>
              <span className="font-medium">Performance Focused</span>
            </div>
          </div>
        </div>
        
        {/* Get Started Section */}
        {showGetStarted && (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Let's Get Started!
              </h3>
              
              <div className="space-y-4">
                {/* Name Input for Personalization */}
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
                
                {/* Personalized greeting */}
                {userName && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      👋 Nice to meet you, <strong>{userName}</strong>! 
                      Ready to master React?
                    </p>
                  </div>
                )}
                
                {/* Start Button */}
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleStartTutorial}
                  className="w-full"
                >
                  {userName ? `Start Learning, ${userName}!` : 'Begin React Tutorial'}
                </Button>
                
                {/* Secondary Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={toggleDescription}
                    className="flex-1"
                  >
                    {showFullDescription ? 'Hide' : 'Show'} Details
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="medium"
                    onClick={triggerAnimationDemo}
                    className="flex-1"
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
            What You'll Learn
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our curriculum covers everything from basic components to advanced patterns
            used in production React applications.
          </p>
        </div>
        
        {/* Objectives Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {LEARNING_OBJECTIVES.map((objective, index) => (
            <div
              key={objective.id}
              className={clsx(
                'card transition-all duration-300 cursor-pointer',
                'hover:shadow-lg hover:border-blue-300 hover:-translate-y-1',
                currentObjective === index && 'ring-2 ring-blue-500 shadow-lg',
                animationDemo && 'animate-pulse'
              )}
              onClick={() => setCurrentObjective(index)}
            >
              <div className="text-center">
                {/* Objective Icon */}
                <div className="text-4xl mb-4">
                  {objective.emoji}
                </div>
                
                {/* Objective Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {objective.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {objective.description}
                </p>
                
                {/* Skills List */}
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
                
                {/* Estimated Time */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ⏱️ {objective.estimatedTime}
                </div>
              </div>
              
              {/* Expanded Details */}
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
        
        {/* Objective Navigation */}
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
          Why This Approach Works
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
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Complete Course Overview
            </h2>
            
            {/* Course Structure */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🗺️ Learning Path
                </h3>
                <div className="space-y-3">
                  {['Components & Props', 'State & Events', 'Effects & Lifecycle', 
                    'Custom Hooks', 'Context & Performance', 'Testing & Deployment'].map((topic, index) => (
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
                    { name: 'React 18', description: 'Latest React with concurrent features' },
                    { name: 'Vite', description: 'Fast build tool and dev server' },
                    { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
                    { name: 'Hono Backend', description: 'Fast web framework for APIs' },
                    { name: 'SQLite + Drizzle', description: 'Database with type-safe ORM' }
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
            
            {/* Prerequisites */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">📚 Prerequisites</h3>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Basic JavaScript knowledge (variables, functions, objects, arrays) and 
                familiarity with HTML/CSS. No prior React experience required!
              </p>
            </div>
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Amazing React Apps?
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of developers who have mastered React through practical learning.
            Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              size="large"
              onClick={handleStartTutorial}
            >
              🚀 Start Learning Now
            </Button>
            
            <Button
              variant="secondary"
              size="large"
              onClick={toggleDescription}
            >
              📖 View Course Details
            </Button>
          </div>
          
          {/* Progress indicator for returning users */}
          {hasStartedTutorial && (
            <div className="mt-6 p-4 bg-blue-500 rounded-lg">
              <p className="text-blue-100 mb-2">
                👋 Welcome back{userName && `, ${userName}`}!
              </p>
              <p className="text-sm text-blue-200">
                Continue where you left off or explore any section.
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
              React makes UI animations smooth and delightful!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HELPER COMPONENTS FOR WELCOME SECTION
 */

/**
 * ProgressBadge - Shows completion status
 */
function ProgressBadge({ completed, total }) {
  const percentage = Math.round((completed / total) * 100);
  
  return (
    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
      <div className="w-4 h-4 bg-green-200 rounded-full flex items-center justify-center">
        <div 
          className="bg-green-600 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`, 
            height: `${percentage}%` 
          }}
        />
      </div>
      <span className="font-medium">{percentage}% Complete</span>
    </div>
  );
}

export default WelcomeSection;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPONENT ORGANIZATION:
 *    - Clear single responsibility (welcome/introduction)
 *    - Logical state management
 *    - Helper component extraction
 * 
 * 2. DATA-DRIVEN UI:
 *    - Using arrays to generate UI elements
 *    - Mapping over data structures
 *    - Dynamic content based on data
 * 
 * 3. PROGRESSIVE DISCLOSURE:
 *    - Revealing content gradually
 *    - User-controlled detail levels
 *    - Smooth transitions between states
 * 
 * 4. USER PERSONALIZATION:
 *    - Storing user preferences
 *    - Conditional content based on user state
 *    - Personalized messaging
 * 
 * 5. ANIMATION PATTERNS:
 *    - CSS transition classes
 *    - Staggered animations with delays
 *    - Conditional animation triggers
 * 
 * 6. ACCESSIBILITY:
 *    - Proper semantic HTML
 *    - ARIA labels and descriptions
 *    - Keyboard navigation support
 * 
 * This component serves as both an introduction and a demonstration
 * of the quality and depth of education provided throughout the tutorial.
 */
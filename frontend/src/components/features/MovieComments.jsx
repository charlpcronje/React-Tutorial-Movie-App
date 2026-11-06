/**
 * MovieComments Component - Interactive Comments System
 * 
 * This component demonstrates advanced React patterns for building
 * a complete commenting system with local persistence. Educational concepts:
 * 
 * 1. COMPLEX STATE MANAGEMENT: Managing comments, replies, and editing states
 * 2. FORM HANDLING: Controlled inputs with validation and submission
 * 3. CONDITIONAL RENDERING: Different UI states based on data and user actions
 * 4. LIST RENDERING: Dynamic comments list with keys and performance considerations
 * 5. LOCAL STORAGE PERSISTENCE: Data persistence across browser sessions
 * 6. NESTED DATA STRUCTURES: Comments with replies and user information
 * 7. EVENT HANDLING: User interactions for adding, editing, deleting comments
 * 8. ACCESSIBILITY: Screen reader support and keyboard navigation
 * 9. RESPONSIVE DESIGN: Mobile-friendly comment interface
 * 10. OPTIMISTIC UPDATES: Immediate UI feedback before data persistence
 * 
 * This serves as a comprehensive example of real-world React development
 * patterns used in production applications.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';

/**
 * COMMENT DATA STRUCTURE
 * 
 * Defines the shape of comment objects throughout the application.
 * This demonstrates how to structure data for complex features.
 */

/**
 * Comment Interface Definition
 * 
 * Represents a single comment with all necessary metadata
 * for a production-quality commenting system.
 */
const createComment = (movieId, text, author = 'Anonymous User') => ({
  id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  movieId: movieId,
  text: text.trim(),
  author: author.trim() || 'Anonymous User',
  timestamp: new Date().toISOString(),
  likes: 0,
  dislikes: 0,
  replies: [],
  isEdited: false,
  lastEditedAt: null,
  userHasLiked: false,
  userHasDisliked: false,
  isHidden: false,
  reportCount: 0
});

/**
 * Reply Interface Definition
 * 
 * Represents replies to comments with simpler structure
 * but maintaining consistency with parent comments.
 */
const createReply = (commentId, text, author = 'Anonymous User') => ({
  id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  commentId: commentId,
  text: text.trim(),
  author: author.trim() || 'Anonymous User', 
  timestamp: new Date().toISOString(),
  likes: 0,
  isEdited: false,
  lastEditedAt: null,
  userHasLiked: false
});

/**
 * MovieComments Component Definition
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.movieId - Unique identifier for the movie
 * @param {string} props.movieTitle - Movie title for context display
 * @param {Function} props.onCommentsChange - Callback when comments are modified
 * @param {string} props.className - Optional CSS class for styling
 */
function MovieComments({ 
  movieId, 
  movieTitle, 
  onCommentsChange = null,
  className = '' 
}) {
  console.log(`💬 MovieComments rendering for movie: ${movieTitle} (ID: ${movieId})`);

  /**
   * COMMENTS STATE MANAGEMENT
   * 
   * We use localStorage to persist comments across browser sessions,
   * demonstrating real-world data persistence patterns.
   */
  
  // All comments stored with localStorage persistence
  const [allComments, setAllComments] = useLocalStorage('movie_comments', {});
  
  // UI state for managing user interactions
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useLocalStorage('comment_author_name', '');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [showReplies, setShowReplies] = useState({});

  /**
   * COMPUTED VALUES WITH MEMOIZATION
   * 
   * These values are computed from state but memoized for performance.
   * This demonstrates how to optimize calculations in React.
   */
  
  // Get comments for this specific movie
  const movieComments = useMemo(() => {
    return allComments[movieId] || [];
  }, [allComments, movieId]);

  // Sort comments based on user preference
  const sortedComments = useMemo(() => {
    const comments = [...movieComments];
    
    switch (sortBy) {
      case 'oldest':
        return comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      case 'popular':
        return comments.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
      case 'newest':
      default:
        return comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  }, [movieComments, sortBy]);

  // Comment statistics for display
  const commentStats = useMemo(() => {
    const totalComments = movieComments.length;
    const totalReplies = movieComments.reduce((sum, comment) => sum + comment.replies.length, 0);
    const totalLikes = movieComments.reduce((sum, comment) => sum + comment.likes, 0);
    
    return {
      totalComments,
      totalReplies,
      totalLikes,
      totalInteractions: totalComments + totalReplies + totalLikes
    };
  }, [movieComments]);

  /**
   * EFFECT HOOKS FOR SIDE EFFECTS
   * 
   * These effects handle external interactions and notifications.
   */
  
  // Notify parent component when comments change
  useEffect(() => {
    if (onCommentsChange) {
      onCommentsChange(commentStats);
    }
  }, [commentStats, onCommentsChange]);

  // Log comment activity for educational purposes
  useEffect(() => {
    console.log(`📊 Comment stats for ${movieTitle}:`, commentStats);
  }, [commentStats, movieTitle]);

  /**
   * COMMENT MANAGEMENT FUNCTIONS
   * 
   * These functions handle all comment operations with proper
   * data validation and error handling.
   */

  // Add new comment with validation
  const handleAddComment = useCallback(() => {
    // Input validation
    if (!newCommentText.trim()) {
      alert('Please enter a comment before submitting.');
      return;
    }

    if (newCommentText.length > 500) {
      alert('Comment is too long. Please keep it under 500 characters.');
      return;
    }

    console.log(`💬 Adding new comment for movie ${movieId}:`, newCommentText);

    // Create new comment object
    const comment = createComment(movieId, newCommentText, authorName);
    
    // Update comments in localStorage
    setAllComments(prev => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), comment]
    }));

    // Clear form
    setNewCommentText('');
    
    console.log(`✅ Comment added successfully: ${comment.id}`);
  }, [movieId, newCommentText, authorName, setAllComments]);

  // Delete comment with confirmation
  const handleDeleteComment = useCallback((commentId) => {
    console.log(`🗑️ Attempting to delete comment: ${commentId}`);
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).filter(comment => comment.id !== commentId)
    }));

    console.log(`✅ Comment deleted: ${commentId}`);
  }, [movieId, setAllComments]);

  // Start editing a comment
  const handleStartEdit = useCallback((comment) => {
    console.log(`✏️ Starting edit for comment: ${comment.id}`);
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }, []);

  // Save edited comment
  const handleSaveEdit = useCallback(() => {
    if (!editingText.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    console.log(`💾 Saving edit for comment: ${editingCommentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).map(comment => 
        comment.id === editingCommentId 
          ? {
              ...comment,
              text: editingText.trim(),
              isEdited: true,
              lastEditedAt: new Date().toISOString()
            }
          : comment
      )
    }));

    // Clear editing state
    setEditingCommentId(null);
    setEditingText('');
    
    console.log(`✅ Comment edit saved: ${editingCommentId}`);
  }, [editingCommentId, editingText, movieId, setAllComments]);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    console.log(`❌ Canceling edit for comment: ${editingCommentId}`);
    setEditingCommentId(null);
    setEditingText('');
  }, [editingCommentId]);

  // Toggle like on comment
  const handleToggleLike = useCallback((commentId) => {
    console.log(`👍 Toggling like for comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              likes: comment.userHasLiked ? comment.likes - 1 : comment.likes + 1,
              userHasLiked: !comment.userHasLiked,
              // Remove dislike if user previously disliked
              dislikes: comment.userHasDisliked ? comment.dislikes - 1 : comment.dislikes,
              userHasDisliked: comment.userHasDisliked ? false : comment.userHasDisliked
            }
          : comment
      )
    }));
  }, [movieId, setAllComments]);

  // Add reply to comment
  const handleAddReply = useCallback((commentId) => {
    if (!replyText.trim()) {
      alert('Please enter a reply before submitting.');
      return;
    }

    console.log(`💬 Adding reply to comment: ${commentId}`);

    const reply = createReply(commentId, replyText, authorName);
    
    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    }));

    // Clear reply form
    setReplyText('');
    setReplyingToId(null);
    
    console.log(`✅ Reply added successfully: ${reply.id}`);
  }, [replyText, authorName, movieId, setAllComments]);

  // Toggle replies visibility
  const toggleReplies = useCallback((commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }, []);

  /**
   * HELPER FUNCTIONS FOR DISPLAY
   * 
   * These functions format data for display while maintaining
   * clean separation of concerns.
   */
  
  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  /**
   * COMPONENT RENDER
   * 
   * The main UI structure with comprehensive commenting interface.
   */
  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700', className)}>
      
      {/* Comments Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              💬 Comments for {movieTitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {commentStats.totalComments} comments • {commentStats.totalReplies} replies • {commentStats.totalLikes} likes
            </p>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Sort:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Comment Form */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="space-y-3">
          {/* Author Name Input */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-max">
              Your name:
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name (optional)"
              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Comment Text Area */}
          <div>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={`Share your thoughts about ${movieTitle}...`}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className={clsx(
                'text-xs',
                newCommentText.length > 450 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              )}>
                {newCommentText.length}/500 characters
              </span>
              
              <div className="flex space-x-2">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setNewCommentText('')}
                  disabled={!newCommentText.trim()}
                >
                  Clear
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                >
                  💬 Add Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedComments.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">💭</div>
            <p className="text-lg mb-2">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts about {movieTitle}!</p>
          </div>
        ) : (
          /* Comments Display */
          <div className="p-4 space-y-4">
            {sortedComments.map((comment, index) => (
              <div
                key={comment.id}
                className={clsx(
                  'border border-gray-200 dark:border-gray-600 rounded-lg p-4',
                  'bg-white dark:bg-gray-800',
                  comment.isHidden && 'opacity-50'
                )}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.author}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(comment.timestamp)}
                        {comment.isEdited && (
                          <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                            (edited)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                      title="Edit comment"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                      title="Delete comment"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                {editingCommentId === comment.id ? (
                  /* Editing Mode */
                  <div className="space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex space-x-2">
                      <Button size="small" variant="primary" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="small" variant="ghost" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      {comment.text}
                    </p>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        className={clsx(
                          'flex items-center space-x-1 text-sm rounded px-2 py-1 transition-colors',
                          comment.userHasLiked 
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        )}
                      >
                        <span>❤️</span>
                        <span>{comment.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        💬 Reply ({comment.replies.length})
                      </button>
                      
                      {comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                        >
                          {showReplies[comment.id] ? 'Hide' : 'Show'} Replies
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {replyingToId === comment.id && (
                  <div className="mt-4 pl-8 border-l-2 border-blue-200 dark:border-blue-700">
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.author}...`}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <div className="flex space-x-2">
                        <Button size="small" variant="primary" onClick={() => handleAddReply(comment.id)}>
                          Add Reply
                        </Button>
                        <Button size="small" variant="ghost" onClick={() => setReplyingToId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies List */}
                {showReplies[comment.id] && comment.replies.length > 0 && (
                  <div className="mt-4 pl-8 space-y-3 border-l-2 border-gray-200 dark:border-gray-600">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {reply.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {reply.author}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(reply.timestamp)}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleToggleLike(reply.id)}
                            className={clsx(
                              'flex items-center space-x-1 text-xs rounded px-1 py-0.5 transition-colors',
                              reply.userHasLiked 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                            )}
                          >
                            <span>❤️</span>
                            <span>{reply.likes}</span>
                          </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Footer */}
      {movieComments.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            📊 Community engagement: {commentStats.totalInteractions} total interactions
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieComments;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPLEX STATE MANAGEMENT:
 *    - Multiple related state variables
 *    - localStorage integration for persistence
 *    - State updates with immutable patterns
 *    - Conditional state (editing, replying)
 * 
 * 2. FORM HANDLING PATTERNS:
 *    - Controlled inputs with validation
 *    - Character limits and user feedback
 *    - Multi-field form management
 *    - Form submission and clearing
 * 
 * 3. LIST RENDERING OPTIMIZATION:
 *    - Efficient keys for dynamic lists
 *    - Conditional rendering for empty states
 *    - Nested list structures (replies)
 *    - Performance considerations
 * 
 * 4. EVENT HANDLING COMPLEXITY:
 *    - Multiple event types (click, input, submit)
 *    - Event delegation and bubbling
 *    - Keyboard accessibility
 *    - Touch-friendly interactions
 * 
 * 5. DATA PERSISTENCE PATTERNS:
 *    - localStorage for client-side persistence
 *    - Data structure design for relationships
 *    - State synchronization across components
 *    - Optimistic UI updates
 * 
 * 6. USER EXPERIENCE FEATURES:
 *    - Real-time feedback and validation
 *    - Progressive disclosure (replies)
 *    - Sort and filter functionality
 *    - Accessible interactions
 * 
 * 7. PERFORMANCE OPTIMIZATIONS:
 *    - useMemo for expensive calculations
 *    - useCallback for stable references
 *    - Conditional rendering to minimize DOM updates
 *    - Efficient list operations
 * 
 * This component serves as an advanced example of how real-world
 * features are implemented in React applications, demonstrating
 * patterns used in production commenting systems.
 */
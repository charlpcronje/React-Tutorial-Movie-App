/**
 * useComments Hook - Comprehensive Comments Management
 * 
 * This custom hook encapsulates all commenting functionality, demonstrating:
 * 
 * 1. CUSTOM HOOK PATTERNS: Extracting complex logic into reusable hooks
 * 2. STATE MANAGEMENT: Managing related state in a single location
 * 3. LOCAL STORAGE INTEGRATION: Persistent data across browser sessions
 * 4. COMPUTED VALUES: Derived state with memoization for performance
 * 5. EVENT HANDLING: Centralized comment operations
 * 6. VALIDATION LOGIC: Input validation and error handling
 * 7. OPTIMISTIC UPDATES: Immediate UI feedback before persistence
 * 8. NESTED DATA OPERATIONS: Working with comments and replies
 * 9. HOOK COMPOSITION: Building complex hooks from simpler ones
 * 10. SEPARATION OF CONCERNS: Logic separated from presentation
 * 
 * This demonstrates how to build maintainable, testable React applications
 * by extracting business logic into custom hooks.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import useLocalStorage from './useLocalStorage.js';

/**
 * COMMENT FACTORY FUNCTIONS
 * 
 * These functions create consistent comment and reply objects
 * with all required properties and proper defaults.
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
 * useComments Custom Hook
 * 
 * @param {string|number} movieId - Unique identifier for the movie
 * @returns {Object} - Comments state and management functions
 */
function useComments(movieId) {
  console.log(`💬 useComments hook initializing for movie: ${movieId}`);

  /**
   * PERSISTENT STATE MANAGEMENT
   * 
   * Comments are stored in localStorage for persistence across sessions.
   * This demonstrates real-world data persistence patterns.
   */
  
  const [allComments, setAllComments] = useLocalStorage('movie_comments', {});
  const [authorName, setAuthorName] = useLocalStorage('comment_author_name', '');

  /**
   * LOCAL UI STATE
   * 
   * These state variables manage the commenting interface
   * and user interactions.
   */
  
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  /**
   * COMPUTED VALUES WITH MEMOIZATION
   * 
   * These values are computed from state but cached for performance.
   * Demonstrates performance optimization patterns in React.
   */
  
  // Get comments for specific movie
  const movieComments = useMemo(() => {
    const comments = allComments[movieId] || [];
    console.log(`📊 Found ${comments.length} comments for movie ${movieId}`);
    return comments;
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

  // Calculate comment statistics
  const commentStats = useMemo(() => {
    const totalComments = movieComments.length;
    const totalReplies = movieComments.reduce((sum, comment) => sum + comment.replies.length, 0);
    const totalLikes = movieComments.reduce((sum, comment) => sum + comment.likes, 0);
    const totalInteractions = totalComments + totalReplies + totalLikes;
    
    return {
      totalComments,
      totalReplies,
      totalLikes,
      totalInteractions,
      hasComments: totalComments > 0
    };
  }, [movieComments]);

  /**
   * COMMENT MANAGEMENT FUNCTIONS
   * 
   * These functions handle all comment operations with proper
   * validation, error handling, and state updates.
   */

  // Add new comment with comprehensive validation
  const addComment = useCallback((text = newCommentText, author = authorName) => {
    // Input validation
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Comment text is required');
    }

    if (trimmedText.length > 500) {
      throw new Error('Comment is too long. Please keep it under 500 characters.');
    }

    console.log(`💬 Adding new comment for movie ${movieId}:`, trimmedText);

    // Create new comment
    const comment = createComment(movieId, trimmedText, author);
    
    // Update comments with immutable pattern
    setAllComments(prev => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), comment]
    }));

    // Clear form state
    setNewCommentText('');
    
    console.log(`✅ Comment added successfully: ${comment.id}`);
    return comment;
  }, [movieId, newCommentText, authorName, setAllComments]);

  // Delete comment with confirmation
  const deleteComment = useCallback((commentId) => {
    console.log(`🗑️ Deleting comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).filter(comment => comment.id !== commentId)
    }));

    console.log(`✅ Comment deleted: ${commentId}`);
  }, [movieId, setAllComments]);

  // Update comment text
  const updateComment = useCallback((commentId, newText) => {
    const trimmedText = newText.trim();
    if (!trimmedText) {
      throw new Error('Comment text cannot be empty');
    }

    console.log(`💾 Updating comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              text: trimmedText,
              isEdited: true,
              lastEditedAt: new Date().toISOString()
            }
          : comment
      )
    }));

    console.log(`✅ Comment updated: ${commentId}`);
  }, [movieId, setAllComments]);

  // Toggle like on comment
  const toggleLike = useCallback((commentId) => {
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
              userHasDisliked: false
            }
          : comment
      )
    }));
  }, [movieId, setAllComments]);

  // Add reply to comment
  const addReply = useCallback((commentId, text, author = authorName) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Reply text is required');
    }

    console.log(`💬 Adding reply to comment: ${commentId}`);

    const reply = createReply(commentId, trimmedText, author);
    
    setAllComments(prev => ({
      ...prev,
      [movieId]: (prev[movieId] || []).map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    }));

    console.log(`✅ Reply added: ${reply.id}`);
    return reply;
  }, [movieId, authorName, setAllComments]);

  // Clear all comments for movie
  const clearComments = useCallback(() => {
    console.log(`🗑️ Clearing all comments for movie: ${movieId}`);
    
    setAllComments(prev => ({
      ...prev,
      [movieId]: []
    }));
  }, [movieId, setAllComments]);

  /**
   * UTILITY FUNCTIONS
   * 
   * Helper functions for comment management and display.
   */
  
  const getCommentById = useCallback((commentId) => {
    return movieComments.find(comment => comment.id === commentId) || null;
  }, [movieComments]);

  const getReplyById = useCallback((replyId) => {
    for (const comment of movieComments) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply) return reply;
    }
    return null;
  }, [movieComments]);

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
   * HOOK RETURN VALUE
   * 
   * Returns all necessary state and functions for comment management.
   * This provides a clean API for components to use.
   */
  return {
    // Data
    comments: sortedComments,
    commentStats,
    
    // Author state
    authorName,
    setAuthorName,
    
    // New comment state
    newCommentText,
    setNewCommentText,
    
    // Editing state
    editingCommentId,
    setEditingCommentId,
    editingText,
    setEditingText,
    
    // Reply state
    replyingToId,
    setReplyingToId,
    replyText,
    setReplyText,
    
    // Sort state
    sortBy,
    setSortBy,
    
    // Actions
    addComment,
    deleteComment,
    updateComment,
    toggleLike,
    addReply,
    clearComments,
    
    // Utilities
    getCommentById,
    getReplyById,
    formatTimestamp
  };
}

export default useComments;

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 1. CUSTOM HOOK ARCHITECTURE:
 *    - Extracting complex logic from components
 *    - Creating reusable stateful logic
 *    - Hook composition patterns
 *    - Clean API design
 * 
 * 2. STATE MANAGEMENT PATTERNS:
 *    - Multiple related state variables
 *    - Immutable state updates
 *    - Computed state with memoization
 *    - Local storage integration
 * 
 * 3. FUNCTION COMPOSITION:
 *    - Breaking down complex operations
 *    - Error handling strategies
 *    - Validation patterns
 *    - Side effect management
 * 
 * 4. PERFORMANCE OPTIMIZATION:
 *    - useMemo for expensive calculations
 *    - useCallback for stable references
 *    - Efficient data structures
 *    - Minimal re-renders
 * 
 * 5. DATA MODELING:
 *    - Comment and reply relationships
 *    - Nested data structures
 *    - Timestamp and metadata handling
 *    - User interaction tracking
 * 
 * This hook demonstrates how to build robust, maintainable
 * features that can be shared across multiple components
 * while maintaining clean separation of concerns.
 */
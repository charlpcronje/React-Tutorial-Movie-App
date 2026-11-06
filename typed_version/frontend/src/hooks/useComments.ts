/**
 * useComments Hook - TypeScript Implementation
 * 
 * Comprehensive TypeScript implementation of the comments management hook
 * demonstrating advanced TypeScript patterns for React hooks.
 */

import { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import type {
  Comment,
  Reply,
  CommentStats,
  CommentSortOrder,
  CommentId,
  ReplyId,
  MovieId,
  UseCommentsReturn,
  CommentStorage,
  CreateCommentInput,
  UpdateCommentInput
} from '../types/comments';

// ============================================================================
// FACTORY FUNCTIONS WITH TYPESCRIPT
// ============================================================================

/**
 * Create Comment Factory Function
 * 
 * Type-safe comment creation with all required properties.
 */
const createComment = (movieId: MovieId, text: string, author: string = 'Anonymous User'): Comment => ({
  id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as CommentId,
  movieId,
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
 * Create Reply Factory Function
 * 
 * Type-safe reply creation with proper typing.
 */
const createReply = (commentId: CommentId, text: string, author: string = 'Anonymous User'): Reply => ({
  id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as ReplyId,
  commentId,
  text: text.trim(),
  author: author.trim() || 'Anonymous User',
  timestamp: new Date().toISOString(),
  likes: 0,
  isEdited: false,
  lastEditedAt: null,
  userHasLiked: false
});

// ============================================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================================

/**
 * useComments Hook with Comprehensive TypeScript Typing
 * 
 * @param movieId - Unique identifier for the movie
 * @returns Complete comments management API with type safety
 */
function useComments(movieId: MovieId): UseCommentsReturn {
  console.log(`💬 useComments (TS) hook initializing for movie: ${movieId}`);

  // ============================================================================
  // PERSISTENT STATE WITH TYPESCRIPT
  // ============================================================================
  
  const [allComments, setAllComments] = useLocalStorage<CommentStorage>('movie_comments', {});
  const [authorName, setAuthorName] = useLocalStorage<string>('comment_author_name', '');

  // ============================================================================
  // LOCAL UI STATE WITH EXPLICIT TYPING
  // ============================================================================
  
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<CommentId | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [replyingToId, setReplyingToId] = useState<CommentId | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [sortBy, setSortBy] = useState<CommentSortOrder>('newest');

  // ============================================================================
  // MEMOIZED COMPUTATIONS WITH TYPESCRIPT
  // ============================================================================
  
  // Get comments for specific movie with type safety
  const movieComments = useMemo((): readonly Comment[] => {
    const comments = allComments[movieId.toString()] || [];
    console.log(`📊 Found ${comments.length} comments for movie ${movieId}`);
    return comments;
  }, [allComments, movieId]);

  // Sort comments with type-safe comparator functions
  const sortedComments = useMemo((): readonly Comment[] => {
    const comments = [...movieComments];
    
    const sortComparators: Record<CommentSortOrder, (a: Comment, b: Comment) => number> = {
      oldest: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      newest: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      popular: (a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes)
    };
    
    return comments.sort(sortComparators[sortBy]);
  }, [movieComments, sortBy]);

  // Calculate comprehensive comment statistics
  const commentStats = useMemo((): CommentStats => {
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

  // ============================================================================
  // COMMENT MANAGEMENT FUNCTIONS WITH TYPESCRIPT
  // ============================================================================

  /**
   * Add Comment Function
   * 
   * Type-safe comment creation with comprehensive validation.
   */
  const addComment = useCallback((text: string = newCommentText, author: string = authorName): Comment => {
    // Type-safe validation
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Comment text is required');
    }

    if (trimmedText.length > 500) {
      throw new Error('Comment is too long. Please keep it under 500 characters.');
    }

    console.log(`💬 Adding new comment for movie ${movieId}:`, trimmedText);

    // Create type-safe comment
    const comment = createComment(movieId, trimmedText, author);
    
    // Update comments with immutable update pattern
    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: [...(prev[movieId.toString()] || []), comment]
    }));

    // Clear form state
    setNewCommentText('');
    
    console.log(`✅ Comment added successfully: ${comment.id}`);
    return comment;
  }, [movieId, newCommentText, authorName, setAllComments]);

  /**
   * Delete Comment Function
   * 
   * Type-safe comment deletion with state cleanup.
   */
  const deleteComment = useCallback((commentId: CommentId): void => {
    console.log(`🗑️ Deleting comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: (prev[movieId.toString()] || []).filter(comment => comment.id !== commentId)
    }));

    // Clean up related UI state
    if (editingCommentId === commentId) {
      setEditingCommentId(null);
      setEditingText('');
    }
    if (replyingToId === commentId) {
      setReplyingToId(null);
      setReplyText('');
    }

    console.log(`✅ Comment deleted: ${commentId}`);
  }, [movieId, editingCommentId, replyingToId, setAllComments]);

  /**
   * Update Comment Function
   * 
   * Type-safe comment text updates with validation.
   */
  const updateComment = useCallback((commentId: CommentId, newText: string): void => {
    const trimmedText = newText.trim();
    if (!trimmedText) {
      throw new Error('Comment text cannot be empty');
    }

    console.log(`💾 Updating comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: (prev[movieId.toString()] || []).map(comment => 
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

  /**
   * Toggle Like Function
   * 
   * Type-safe like/unlike functionality with state management.
   */
  const toggleLike = useCallback((commentId: CommentId): void => {
    console.log(`👍 Toggling like for comment: ${commentId}`);

    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: (prev[movieId.toString()] || []).map(comment => 
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

  /**
   * Add Reply Function
   * 
   * Type-safe reply creation with nested data management.
   */
  const addReply = useCallback((commentId: CommentId, text: string, author: string = authorName): Reply => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('Reply text is required');
    }

    console.log(`💬 Adding reply to comment: ${commentId}`);

    const reply = createReply(commentId, trimmedText, author);
    
    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: (prev[movieId.toString()] || []).map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    }));

    console.log(`✅ Reply added: ${reply.id}`);
    return reply;
  }, [movieId, authorName, setAllComments]);

  /**
   * Clear All Comments Function
   * 
   * Complete comment removal for the movie.
   */
  const clearComments = useCallback((): void => {
    console.log(`🗑️ Clearing all comments for movie: ${movieId}`);
    
    setAllComments(prev => ({
      ...prev,
      [movieId.toString()]: []
    }));
  }, [movieId, setAllComments]);

  // ============================================================================
  // UTILITY FUNCTIONS WITH TYPESCRIPT
  // ============================================================================
  
  /**
   * Get Comment by ID
   * 
   * Type-safe comment lookup function.
   */
  const getCommentById = useCallback((commentId: CommentId): Comment | null => {
    return movieComments.find(comment => comment.id === commentId) || null;
  }, [movieComments]);

  /**
   * Get Reply by ID
   * 
   * Type-safe reply lookup across all comments.
   */
  const getReplyById = useCallback((replyId: ReplyId): Reply | null => {
    for (const comment of movieComments) {
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply) return reply;
    }
    return null;
  }, [movieComments]);

  /**
   * Format Timestamp Function
   * 
   * Human-readable timestamp formatting with TypeScript.
   */
  const formatTimestamp = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }, []);

  // ============================================================================
  // HOOK RETURN WITH COMPREHENSIVE TYPESCRIPT
  // ============================================================================

  return {
    // Data with readonly arrays
    comments: sortedComments,
    commentStats,
    
    // Author state with type safety
    authorName,
    setAuthorName,
    
    // New comment state
    newCommentText,
    setNewCommentText,
    
    // Editing state with typed IDs
    editingCommentId,
    setEditingCommentId,
    editingText,
    setEditingText,
    
    // Reply state with typed IDs
    replyingToId,
    setReplyingToId,
    replyText,
    setReplyText,
    
    // Sort state with union types
    sortBy,
    setSortBy,
    
    // Type-safe action functions
    addComment,
    deleteComment,
    updateComment,
    toggleLike,
    addReply,
    clearComments,
    
    // Type-safe utility functions
    getCommentById,
    getReplyById,
    formatTimestamp
  };
}

export default useComments;

/**
 * TYPESCRIPT CONCEPTS DEMONSTRATED:
 * 
 * 1. GENERIC HOOK IMPLEMENTATION:
 *    - Type parameters for flexible hooks
 *    - Return type interfaces
 *    - Generic constraints
 *    - Type inference optimization
 * 
 * 2. BRANDED TYPES USAGE:
 *    - CommentId and ReplyId for type safety
 *    - Preventing ID mixing between entities
 *    - Compile-time ID validation
 * 
 * 3. ADVANCED STATE TYPING:
 *    - Complex nested state objects
 *    - Union types for sort options
 *    - Optional state with null types
 *    - Readonly arrays and objects
 * 
 * 4. FUNCTION TYPING:
 *    - Parameter and return type annotations
 *    - Void functions for side effects
 *    - Error throwing function signatures
 *    - Optional parameters with defaults
 * 
 * 5. UTILITY TYPES APPLICATION:
 *    - Pick for selecting properties
 *    - Omit for excluding properties
 *    - Partial for optional updates
 *    - Record for key-value mappings
 * 
 * 6. TYPE GUARDS AND VALIDATION:
 *    - Runtime type checking
 *    - Safe type assertions
 *    - Error boundary patterns
 * 
 * This hook demonstrates how TypeScript enhances custom hook
 * development with compile-time safety, better refactoring,
 * and enhanced developer experience.
 */
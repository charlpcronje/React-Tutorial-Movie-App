/**
 * MovieComments Component - TypeScript Implementation
 * 
 * Comprehensive TypeScript port of the commenting system with:
 * - Full type safety for all props and state
 * - Advanced TypeScript patterns demonstration
 * - Production-ready error handling
 * - Enhanced developer experience with IntelliSense
 */

import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Button from '../ui/Button';
import useComments from '../../hooks/useComments';
import type {
  MovieId,
  Comment,
  Reply,
  CommentStats,
  MovieCommentsProps
} from '../../types/comments';

// ============================================================================
// TYPESCRIPT COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * MovieComments Component with Full TypeScript Integration
 * 
 * Demonstrates advanced TypeScript patterns for complex components.
 */
const MovieComments: React.FC<MovieCommentsProps> = ({ 
  movieId, 
  movieTitle, 
  onCommentsChange,
  className = '',
  maxHeight = 'max-h-96',
  allowReplies = true,
  allowEditing = true,
  allowLikes = true
}) => {
  console.log(`💬 MovieComments (TS) rendering for movie: ${movieTitle} (ID: ${movieId})`);

  // ============================================================================
  // HOOK INTEGRATION WITH TYPESCRIPT
  // ============================================================================
  
  const {
    comments,
    commentStats,
    authorName,
    setAuthorName,
    newCommentText,
    setNewCommentText,
    editingCommentId,
    setEditingCommentId,
    editingText,
    setEditingText,
    replyingToId,
    setReplyingToId,
    replyText,
    setReplyText,
    sortBy,
    setSortBy,
    addComment,
    deleteComment,
    updateComment,
    toggleLike,
    addReply,
    formatTimestamp
  } = useComments(movieId);

  // ============================================================================
  // LOCAL UI STATE WITH TYPESCRIPT
  // ============================================================================
  
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  // ============================================================================
  // TYPE-SAFE EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle Add Comment with Error Handling
   */
  const handleAddComment = useCallback((): void => {
    try {
      addComment();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add comment');
    }
  }, [addComment]);

  /**
   * Handle Delete Comment with Confirmation
   */
  const handleDeleteComment = useCallback((commentId: string): void => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    deleteComment(commentId as any); // Type assertion for branded type
  }, [deleteComment]);

  /**
   * Handle Save Edit with Validation
   */
  const handleSaveEdit = useCallback((): void => {
    if (!editingCommentId) return;
    
    try {
      updateComment(editingCommentId, editingText);
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update comment');
    }
  }, [editingCommentId, editingText, updateComment]);

  /**
   * Handle Cancel Edit
   */
  const handleCancelEdit = useCallback((): void => {
    setEditingCommentId(null);
    setEditingText('');
  }, []);

  /**
   * Handle Start Edit
   */
  const handleStartEdit = useCallback((comment: Comment): void => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }, []);

  /**
   * Handle Add Reply with Validation
   */
  const handleAddReply = useCallback((commentId: string): void => {
    if (!replyText.trim()) {
      alert('Please enter a reply before submitting.');
      return;
    }

    try {
      addReply(commentId as any, replyText); // Type assertion for branded type
      setReplyText('');
      setReplyingToId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add reply');
    }
  }, [replyText, addReply]);

  /**
   * Handle Toggle Replies Visibility
   */
  const toggleReplies = useCallback((commentId: string): void => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }, []);

  /**
   * Handle Form Input Changes with Type Safety
   */
  const handleNewCommentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setNewCommentText(event.target.value);
  }, [setNewCommentText]);

  const handleAuthorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setAuthorName(event.target.value);
  }, [setAuthorName]);

  const handleEditTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEditingText(event.target.value);
  }, []);

  const handleReplyTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setReplyText(event.target.value);
  }, []);

  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(event.target.value as any); // Type assertion for union type
  }, [setSortBy]);

  // ============================================================================
  // EFFECTS FOR PARENT COMMUNICATION
  // ============================================================================
  
  // Notify parent of comment changes with TypeScript callback
  React.useEffect((): void => {
    onCommentsChange?.(commentStats);
  }, [commentStats, onCommentsChange]);

  // ============================================================================
  // RENDER WITH TYPESCRIPT JSX
  // ============================================================================
  
  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
      className
    )}>
      
      {/* Comments Header with TypeScript Props */}
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
          
          {/* Sort Options with TypeScript */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Sort:</label>
            <select 
              value={sortBy}
              onChange={handleSortChange}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Comment Form with TypeScript Validation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-max">
              Your name:
            </label>
            <input
              type="text"
              value={authorName}
              onChange={handleAuthorChange}
              placeholder="Enter your name (optional)"
              className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <textarea
              value={newCommentText}
              onChange={handleNewCommentChange}
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

      {/* Comments List with TypeScript Rendering */}
      <div className={clsx('overflow-y-auto', maxHeight)}>
        {comments.length === 0 ? (
          /* Empty State */
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">💭</div>
            <p className="text-lg mb-2">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts about {movieTitle}!</p>
          </div>
        ) : (
          /* Comments Display */
          <div className="p-4 space-y-4">
            {comments.map((comment: Comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
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
                    {allowEditing && (
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                        title="Edit comment"
                      >
                        ✏️
                      </button>
                    )}
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
                      onChange={handleEditTextChange}
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
                      {allowLikes && (
                        <button
                          onClick={() => toggleLike(comment.id)}
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
                      )}
                      
                      {allowReplies && (
                        <button
                          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          💬 Reply ({comment.replies.length})
                        </button>
                      )}
                      
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
                {allowReplies && replyingToId === comment.id && (
                  <div className="mt-4 pl-8 border-l-2 border-blue-200 dark:border-blue-700">
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={handleReplyTextChange}
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

                {/* Replies List with TypeScript */}
                {showReplies[comment.id] && comment.replies.length > 0 && (
                  <div className="mt-4 pl-8 space-y-3 border-l-2 border-gray-200 dark:border-gray-600">
                    {comment.replies.map((reply: Reply) => (
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
                          
                          {allowLikes && (
                            <button
                              onClick={() => toggleLike(reply.id as any)} // Type assertion
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
                          )}
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

      {/* Comments Footer with Statistics */}
      {commentStats.hasComments && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            📊 Community engagement: {commentStats.totalInteractions} total interactions
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieComments;

/**
 * TYPESCRIPT CONCEPTS DEMONSTRATED:
 * 
 * 1. COMPONENT PROPS INTERFACE:
 *    - Comprehensive props typing with optional properties
 *    - Callback function typing with generic parameters
 *    - Default parameter values with type safety
 * 
 * 2. EVENT HANDLER TYPING:
 *    - React.ChangeEvent typing for form inputs
 *    - React.MouseEvent for click handlers
 *    - Proper event parameter typing
 * 
 * 3. STATE MANAGEMENT WITH TYPES:
 *    - Complex nested state objects
 *    - Record types for dynamic object keys
 *    - Union types for controlled values
 * 
 * 4. ERROR HANDLING PATTERNS:
 *    - Try-catch with typed errors
 *    - Error instance checking
 *    - Validation with meaningful messages
 * 
 * 5. HOOK INTEGRATION:
 *    - Custom hook return type usage
 *    - Type-safe hook composition
 *    - State and function extraction
 * 
 * 6. CONDITIONAL RENDERING:
 *    - Type-safe conditional logic
 *    - Null-safe property access
 *    - Optional chaining with TypeScript
 * 
 * This component showcases how TypeScript enhances complex
 * React components with type safety, better refactoring,
 * and enhanced developer experience while maintaining
 * identical functionality to the JavaScript version.
 */
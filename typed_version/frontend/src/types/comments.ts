/**
 * COMMENT TYPE DEFINITIONS FOR TYPESCRIPT
 * 
 * Comprehensive type definitions for the commenting system demonstrating:
 * 1. Interface design for complex data structures
 * 2. Nested object typing with relationships
 * 3. Optional properties and union types
 * 4. Readonly properties for immutability
 * 5. Branded types for type safety
 * 6. Utility types for data transformation
 */

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

export type CommentId = string & { readonly __brand: 'CommentId' };
export type ReplyId = string & { readonly __brand: 'ReplyId' };
export type MovieId = string | number;

// ============================================================================
// CORE COMMENT INTERFACES
// ============================================================================

/**
 * Base Comment Interface
 * 
 * Defines the structure of a movie comment with all metadata
 * and user interaction data.
 */
export interface Comment {
  readonly id: CommentId;
  readonly movieId: MovieId;
  readonly text: string;
  readonly author: string;
  readonly timestamp: string;
  readonly likes: number;
  readonly dislikes: number;
  readonly replies: readonly Reply[];
  readonly isEdited: boolean;
  readonly lastEditedAt: string | null;
  readonly userHasLiked: boolean;
  readonly userHasDisliked: boolean;
  readonly isHidden: boolean;
  readonly reportCount: number;
}

/**
 * Reply Interface
 * 
 * Simplified structure for comment replies.
 */
export interface Reply {
  readonly id: ReplyId;
  readonly commentId: CommentId;
  readonly text: string;
  readonly author: string;
  readonly timestamp: string;
  readonly likes: number;
  readonly isEdited: boolean;
  readonly lastEditedAt: string | null;
  readonly userHasLiked: boolean;
}

/**
 * Comment Statistics Interface
 * 
 * Aggregated statistics for displaying comment metrics.
 */
export interface CommentStats {
  readonly totalComments: number;
  readonly totalReplies: number;
  readonly totalLikes: number;
  readonly totalInteractions: number;
  readonly hasComments: boolean;
}

// ============================================================================
// FORM AND INPUT TYPES
// ============================================================================

/**
 * Comment Form Data
 * 
 * Data structure for comment creation forms.
 */
export interface CommentFormData {
  readonly text: string;
  readonly author: string;
}

/**
 * Reply Form Data
 * 
 * Data structure for reply creation forms.
 */
export interface ReplyFormData {
  readonly text: string;
  readonly author: string;
  readonly parentCommentId: CommentId;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * MovieComments Component Props
 * 
 * Props interface for the main comments component.
 */
export interface MovieCommentsProps {
  readonly movieId: MovieId;
  readonly movieTitle: string;
  readonly onCommentsChange?: (stats: CommentStats) => void;
  readonly className?: string;
  readonly maxHeight?: string;
  readonly allowReplies?: boolean;
  readonly allowEditing?: boolean;
  readonly allowLikes?: boolean;
}

/**
 * Comment Item Props
 * 
 * Props for individual comment display components.
 */
export interface CommentItemProps {
  readonly comment: Comment;
  readonly onEdit?: (commentId: CommentId, newText: string) => void;
  readonly onDelete?: (commentId: CommentId) => void;
  readonly onLike?: (commentId: CommentId) => void;
  readonly onReply?: (commentId: CommentId, replyText: string, author: string) => void;
  readonly showReplies?: boolean;
  readonly onToggleReplies?: (commentId: CommentId) => void;
  readonly isEditing?: boolean;
  readonly className?: string;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * useComments Hook Return Type
 * 
 * Comprehensive return type for the comments management hook.
 */
export interface UseCommentsReturn {
  // Data
  readonly comments: readonly Comment[];
  readonly commentStats: CommentStats;
  
  // Author state
  readonly authorName: string;
  readonly setAuthorName: (name: string) => void;
  
  // New comment state
  readonly newCommentText: string;
  readonly setNewCommentText: React.Dispatch<React.SetStateAction<string>>;
  
  // Editing state
  readonly editingCommentId: CommentId | null;
  readonly setEditingCommentId: React.Dispatch<React.SetStateAction<CommentId | null>>;
  readonly editingText: string;
  readonly setEditingText: React.Dispatch<React.SetStateAction<string>>;
  
  // Reply state
  readonly replyingToId: CommentId | null;
  readonly setReplyingToId: React.Dispatch<React.SetStateAction<CommentId | null>>;
  readonly replyText: string;
  readonly setReplyText: React.Dispatch<React.SetStateAction<string>>;
  
  // Sort state
  readonly sortBy: CommentSortOrder;
  readonly setSortBy: React.Dispatch<React.SetStateAction<CommentSortOrder>>;
  
  // Actions
  readonly addComment: (text?: string, author?: string) => Comment;
  readonly deleteComment: (commentId: CommentId) => void;
  readonly updateComment: (commentId: CommentId, newText: string) => void;
  readonly toggleLike: (commentId: CommentId) => void;
  readonly addReply: (commentId: CommentId, text: string, author?: string) => Reply;
  readonly clearComments: () => void;
  
  // Utilities
  readonly getCommentById: (commentId: CommentId) => Comment | null;
  readonly getReplyById: (replyId: ReplyId) => Reply | null;
  readonly formatTimestamp: (timestamp: string) => string;
}

// ============================================================================
// UTILITY AND CONFIGURATION TYPES
// ============================================================================

/**
 * Comment Sort Order
 * 
 * Available sorting options for comments.
 */
export type CommentSortOrder = 'newest' | 'oldest' | 'popular';

/**
 * Comment Storage Structure
 * 
 * How comments are stored in localStorage.
 */
export type CommentStorage = Record<string, Comment[]>;

/**
 * Comment Validation Result
 * 
 * Result of comment text validation.
 */
export interface CommentValidation {
  readonly isValid: boolean;
  readonly error?: string;
  readonly warnings?: readonly string[];
}

/**
 * Comment Analytics Event
 * 
 * For tracking user interactions with comments.
 */
export interface CommentEvent {
  readonly type: 'comment_added' | 'comment_liked' | 'comment_replied' | 'comment_deleted';
  readonly commentId: CommentId;
  readonly movieId: MovieId;
  readonly timestamp: string;
  readonly userId?: string;
}

// ============================================================================
// ADVANCED TYPE UTILITIES
// ============================================================================

/**
 * Extract comment text content
 */
export type CommentText = Comment['text'];

/**
 * Comment without user interaction data
 */
export type PublicComment = Omit<Comment, 'userHasLiked' | 'userHasDisliked' | 'reportCount'>;

/**
 * Comment creation input
 */
export type CreateCommentInput = Pick<Comment, 'movieId' | 'text' | 'author'>;

/**
 * Comment update input
 */
export type UpdateCommentInput = Partial<Pick<Comment, 'text' | 'isHidden'>>;

/**
 * Comment with replies expanded
 */
export type CommentWithReplies = Comment & {
  readonly expandedReplies: boolean;
};

// ============================================================================
// EXPORT TYPE HELPERS
// ============================================================================

/**
 * Type guard for Comment objects
 */
export function isComment(obj: any): obj is Comment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.likes === 'number' &&
    Array.isArray(obj.replies)
  );
}

/**
 * Type guard for Reply objects
 */
export function isReply(obj: any): obj is Reply {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.commentId === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.timestamp === 'string'
  );
}
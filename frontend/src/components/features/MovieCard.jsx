/**
 * MovieCard Component - Advanced React Component Demonstration
 * 
 * This component showcases numerous React concepts and patterns in a real-world context.
 */

import React, { useState, useCallback, useMemo } from 'react';
import Button from '../ui/Button.jsx';
import useLocalStorage from '../../hooks/useLocalStorage.js';
import { clsx } from 'clsx';

function MovieCard({
  movie,
  onMovieClick,
  onFavoriteChange,
  onRatingChange,
  showDetails = false,
  size = 'medium',
  interactive = true,
  showRating = true,
  showFavorite = true,
  className = '',
  lazyLoad = true,
  enableAnimations = true,
  ...rest
}) {
  // Validate required movie prop
  if (!movie || typeof movie !== 'object') {
    console.error('MovieCard: movie prop is required and must be an object');
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error: Invalid movie data</p>
      </div>
    );
  }

  // Extract movie properties with safe defaults
  const {
    id,
    title = 'Unknown Title',
    overview = 'No description available',
    posterUrl,
    posterUrlSmall,
    releaseYear,
    voteAverage = 0,
    voteCount = 0,
    ratingStars = 0,
    genres = [],
    isPopular = false,
    isHighRated = false,
  } = movie;

  // Local state management
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userRating, setUserRating] = useLocalStorage(`rating_${id}`, 0);
  const [isFavorite, setIsFavorite] = useLocalStorage(`favorite_${id}`, false);
  const [isPressed, setIsPressed] = useState(false);

  // Computed values
  const imageUrl = useMemo(() => {
    if (!posterUrl && !posterUrlSmall) return null;
    
    switch (size) {
      case 'small':
        return posterUrlSmall || posterUrl;
      case 'large':
        return posterUrl;
      default:
        return posterUrlSmall || posterUrl;
    }
  }, [posterUrl, posterUrlSmall, size]);

  const sizeClasses = useMemo(() => {
    const sizes = {
      small: 'w-32',
      medium: 'w-48', 
      large: 'w-64',
    };
    return sizes[size] || sizes.medium;
  }, [size]);

  const cardClasses = useMemo(() => {
    return clsx(
      'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden',
      'transition-all duration-300 ease-out',
      sizeClasses,
      interactive && [
        'cursor-pointer',
        'hover:shadow-lg hover:border-gray-300',
        enableAnimations && 'hover:scale-105 hover:-translate-y-1',
      ],
      isPressed && interactive && 'scale-95 shadow-sm',
      isFavorite && 'ring-2 ring-red-200 border-red-300',
      isHighRated && 'ring-1 ring-yellow-200',
      className
    );
  }, [
    sizeClasses, 
    interactive, 
    enableAnimations, 
    isPressed, 
    isFavorite, 
    isHighRated, 
    className
  ]);

  // Event handlers
  const handleCardClick = useCallback(() => {
    if (!interactive || !onMovieClick) return;
    console.log(`🎬 Movie card clicked: ${title}`);
    onMovieClick(movie);
  }, [interactive, onMovieClick, movie, title]);

  const handleFavoriteClick = useCallback((event) => {
    event.stopPropagation();
    if (!interactive) return;

    console.log(`❤️ Toggling favorite for: ${title}`);
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    if (onFavoriteChange) {
      onFavoriteChange(movie, newFavoriteStatus);
    }
  }, [interactive, isFavorite, setIsFavorite, onFavoriteChange, movie, title]);

  const handleRatingChange = useCallback((newRating, event) => {
    event.stopPropagation();
    if (!interactive) return;

    console.log(`⭐ Rating changed for ${title}: ${newRating}/5`);
    setUserRating(newRating);

    if (onRatingChange) {
      onRatingChange(movie, newRating);
    }
  }, [interactive, setUserRating, onRatingChange, movie, title]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
    console.log(`🖼️ Image loaded successfully for: ${title}`);
  }, [title]);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
    setImageError(true);
    console.log(`❌ Image failed to load for: ${title}`);
  }, [title]);

  const handleMouseEnter = useCallback(() => {
    if (!enableAnimations) return;
    setIsHovered(true);
  }, [enableAnimations]);

  const handleMouseLeave = useCallback(() => {
    if (!enableAnimations) return;
    setIsHovered(false);
  }, [enableAnimations]);

  const handleMouseDown = useCallback(() => {
    if (!interactive) return;
    setIsPressed(true);
  }, [interactive]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (!interactive) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }

    if (event.key === 'Escape') {
      // Handle escape key
    }
  }, [interactive, handleCardClick]);

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    const stars = Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      
      return (
        <button
          key={starValue}
          type="button"
          className={clsx(
            'text-lg transition-colors duration-150',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            isFilled ? 'text-yellow-400' : 'text-gray-300',
            !readonly && 'hover:text-yellow-300'
          )}
          onClick={readonly ? undefined : (e) => onRatingChange(starValue, e)}
          disabled={readonly}
          aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
        >
          {isFilled ? '★' : '☆'}
        </button>
      );
    });
    
    return (
      <div className="flex items-center space-x-1" role="radiogroup" aria-label="Movie rating">
        {stars}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {rating}/5
          </span>
        )}
      </div>
    );
  };

  // Loading Skeleton Component
  const ImageSkeleton = () => (
    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-400">
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );

  // Badge Component
  const Badge = ({ children, variant = 'default', className = '' }) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}>
        {children}
      </span>
    );
  };

  // Component render
  return (
    <article
      className={cardClasses}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      role={interactive ? "button" : "article"}
      tabIndex={interactive ? 0 : -1}
      aria-label={`${title}${releaseYear ? ` (${releaseYear})` : ''}`}
      aria-describedby={`movie-${id}-description`}
      {...rest}
    >
      {/* Movie Poster Section */}
      <div className="relative aspect-w-2 aspect-h-3 bg-gray-200">
        {/* Main poster image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} poster`}
            className={clsx(
              'w-full h-full object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={lazyLoad ? 'lazy' : 'eager'}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-4xl">🎬</span>
          </div>
        )}
        
        {/* Image loading skeleton */}
        {!imageLoaded && !imageError && imageUrl && (
          <div className="absolute inset-0">
            <ImageSkeleton />
          </div>
        )}
        
        {/* Favorite Button Overlay */}
        {showFavorite && interactive && (
          <button
            className={clsx(
              'absolute top-2 right-2 w-8 h-8 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-200',
              'bg-white/80 backdrop-blur-sm',
              'hover:bg-white hover:scale-110',
              'focus:outline-none focus:ring-2 focus:ring-red-500',
              isFavorite ? 'text-red-500' : 'text-gray-400',
            )}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Rating Badge Overlay */}
        {isHighRated && (
          <div className="absolute top-2 left-2">
            <Badge variant="warning" className="shadow-sm">
              ⭐ {voteAverage.toFixed(1)}
            </Badge>
          </div>
        )}
        
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="info" className="shadow-sm">
              🔥 Popular
            </Badge>
          </div>
        )}
        
        {/* Hover Overlay */}
        {isHovered && interactive && (
          <div className={clsx(
            'absolute inset-0 bg-black/20',
            'flex items-center justify-center',
            'transition-opacity duration-200',
            enableAnimations ? 'opacity-100' : 'opacity-0'
          )}>
            <Button variant="primary" size="small">
              View Details
            </Button>
          </div>
        )}
      </div>
      
      {/* Movie Information Section */}
      <div className="p-4">
        {/* Title and Year */}
        <div className="mb-2">
          <h3 className={clsx(
            'font-semibold text-gray-900 leading-tight',
            size === 'small' ? 'text-sm' : 'text-base',
            'line-clamp-2'
          )}>
            {title}
          </h3>
          
          {releaseYear && (
            <p className="text-sm text-gray-500 mt-1">
              {releaseYear}
            </p>
          )}
        </div>
        
        {/* Movie Overview */}
        {(showDetails || size === 'large') && overview && (
          <p 
            id={`movie-${id}-description`}
            className={clsx(
              'text-sm text-gray-600 mb-3',
              showDetails ? 'line-clamp-4' : 'line-clamp-2'
            )}
          >
            {overview}
          </p>
        )}
        
        {/* Genres */}
        {genres.length > 0 && (showDetails || size === 'large') && (
          <div className="flex flex-wrap gap-1 mb-3">
            {genres.slice(0, 3).map((genre) => (
              <Badge key={genre.id || genre.name} variant="default">
                {genre.name}
              </Badge>
            ))}
            {genres.length > 3 && (
              <Badge variant="default">
                +{genres.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Rating Section */}
        {showRating && (
          <div className="space-y-2">
            {/* TMDB Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">TMDB:</span>
                <StarRating rating={ratingStars} readonly={true} />
                {voteCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({voteCount.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
            
            {/* User Rating */}
            {interactive && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Your rating:</span>
                <StarRating 
                  rating={userRating} 
                  onRatingChange={handleRatingChange}
                  readonly={false}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        {interactive && showDetails && (
          <div className="flex space-x-2 mt-4">
            <Button 
              size="small" 
              variant="primary"
              onClick={handleCardClick}
              className="flex-1"
            >
              Details
            </Button>
            
            <Button 
              size="small" 
              variant={isFavorite ? "danger" : "secondary"}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '💔' : '❤️'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Loading State Overlay */}
      {imageUrl && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </article>
  );
}

// Memoized export for performance
const MemoizedMovieCard = React.memo(MovieCard);
MemoizedMovieCard.displayName = 'MovieCard';

export default MemoizedMovieCard;
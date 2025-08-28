'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxStars = 5, 
  size = 'md', 
  showValue = false,
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isPartial = starValue === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <div key={index} className="relative">
              <Star
                className={`${sizeClasses[size]} text-gray-200 fill-current`}
              />
              {(isFilled || isPartial) && (
                <Star
                  className={`${sizeClasses[size]} text-yellow-400 fill-current absolute top-0 left-0`}
                  style={{
                    clipPath: isPartial 
                      ? `inset(0 ${100 - (rating % 1) * 100}% 0 0)` 
                      : 'none'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-600 ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

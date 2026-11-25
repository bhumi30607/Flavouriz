import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  rating = 0,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showNumber = false,
  reviewsCount = null,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const starSize = starSizes[size] || starSizes.md;
  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = currentRating >= starValue;
          const isHalf = !isFilled && currentRating >= starValue - 0.5;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : 'cursor-default'
              } p-0.5 focus:outline-none`}
              aria-label={interactive ? `Rate ${starValue} stars` : `${currentRating} stars`}
            >
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'text-amber-500 fill-amber-500'
                    : isHalf
                    ? 'text-amber-500 fill-amber-500/50'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-xs font-bold text-charcoal ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {reviewsCount !== null && (
        <span className="text-xs text-gray-500">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}

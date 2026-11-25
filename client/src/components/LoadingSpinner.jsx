import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function LoadingSpinner({ message = 'Cooking up fresh recipes...', size = 'md' }) {
  const spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute w-14 h-14 bg-terracotta/20 rounded-full animate-ping" />
        {/* Spinning Ring */}
        <div
          className={`${spinnerSizes[size] || spinnerSizes.md} rounded-full border-4 border-cream border-t-terracotta border-r-forest-green animate-spin`}
        />
        {/* Center Food Icon */}
        <UtensilsCrossed className="w-5 h-5 text-forest-green absolute animate-pulse" />
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-forest-green tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-forest-green/10 shadow-soft space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-cream flex items-center justify-center mx-auto text-forest-green shadow-inner">
          <UtensilsCrossed className="w-10 h-10 text-terracotta" />
        </div>

        <div>
          <span className="text-4xl font-serif font-black text-terracotta block mb-1">
            404
          </span>
          <h1 className="font-serif text-2xl font-bold text-forest-green mb-2">
            Recipe Not in the Kitchen!
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
            The page or recipe you are looking for has been eaten, moved, or never existed in our cookbook.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-forest-green/20 text-forest-green hover:bg-cream text-xs font-bold transition-all"
          >
            <Compass className="w-4 h-4 text-terracotta" />
            <span>Explore Recipes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

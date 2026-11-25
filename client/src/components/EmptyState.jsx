import React from 'react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No recipes found',
  message = 'We could not find any recipes matching your current criteria.',
  actionText = 'Explore All Recipes',
  actionLink = '/explore',
  onAction,
  icon: Icon = UtensilsCrossed,
}) {
  return (
    <div className="bg-white rounded-3xl border border-forest-green/10 p-12 text-center max-w-lg mx-auto my-12 shadow-soft">
      <div className="w-16 h-16 rounded-3xl bg-cream flex items-center justify-center mx-auto mb-4 text-forest-green shadow-inner">
        <Icon className="w-8 h-8 text-terracotta" />
      </div>
      <h3 className="font-serif text-2xl font-bold text-forest-green mb-2">{title}</h3>
      <p className="text-sm text-charcoal-light mb-6 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>

      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-sm font-semibold shadow-soft transition-all"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4 text-terracotta" />
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-sm font-semibold shadow-soft transition-all"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4 text-terracotta" />
        </Link>
      ) : null}
    </div>
  );
}

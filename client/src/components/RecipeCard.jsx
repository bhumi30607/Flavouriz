import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Users, Bookmark, ChefHat } from 'lucide-react';
import RatingStars from './RatingStars.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { favoriteApi } from '../services/api.js';

export default function RecipeCard({
  recipe,
  onFavoriteToggle,
  isFavoriteInitial = false,
}) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(
    recipe.isFavorited !== undefined ? recipe.isFavorited : isFavoriteInitial
  );
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  const difficultyColors = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please log in to save recipes to your cookbook.', 'info');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        await favoriteApi.removeFavorite(recipe.id);
        setIsFavorited(false);
        showToast('Removed from your cookbook.');
      } else {
        await favoriteApi.addFavorite(recipe.id);
        setIsFavorited(true);
        showToast('Saved to your cookbook!');
      }

      if (onFavoriteToggle) {
        onFavoriteToggle(recipe.id, !isFavorited);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update cookbook.', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-[#263D2C]/10 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Recipe Image & Overlay Badges */}
      <Link to={`/recipes/${recipe.id}`} className="relative aspect-[4/3] overflow-hidden bg-cream block">
        <img
          src={recipe.imageUrl || fallbackImage}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-forest-green shadow-sm backdrop-blur-sm">
            {recipe.category || 'General'}
          </span>
          {recipe.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-terracotta text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Favorite Bookmark Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 ${
            isFavorited
              ? 'bg-terracotta text-white scale-110'
              : 'bg-white/90 text-forest-green hover:bg-white hover:text-terracotta'
          }`}
          aria-label={isFavorited ? 'Remove from cookbook' : 'Save to cookbook'}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize backdrop-blur-sm ${
              difficultyColors[recipe.difficulty?.toLowerCase()] ||
              'bg-white/90 text-charcoal border-gray-200'
            }`}
          >
            {recipe.difficulty || 'Easy'}
          </span>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Cuisine & Ratings Row */}
          <div className="flex items-center justify-between text-xs text-charcoal-light mb-2">
            <span className="font-semibold text-terracotta uppercase tracking-wider text-[11px]">
              {recipe.cuisine || 'Global'} Cuisine
            </span>
            <RatingStars
              rating={recipe.averageRating || 0}
              showNumber={true}
              reviewsCount={recipe.reviewsCount || 0}
            />
          </div>

          {/* Title */}
          <Link to={`/recipes/${recipe.id}`} className="block group-hover:text-terracotta transition-colors">
            <h3 className="font-serif text-lg font-bold text-forest-green leading-snug line-clamp-2 mb-2">
              {recipe.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-charcoal-light line-clamp-2 leading-relaxed mb-4">
            {recipe.description}
          </p>
        </div>

        {/* Meta Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Total preparation & cooking time">
              <Clock className="w-3.5 h-3.5 text-forest-green" />
              <span>{totalTime}m</span>
            </span>
            <span className="flex items-center gap-1.5" title="Servings">
              <Users className="w-3.5 h-3.5 text-forest-green" />
              <span>{recipe.servings || 4} serv</span>
            </span>
          </div>

          {/* Author Attribution */}
          <div className="flex items-center gap-1.5 text-forest-green font-medium">
            <ChefHat className="w-3.5 h-3.5 text-terracotta" />
            <span className="max-w-[90px] truncate">{recipe.authorName || 'Chef'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

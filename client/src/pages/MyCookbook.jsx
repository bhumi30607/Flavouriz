import React, { useState, useEffect } from 'react';
import { favoriteApi } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { Bookmark, Sparkles } from 'lucide-react';

export default function MyCookbook() {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCookbook = async () => {
    try {
      setLoading(true);
      const res = await favoriteApi.getFavorites();
      setFavorites(res.data || []);
    } catch (err) {
      console.error('Error fetching cookbook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCookbook();
  }, []);

  const handleFavoriteToggle = (recipeId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
    }
  };

  const filteredFavorites = favorites.filter((recipe) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(term) ||
      (recipe.cuisine && recipe.cuisine.toLowerCase().includes(term)) ||
      (recipe.category && recipe.category.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return <LoadingSpinner message="Opening your personal cookbook..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-forest-green/10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
            Personal Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-terracotta fill-terracotta" />
            <span>My Cookbook</span>
          </h1>
          <p className="text-sm text-charcoal-light mt-1">
            {favorites.length} saved recipes ready for your next culinary adventure.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="w-full md:w-80">
            <SearchBar
              initialValue={searchQuery}
              placeholder="Search in your cookbook..."
              onSearch={(q) => setSearchQuery(q)}
            />
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFavorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavoriteInitial={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          No saved recipes matched "{searchQuery}".
        </div>
      ) : (
        <EmptyState
          title="Your cookbook is currently empty"
          message="Browse recipes on Flavouriz and click the bookmark icon to save your favorite dishes here."
          actionText="Discover Delicious Recipes"
          actionLink="/explore"
          icon={Bookmark}
        />
      )}

    </div>
  );
}

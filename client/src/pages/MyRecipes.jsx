import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import {
  BookOpen,
  PlusCircle,
  Star,
  Bookmark,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function MyRecipes() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeToDelete, setSelectedRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const res = await recipeApi.getMyRecipes();
      setRecipes(res.data || []);
    } catch (err) {
      console.error('Error fetching user recipes:', err);
      showToast(err.message || 'Failed to load your recipes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const handleConfirmDelete = async () => {
    if (!selectedRecipeToDelete) return;
    try {
      setDeleting(true);
      await recipeApi.deleteRecipe(selectedRecipeToDelete.id);
      showToast('Recipe deleted successfully.');
      setRecipes(recipes.filter((r) => r.id !== selectedRecipeToDelete.id));
      setSelectedRecipeToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete recipe.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Compute summary stats
  const totalRecipes = recipes.length;
  const totalFavorites = recipes.reduce((acc, curr) => acc + (curr.favoritesCount || 0), 0);
  const avgRating =
    totalRecipes > 0
      ? (
          recipes.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / totalRecipes
        ).toFixed(1)
      : '0.0';

  if (loading) {
    return <LoadingSpinner message="Retrieving your published recipes..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-forest-green/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
            Chef Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green">
            My Published Recipes
          </h1>
          <p className="text-sm text-charcoal-light mt-1">
            Manage your kitchen creations, edit instructions, and see community ratings.
          </p>
        </div>

        <Link
          to="/recipes/create"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta hover:bg-terracotta-dark text-white font-bold text-xs shadow-soft transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Recipe</span>
        </Link>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest-green shadow-inner">
            <BookOpen className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Recipes Shared</span>
            <span className="font-serif text-2xl font-bold text-forest-green">{totalRecipes}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest-green shadow-inner">
            <Bookmark className="w-6 h-6 text-forest-green" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Total Saves</span>
            <span className="font-serif text-2xl font-bold text-forest-green">{totalFavorites}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-forest-green shadow-inner">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Average Rating</span>
            <span className="font-serif text-2xl font-bold text-forest-green">{avgRating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* RECIPES LIST */}
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="relative flex flex-col h-full group">
              <RecipeCard recipe={recipe} />

              {/* Action Toolbar on Bottom */}
              <div className="mt-3 flex items-center justify-between px-2">
                <Link
                  to={`/recipes/${recipe.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-forest-green/20 text-xs font-semibold text-forest-green hover:bg-forest-green hover:text-white transition-all shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5 text-terracotta" />
                  <span>Edit Recipe</span>
                </Link>

                <button
                  onClick={() => setSelectedRecipeToDelete(recipe)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recipes published yet"
          message="You have not published any recipes yet. Share your secret family dishes with the Flavouriz cooking community!"
          actionText="Publish Your First Recipe"
          actionLink="/recipes/create"
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(selectedRecipeToDelete)}
        onClose={() => setSelectedRecipeToDelete(null)}
        title="Delete Recipe"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold">
              Delete "{selectedRecipeToDelete?.title}"?
            </p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            This will permanently remove this recipe and all associated reviews and ratings from the platform.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setSelectedRecipeToDelete(null)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-charcoal hover:bg-cream"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recipeApi } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const CUISINES = ['All', 'Italian', 'Mexican', 'Indian', 'Mediterranean', 'Asian', 'American', 'French'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'quickest', label: 'Fastest to Cook' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialCuisine = searchParams.get('cuisine') || 'All';
  const initialDifficulty = searchParams.get('difficulty') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL params
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    cuisine: initialCuisine,
    difficulty: initialDifficulty,
    sort: initialSort,
    page: initialPage,
  });

  const updateParam = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: key === 'page' ? value : 1 };
    setFilters(newFilters);

    // Sync to URL
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category && newFilters.category !== 'All') params.set('category', newFilters.category);
    if (newFilters.cuisine && newFilters.cuisine !== 'All') params.set('cuisine', newFilters.cuisine);
    if (newFilters.difficulty && newFilters.difficulty !== 'All') params.set('difficulty', newFilters.difficulty);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page > 1) params.set('page', newFilters.page);

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      cuisine: 'All',
      difficulty: 'All',
      sort: 'newest',
      page: 1,
    });
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          limit: 9,
          page: filters.page,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;
        if (filters.category !== 'All') params.category = filters.category;
        if (filters.cuisine !== 'All') params.cuisine = filters.cuisine;
        if (filters.difficulty !== 'All') params.difficulty = filters.difficulty;

        const response = await recipeApi.getRecipes(params);
        setRecipes(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err.message || 'Failed to fetch recipes.');
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [filters]);

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.cuisine !== 'All' ||
    filters.difficulty !== 'All' ||
    filters.sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
          Taste the World
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green">
          Explore Recipes
        </h1>
        <p className="text-sm text-charcoal-light mt-1">
          Browse through {pagination.total} handcrafted recipes across world cuisines.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft mb-8 space-y-6">
        
        {/* Search Input Row */}
        <div>
          <SearchBar
            initialValue={filters.search}
            placeholder="Search by recipe title, chef, ingredients (e.g. avocado, pasta, chicken)..."
            onSearch={(query) => updateParam('search', query)}
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-forest-green mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine Dropdown */}
          <div>
            <label className="block text-xs font-bold text-forest-green mb-1.5 uppercase tracking-wider">
              Cuisine
            </label>
            <select
              value={filters.cuisine}
              onChange={(e) => updateParam('cuisine', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            >
              {CUISINES.map((cui) => (
                <option key={cui} value={cui}>
                  {cui}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-xs font-bold text-forest-green mb-1.5 uppercase tracking-wider">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => updateParam('difficulty', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-xs font-bold text-forest-green mb-1.5 uppercase tracking-wider">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-medium">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-medium">
                  {filters.category}
                </span>
              )}
              {filters.cuisine !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-medium">
                  {filters.cuisine}
                </span>
              )}
              {filters.difficulty !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-medium">
                  {filters.difficulty}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* Recipes Result Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering authentic recipes..." />
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination Navigation */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => updateParam('page', filters.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2.5 rounded-full border border-forest-green/20 text-forest-green hover:bg-forest-green hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs font-bold text-forest-green">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  const isCurrent = pNum === pagination.page;

                  return (
                    <button
                      key={pNum}
                      onClick={() => updateParam('page', pNum)}
                      className={`w-9 h-9 rounded-full transition-all ${
                        isCurrent
                          ? 'bg-forest-green text-cream shadow-sm scale-105'
                          : 'bg-white hover:bg-cream text-charcoal border border-gray-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateParam('page', filters.page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2.5 rounded-full border border-forest-green/20 text-forest-green hover:bg-forest-green hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No recipes matched your search"
          message="Try adjusting your keywords, cuisine selections, or difficulty filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      )}

    </div>
  );
}

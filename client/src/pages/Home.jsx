import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi } from '../services/api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import {
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  ChefHat,
  BookmarkCheck,
  Award,
  BookOpen,
} from 'lucide-react';

export default function Home() {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [latestRecipes, setLatestRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryRecipes, setCategoryRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch featured, popular, and latest concurrently
      const [featuredRes, popularRes, latestRes] = await Promise.all([
        recipeApi.getRecipes({ featured: 'true', limit: 3 }),
        recipeApi.getRecipes({ sort: 'highest_rated', limit: 4 }),
        recipeApi.getRecipes({ sort: 'newest', limit: 6 }),
      ]);

      setFeaturedRecipes(featuredRes.data || []);
      setPopularRecipes(popularRes.data || []);
      setLatestRecipes(latestRes.data || []);
    } catch (err) {
      console.error('Failed to load home page recipes:', err);
      setError(err.message || 'Unable to connect to Flavouriz server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // When selected category changes, load recipes for that category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setCategoryRecipes([]);
      return;
    }

    async function loadCategoryRecipes() {
      try {
        setCategoryLoading(true);
        const res = await recipeApi.getRecipes({ category: selectedCategory, limit: 4 });
        setCategoryRecipes(res.data || []);
      } catch (err) {
        console.error('Failed to load category recipes:', err);
      } finally {
        setCategoryLoading(false);
      }
    }

    loadCategoryRecipes();
  }, [selectedCategory]);

  const handleHeroSearch = (query) => {
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Bringing Flavouriz kitchen to life..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchHomeData} />;
  }

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Soft decorative background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-terracotta/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-forest-green/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-green/10 text-forest-green text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Discover & Share Homemade Flavours</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-forest-green tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
            Where Food Lovers Gather, Cook, and Share.
          </h1>

          <p className="text-base sm:text-lg text-charcoal-light max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Explore authentic recipes curated by culinary enthusiasts across the globe. From 15-minute weeknight dinners to artisan pastries.
          </p>

          {/* Search Bar in Hero */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              placeholder="Search dishes like Carbonara, Tikka Masala, Tacos..."
              onSearch={handleHeroSearch}
            />
          </div>

          {/* Quick Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-gray-500 mr-1">Trending:</span>
            {['Italian', 'Mexican', 'Indian', 'Breakfast', 'Desserts', 'Easy'].map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  navigate(
                    ['Breakfast', 'Desserts'].includes(tag)
                      ? `/explore?category=${tag}`
                      : tag === 'Easy'
                      ? `/explore?difficulty=Easy`
                      : `/explore?cuisine=${tag}`
                  )
                }
                className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-forest-green border border-forest-green/10 text-xs font-medium shadow-sm transition-all hover:border-terracotta"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DISHES (Chef's Pick) */}
      {featuredRecipes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta mb-1">
                <Award className="w-4 h-4" />
                <span>Handpicked by our Chefs</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-forest-green">
                Featured Culinary Highlights
              </h2>
            </div>
            <Link
              to="/explore?featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-green hover:text-terracotta transition-colors"
            >
              <span>View all featured</span>
              <ArrowRight className="w-4 h-4 text-terracotta" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* BROWSE BY CATEGORY INTERACTIVE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-forest-green/10 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
                Recipe Catalog
              </span>
              <h2 className="font-serif text-3xl font-bold text-forest-green">
                Explore by Meal Category
              </h2>
            </div>
            <CategoryFilter
              activeCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </div>

          {selectedCategory !== 'All' ? (
            categoryLoading ? (
              <LoadingSpinner message={`Gathering ${selectedCategory} recipes...`} size="sm" />
            ) : categoryRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                No recipes found under {selectedCategory} yet. Be the first to share one!
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRecipes.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to={selectedCategory === 'All' ? '/explore' : `/explore?category=${selectedCategory}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-forest-green text-forest-green hover:bg-forest-green hover:text-cream font-semibold text-xs transition-all"
            >
              <span>Explore all {selectedCategory === 'All' ? 'Dishes' : selectedCategory}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
              Top Rated by the Community
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest-green">
              Beloved Classics
            </h2>
          </div>
          <Link
            to="/explore?sort=highest_rated"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-green hover:text-terracotta transition-colors"
          >
            <span>See more</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* LATEST RECIPES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
              Fresh From the Oven
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest-green">
              Latest Additions
            </h2>
          </div>
          <Link
            to="/explore?sort=newest"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-green hover:text-terracotta transition-colors"
          >
            <span>View all latest</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* COMMUNITY CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-forest-green text-cream p-8 sm:p-14 overflow-hidden shadow-hover">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-terracotta/10 rounded-l-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream/10 text-terracotta-light text-xs font-bold uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              <span>Share Your Secret Recipes</span>
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Got a Family Recipe or Signature Dish?
            </h3>
            <p className="text-sm sm:text-base text-cream/80 leading-relaxed font-normal">
              Publish your cooking creations with step-by-step instructions, photograph uploads, and ingredient checklists. Build your personal digital cookbook and inspire fellow home cooks.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/recipes/create"
                className="px-6 py-3 rounded-full bg-terracotta hover:bg-terracotta-dark text-white font-semibold text-sm shadow-soft transition-all"
              >
                Publish a Recipe
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-cream font-semibold text-sm transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

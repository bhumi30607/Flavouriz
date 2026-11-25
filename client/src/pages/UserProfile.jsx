import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import {
  User,
  ChefHat,
  Calendar,
  Shield,
  Edit,
  BookOpen,
} from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const res = await userApi.getProfile(id);
        setProfile(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading chef profile..." />;
  }

  if (error || !profile) {
    return <ErrorMessage message={error || 'User profile not found.'} />;
  }

  const isOwnProfile = currentUser && String(currentUser.id) === String(profile.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-forest-green/10 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
              alt={profile.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-card bg-cream"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef';
              }}
            />
            {profile.role === 'admin' && (
              <span
                className="absolute bottom-1 right-1 p-2 rounded-full bg-forest-green text-cream shadow-md"
                title="Platform Administrator"
              >
                <Shield className="w-4 h-4 text-terracotta" />
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-green/10 text-forest-green">
                    {profile.role === 'admin' ? 'Executive Chef / Admin' : 'Community Chef'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-terracotta mt-0.5">
                  @{profile.username}
                </p>
              </div>

              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-forest-green/20 text-xs font-bold text-forest-green hover:bg-forest-green hover:text-white transition-all shadow-sm self-center sm:self-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-charcoal-light max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-3 text-xs text-gray-500 border-t border-gray-100">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-forest-green" />
                <span><strong>{profile.totalRecipes || 0}</strong> recipes published</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-forest-green" />
                <span>
                  Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Published Recipes by this user */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-forest-green/10">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest-green">
              Recipes by {profile.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Explore this chef's culinary portfolio
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cream text-xs font-bold text-forest-green">
            {profile.recipes?.length || 0} total
          </span>
        </div>

        {profile.recipes && profile.recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {profile.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-forest-green/10 p-8 shadow-soft">
            <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-forest-green mb-1">
              No recipes published yet
            </h3>
            <p className="text-xs text-gray-400">
              {profile.name} hasn't published any recipes yet. Check back soon!
            </p>
          </div>
        )}
      </section>

    </div>
  );
}

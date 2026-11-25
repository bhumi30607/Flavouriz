import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  recipeApi,
  favoriteApi,
  reviewApi,
  commentApi,
  reportApi,
} from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import RatingStars from '../components/RatingStars.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Modal from '../components/Modal.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import {
  Clock,
  Users,
  Bookmark,
  ChefHat,
  Calendar,
  Check,
  Share2,
  Flag,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Send,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export default function RecipeDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive ingredients check list
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Favorite toggle state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Review Form state
  const [myRating, setMyRating] = useState(5);
  const [myReviewComment, setMyReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Comment Form state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Load Recipe Data
  const loadRecipeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recipeRes, reviewsRes, commentsRes] = await Promise.all([
        recipeApi.getRecipeById(id),
        reviewApi.getReviewsForRecipe(id),
        commentApi.getCommentsForRecipe(id),
      ]);

      const recipeData = recipeRes.data;
      setRecipe(recipeData);
      setIsFavorited(recipeData.isFavorited || false);
      setReviews(reviewsRes.data || []);
      setComments(commentsRes.data || []);

      // If user already reviewed, prefill review form for editing
      if (recipeData.userReview) {
        setMyRating(recipeData.userReview.rating || 5);
        setMyReviewComment(recipeData.userReview.comment || '');
        setEditingReviewId(recipeData.userReview.id);
      }
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError(err.message || 'Recipe could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Toggle ingredient checklist
  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save recipes to your cookbook.', 'info');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        await favoriteApi.removeFavorite(id);
        setIsFavorited(false);
        showToast('Removed from cookbook.');
      } else {
        await favoriteApi.addFavorite(id);
        setIsFavorited(true);
        showToast('Saved to your cookbook!');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update favorite status.', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle Share link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Recipe link copied to clipboard!');
    }
  };

  // Handle Review submission (create or update)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to rate and review recipes.', 'info');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      if (editingReviewId) {
        await reviewApi.updateReview(editingReviewId, {
          rating: myRating,
          comment: myReviewComment,
        });
        showToast('Review updated successfully!');
      } else {
        const res = await reviewApi.addReview(id, {
          rating: myRating,
          comment: myReviewComment,
        });
        setEditingReviewId(res.data.review.id);
        showToast('Thank you for rating this recipe!');
      }

      // Reload reviews and recipe rating stats
      const [revs, rec] = await Promise.all([
        reviewApi.getReviewsForRecipe(id),
        recipeApi.getRecipeById(id),
      ]);
      setReviews(revs.data || []);
      setRecipe((prev) => ({
        ...prev,
        averageRating: rec.data.averageRating,
        reviewsCount: rec.data.reviewsCount,
      }));
    } catch (err) {
      showToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewApi.deleteReview(reviewId);
      showToast('Review deleted.');
      setEditingReviewId(null);
      setMyReviewComment('');
      setMyRating(5);

      const [revs, rec] = await Promise.all([
        reviewApi.getReviewsForRecipe(id),
        recipeApi.getRecipeById(id),
      ]);
      setReviews(revs.data || []);
      setRecipe((prev) => ({
        ...prev,
        averageRating: rec.data.averageRating,
        reviewsCount: rec.data.reviewsCount,
      }));
    } catch (err) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  // Handle Post Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to join the discussion.', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await commentApi.addComment(id, { content: newComment.trim() });
      setNewComment('');
      showToast('Comment posted!');
      const res = await commentApi.getCommentsForRecipe(id);
      setComments(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to post comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle Update Comment
  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      await commentApi.updateComment(commentId, { content: editingCommentText.trim() });
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast('Comment updated.');
      const res = await commentApi.getCommentsForRecipe(id);
      setComments(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to update comment.', 'error');
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      showToast('Comment deleted.');
      const res = await commentApi.getCommentsForRecipe(id);
      setComments(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to delete comment.', 'error');
    }
  };

  // Handle Delete Entire Recipe (Owner / Admin)
  const handleConfirmDeleteRecipe = async () => {
    try {
      await recipeApi.deleteRecipe(id);
      showToast('Recipe deleted successfully.');
      navigate('/my-recipes');
    } catch (err) {
      showToast(err.message || 'Failed to delete recipe.', 'error');
    }
  };

  // Handle Report Recipe
  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to report content.', 'info');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReport(true);
      await reportApi.createReport({
        targetType: 'recipe',
        targetId: id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportModalOpen(false);
      setReportDetails('');
      showToast('Report submitted. Our moderation team will investigate.');
    } catch (err) {
      showToast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching recipe card, ingredients, and instructions..." />;
  }

  if (error || !recipe) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorMessage
          title="Recipe Not Found"
          message={error || 'This recipe may have been removed or is unavailable.'}
          onRetry={loadRecipeData}
        />
        <div className="text-center mt-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-green hover:text-terracotta"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to recipe catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && String(recipe.authorId) === String(user.id);
  const canManage = isOwner || isAdmin;
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-forest-green hover:text-terracotta uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Recipes</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Link
                to={`/recipes/${id}/edit`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-forest-green/20 text-xs font-semibold text-forest-green hover:bg-forest-green hover:text-white transition-all shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-forest-green/20 text-forest-green hover:bg-cream transition-colors"
            title="Share recipe link"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 rounded-full border border-forest-green/20 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
            title="Report recipe"
            aria-label="Report"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RECIPE HERO HEADER */}
      <div className="space-y-4">
        {/* Category & Cuisine Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta text-white">
            {recipe.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-green text-cream">
            {recipe.cuisine} Cuisine
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize border border-forest-green/20 text-forest-green bg-white">
            {recipe.difficulty}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-green leading-tight">
          {recipe.title}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-charcoal-light leading-relaxed">
          {recipe.description}
        </p>

        {/* Author & Rating Header Row */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-forest-green/10 gap-4">
          {/* Author attribution */}
          <Link
            to={`/profile/${recipe.author?.id}`}
            className="flex items-center gap-3 group"
          >
            <img
              src={recipe.author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
              alt={recipe.author?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-soft group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef';
              }}
            />
            <div>
              <p className="text-xs font-bold text-forest-green group-hover:text-terracotta transition-colors">
                {recipe.author?.name}
              </p>
              <p className="text-[11px] text-gray-500">@{recipe.author?.username}</p>
            </div>
          </Link>

          {/* Ratings & Bookmark Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <RatingStars
                rating={recipe.averageRating || 0}
                size="md"
                showNumber={true}
                reviewsCount={recipe.reviewsCount || 0}
              />
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs transition-all shadow-sm ${
                isFavorited
                  ? 'bg-terracotta text-white'
                  : 'bg-white text-forest-green hover:bg-forest-green hover:text-white border border-forest-green/20'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'In Cookbook' : 'Save to Cookbook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LARGE PHOTOGRAPHY HERO */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-cream shadow-card border border-forest-green/10">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';
          }}
        />
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-soft text-center">
          <Clock className="w-5 h-5 text-terracotta mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Prep Time</span>
          <span className="text-base font-bold text-forest-green">{recipe.prepTimeMinutes || 15} mins</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-soft text-center">
          <Clock className="w-5 h-5 text-forest-green mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Cook Time</span>
          <span className="text-base font-bold text-forest-green">{recipe.cookTimeMinutes || 30} mins</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-soft text-center">
          <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Time</span>
          <span className="text-base font-bold text-forest-green">{totalTime} mins</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-soft text-center">
          <Users className="w-5 h-5 text-terracotta mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Servings</span>
          <span className="text-base font-bold text-forest-green">{recipe.servings || 4} portions</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT: Ingredients & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Ingredients with interactive checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-forest-green">Ingredients</h3>
                <p className="text-xs text-gray-400">Click to check off as you prepare</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cream text-forest-green font-bold text-xs">
                {recipe.ingredients?.length || 0} items
              </span>
            </div>

            <ul className="space-y-3">
              {recipe.ingredients?.map((ing, idx) => {
                const isChecked = Boolean(checkedIngredients[idx]);
                const name = typeof ing === 'string' ? ing : ing.name;
                const amount = typeof ing === 'object' ? `${ing.amount || ''} ${ing.unit || ''}`.trim() : '';

                return (
                  <li
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'bg-emerald-50/60 text-gray-400 line-through'
                        : 'bg-cream/40 hover:bg-cream text-charcoal'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-forest-green/30 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="text-sm font-medium flex-grow flex justify-between gap-2">
                      <span>{name}</span>
                      {amount && (
                        <span className={`font-bold shrink-0 ${isChecked ? 'text-gray-400' : 'text-terracotta'}`}>
                          {amount}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Author Card */}
          <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Recipe Created By
            </span>
            <div className="flex items-center gap-4">
              <img
                src={recipe.author?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
                alt={recipe.author?.name}
                className="w-14 h-14 rounded-full object-cover border border-forest-green/20 bg-cream"
              />
              <div>
                <h4 className="font-serif text-lg font-bold text-forest-green">
                  {recipe.author?.name}
                </h4>
                <p className="text-xs text-gray-500">@{recipe.author?.username}</p>
              </div>
            </div>
            {recipe.author?.bio && (
              <p className="text-xs text-charcoal-light leading-relaxed italic bg-cream/50 p-3 rounded-xl">
                "{recipe.author.bio}"
              </p>
            )}
            <Link
              to={`/profile/${recipe.author?.id}`}
              className="block text-center py-2 rounded-full border border-forest-green/20 text-xs font-bold text-forest-green hover:bg-forest-green hover:text-white transition-colors"
            >
              View Chef's Profile
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Instructions Steps */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft">
            <div className="pb-4 border-b border-gray-100 mb-6">
              <h3 className="font-serif text-2xl font-bold text-forest-green">Step-by-Step Instructions</h3>
              <p className="text-xs text-gray-400">Follow along carefully for best results</p>
            </div>

            <div className="space-y-6">
              {recipe.instructions?.map((step, idx) => {
                const stepNum = typeof step === 'object' && step.stepNumber ? step.stepNumber : idx + 1;
                const text = typeof step === 'string' ? step : step.instruction || step.text;

                return (
                  <div key={idx} className="flex gap-4 group">
                    {/* Numbered Pill */}
                    <div className="w-9 h-9 rounded-2xl bg-forest-green text-cream font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-sm group-hover:bg-terracotta transition-colors">
                      {stepNum}
                    </div>
                    {/* Instruction text */}
                    <div className="pt-1.5 flex-grow">
                      <p className="text-sm sm:text-base text-charcoal leading-relaxed">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* RATINGS & REVIEWS SECTION */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-forest-green/10 shadow-soft space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h3 className="font-serif text-3xl font-bold text-forest-green">Community Reviews</h3>
            <p className="text-sm text-charcoal-light mt-1">
              {recipe.reviewsCount || 0} reviews with an average score of {Number(recipe.averageRating || 0).toFixed(1)} / 5.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RatingStars rating={recipe.averageRating || 0} size="lg" showNumber={true} />
          </div>
        </div>

        {/* WRITE / EDIT REVIEW FORM */}
        <form onSubmit={handleSubmitReview} className="bg-cream/40 rounded-2xl p-6 border border-forest-green/10 space-y-4">
          <h4 className="font-serif text-lg font-bold text-forest-green">
            {editingReviewId ? 'Update Your Rating & Review' : 'Rate & Review This Recipe'}
          </h4>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-600">Your Rating:</span>
            <RatingStars
              rating={myRating}
              interactive={true}
              size="lg"
              onChange={(newScore) => setMyRating(newScore)}
            />
            <span className="text-sm font-bold text-terracotta">{myRating} Stars</span>
          </div>

          <textarea
            value={myReviewComment}
            onChange={(e) => setMyReviewComment(e.target.value)}
            rows={3}
            placeholder="Share your cooking tips, ingredient adjustments, or what you loved about this dish..."
            className="w-full p-4 bg-white rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {isAuthenticated ? `Posting as ${user.name}` : 'Login required to submit review'}
            </span>
            <div className="flex items-center gap-2">
              {editingReviewId && (
                <button
                  type="button"
                  onClick={() => handleDeleteReview(editingReviewId)}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                >
                  Delete Review
                </button>
              )}
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-xs font-bold shadow-soft transition-all"
              >
                {submittingReview ? 'Submitting...' : editingReviewId ? 'Save Updates' : 'Post Review'}
              </button>
            </div>
          </div>
        </form>

        {/* REVIEWS LIST */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => {
              const isOwnReview = user && String(rev.userId) === String(user.id);

              return (
                <div key={rev.id} className="p-5 rounded-2xl bg-cream/20 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-9 h-9 rounded-full object-cover bg-white"
                        onError={(e) => {
                          e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef';
                        }}
                      />
                      <div>
                        <p className="text-xs font-bold text-forest-green">{rev.userName}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <RatingStars rating={rev.rating} size="sm" />
                      {(isOwnReview || isAdmin) && (
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed pl-12">
                      {rev.comment}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs">
              No reviews yet. Be the first to cook and review this dish!
            </div>
          )}
        </div>
      </section>

      {/* COMMENTS DISCUSSION THREAD */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-forest-green/10 shadow-soft space-y-6">
        <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-terracotta" />
            <h3 className="font-serif text-2xl font-bold text-forest-green">Kitchen Questions & Comments</h3>
          </div>
          <span className="text-xs font-bold text-gray-400">{comments.length} comments</span>
        </div>

        {/* Comment input form */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              isAuthenticated
                ? 'Ask a question about ingredients, cooking time, or technique...'
                : 'Please log in to join the conversation...'
            }
            disabled={!isAuthenticated}
            className="flex-grow px-4 py-3 bg-cream/40 rounded-2xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <button
            type="submit"
            disabled={submittingComment || !isAuthenticated || !newComment.trim()}
            className="px-5 py-3 rounded-2xl bg-forest-green hover:bg-forest-green-light text-cream text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-4">
          {comments.map((comm) => {
            const isOwnComment = user && String(comm.userId) === String(user.id);
            const isEditing = editingCommentId === comm.id;

            return (
              <div key={comm.id} className="p-4 rounded-2xl bg-cream/30 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comm.userAvatar}
                      alt={comm.userName}
                      className="w-8 h-8 rounded-full object-cover bg-white"
                      onError={(e) => {
                        e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=foodie';
                      }}
                    />
                    <div>
                      <span className="text-xs font-bold text-forest-green">{comm.userName}</span>
                      <span className="text-[10px] text-gray-400 ml-2">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(isOwnComment || isAdmin) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(comm.id);
                          setEditingCommentText(comm.content);
                        }}
                        className="text-gray-400 hover:text-forest-green transition-colors text-xs"
                        title="Edit comment"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors text-xs"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="flex-grow px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => handleUpdateComment(comm.id)}
                      className="px-3 py-1 bg-forest-green text-cream rounded-lg text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="px-3 py-1 bg-gray-200 text-charcoal rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-charcoal-light pl-11 leading-relaxed">
                    {comm.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* RELATED RECIPES SECTION */}
      {recipe.relatedRecipes && recipe.relatedRecipes.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-forest-green">
              You Might Also Like
            </h3>
            <Link
              to={`/explore?cuisine=${recipe.cuisine}`}
              className="text-xs font-semibold text-terracotta hover:underline"
            >
              More {recipe.cuisine} Recipes →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recipe.relatedRecipes.map((rel) => (
              <RecipeCard key={rel.id} recipe={rel} />
            ))}
          </div>
        </section>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Recipe"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-semibold">
              Are you sure you want to delete "{recipe.title}"?
            </p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            This action is permanent and will remove this recipe, along with all associated reviews and saved cookbook entries.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-charcoal hover:bg-cream"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteRecipe}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* REPORT CONTENT MODAL */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Recipe to Moderation"
      >
        <form onSubmit={handleSendReport} className="space-y-4">
          <p className="text-xs text-gray-500">
            Help maintain Flavouriz as a safe, respectful cooking community. Please specify the issue:
          </p>

          <div>
            <label className="block text-xs font-bold text-forest-green mb-1 uppercase tracking-wider">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold"
            >
              <option value="inappropriate">Inappropriate or offensive content</option>
              <option value="spam">Spam or advertising</option>
              <option value="copyright">Plagiarism or copyright violation</option>
              <option value="misleading">Dangerous or misleading preparation instructions</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green mb-1 uppercase tracking-wider">
              Additional Details
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              placeholder="Provide any additional context for the administrator..."
              className="w-full p-3 bg-cream/50 rounded-xl border border-gray-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReport}
              className="px-5 py-2 rounded-full bg-terracotta hover:bg-terracotta-dark text-white text-xs font-bold shadow-sm"
            >
              {submittingReport ? 'Sending...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

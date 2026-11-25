import * as storage from './storageService.js';
import { recalculateRecipeRatings } from './recipeService.js';

export async function getReviewsForRecipe(recipeId) {
  const reviews = await storage.find('reviews', (r) => String(r.recipeId) === String(recipeId));

  // Sort newest first
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach user details if needed
  const users = await storage.readAll('users');
  const userMap = new Map(users.map((u) => [String(u.id), u]));

  return reviews.map((r) => {
    const user = userMap.get(String(r.userId));
    return {
      ...r,
      userName: user ? user.name : r.userName || 'Anonymous Foodie',
      userAvatar: user ? user.avatar : r.userAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef',
      userUsername: user ? user.username : 'foodie',
    };
  });
}

export async function addReview({ recipeId, rating, comment }, user) {
  const recipe = await storage.findById('recipes', recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    const error = new Error('Rating must be a number between 1 and 5 stars.');
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate review by same user
  const existingReview = await storage.findOne(
    'reviews',
    (r) => String(r.recipeId) === String(recipeId) && String(r.userId) === String(user.id)
  );

  if (existingReview) {
    const error = new Error('You have already submitted a review for this recipe. You can update your existing review.');
    error.statusCode = 409;
    throw error;
  }

  const review = await storage.create('reviews', {
    recipeId,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    userAvatar: user.avatar,
    rating: numericRating,
    comment: (comment || '').trim(),
  });

  // Recalculate average rating & count
  const updatedStats = await recalculateRecipeRatings(recipeId);

  return {
    review,
    recipeStats: updatedStats,
  };
}

export async function updateReview(reviewId, { rating, comment }, user) {
  const review = await storage.findById('reviews', reviewId);
  if (!review) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(review.userId) === String(user.id);
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only edit your own review.');
    error.statusCode = 403;
    throw error;
  }

  const updates = {};
  if (rating !== undefined) {
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      const error = new Error('Rating must be a number between 1 and 5 stars.');
      error.statusCode = 400;
      throw error;
    }
    updates.rating = numericRating;
  }

  if (comment !== undefined) {
    updates.comment = (comment || '').trim();
  }

  const updatedReview = await storage.updateById('reviews', reviewId, updates);
  const updatedStats = await recalculateRecipeRatings(review.recipeId);

  return {
    review: updatedReview,
    recipeStats: updatedStats,
  };
}

export async function deleteReview(reviewId, user) {
  const review = await storage.findById('reviews', reviewId);
  if (!review) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(review.userId) === String(user.id);
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only delete your own review.');
    error.statusCode = 403;
    throw error;
  }

  await storage.deleteById('reviews', reviewId);
  const updatedStats = await recalculateRecipeRatings(review.recipeId);

  return {
    message: 'Review deleted successfully.',
    recipeStats: updatedStats,
  };
}

const Review = require('../models/Review');
const Recipe = require('../models/Recipe');
const AppError = require('../utils/AppError');
const { serializeReview } = require('../utils/serialize');

async function updateRecipeRating(recipeId) {
  const [result] = await Review.aggregate([
    { $match: { recipeId: new (require('mongoose').Types.ObjectId)(recipeId) } },
    { $group: { _id: '$recipeId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Recipe.updateOne({ _id: recipeId }, {
    $set: {
      averageRating: result ? Math.round(result.average * 10) / 10 : 0,
      reviewsCount: result?.count || 0,
    },
  });
}

async function listReviews(recipeId) {
  return (await Review.find({ recipeId })
    .populate('userId', 'name username avatar')
    .sort({ createdAt: -1 }))
    .map(serializeReview);
}

async function createReview(recipeId, userId, input, photos = []) {
  if (!(await Recipe.exists({ _id: recipeId }))) throw new AppError('Recipe not found.', 404);
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError('Rating must be a whole number between 1 and 5.', 400);
  }
  const review = await Review.create({
    recipeId,
    userId,
    rating,
    comment: String(input.comment || '').trim(),
    photos,
  });
  await updateRecipeRating(recipeId);
  return serializeReview(await review.populate('userId', 'name username avatar'));
}

async function updateReview(id, user, input, photos = []) {
  const review = await Review.findById(id);
  if (!review) throw new AppError('Review not found.', 404);
  if (String(review.userId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to modify this review.', 403);
  }
  if (input.rating !== undefined) {
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating must be a whole number between 1 and 5.', 400);
    }
    review.rating = rating;
  }
  if (input.comment !== undefined) review.comment = String(input.comment).trim();
  if (photos.length) review.photos.push(...photos);
  await review.save();
  await updateRecipeRating(review.recipeId);
  return serializeReview(await review.populate('userId', 'name username avatar'));
}

async function deleteReview(id, user) {
  const review = await Review.findById(id);
  if (!review) throw new AppError('Review not found.', 404);
  if (String(review.userId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to delete this review.', 403);
  }
  await review.deleteOne();
  await updateRecipeRating(review.recipeId);
}

async function toggleHelpful(id, userId) {
  const review = await Review.findById(id);
  if (!review) throw new AppError('Review not found.', 404);
  if (String(review.userId) === userId) throw new AppError('You cannot vote on your own review.', 400);
  const updated = await Review.updateOne(
    { _id: id, helpfulVoters: { $ne: userId } },
    { $addToSet: { helpfulVoters: userId }, $inc: { helpfulCount: 1 } }
  );
  return { helpful: updated.modifiedCount > 0 };
}

module.exports = {
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  updateRecipeRating,
};

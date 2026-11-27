const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');
const AppError = require('../utils/AppError');
const { serializeRecipe } = require('../utils/serialize');

async function listFavorites(userId) {
  const favorites = await Favorite.find({ userId }).populate({
    path: 'recipeId',
    populate: { path: 'authorId', select: 'name username avatar bio role' },
  }).sort({ createdAt: -1 });
  return favorites.filter((favorite) => favorite.recipeId).map((favorite) => {
    const recipe = serializeRecipe(favorite.recipeId);
    recipe.isFavorited = true;
    return recipe;
  });
}

async function addFavorite(userId, recipeId) {
  if (!(await Recipe.exists({ _id: recipeId }))) throw new AppError('Recipe not found.', 404);
  const result = await Favorite.updateOne(
    { userId, recipeId },
    { $setOnInsert: { userId, recipeId } },
    { upsert: true }
  );
  if (result.upsertedCount) await Recipe.updateOne({ _id: recipeId }, { $inc: { favoritesCount: 1 } });
  return { isFavorited: true };
}

async function removeFavorite(userId, recipeId) {
  const deleted = await Favorite.findOneAndDelete({ userId, recipeId });
  if (deleted) await Recipe.updateOne({ _id: recipeId, favoritesCount: { $gt: 0 } }, { $inc: { favoritesCount: -1 } });
  return { isFavorited: false };
}

module.exports = { listFavorites, addFavorite, removeFavorite };

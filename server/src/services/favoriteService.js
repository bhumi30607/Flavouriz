import * as storage from './storageService.js';

export async function addFavorite(userId, recipeId) {
  const recipe = await storage.findById('recipes', recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check if already favorited
  const existing = await storage.findOne(
    'favorites',
    (f) => String(f.userId) === String(userId) && String(f.recipeId) === String(recipeId)
  );

  if (existing) {
    return { message: 'Recipe already in your cookbook.', isFavorited: true };
  }

  await storage.create('favorites', {
    userId,
    recipeId,
  });

  // Increment favorites count
  const newCount = (recipe.favoritesCount || 0) + 1;
  await storage.updateById('recipes', recipeId, { favoritesCount: newCount });

  return { message: 'Recipe saved to cookbook.', isFavorited: true, favoritesCount: newCount };
}

export async function removeFavorite(userId, recipeId) {
  const existing = await storage.findOne(
    'favorites',
    (f) => String(f.userId) === String(userId) && String(f.recipeId) === String(recipeId)
  );

  if (!existing) {
    return { message: 'Recipe was not in your cookbook.', isFavorited: false };
  }

  await storage.deleteById('favorites', existing.id);

  // Decrement favorites count
  const recipe = await storage.findById('recipes', recipeId);
  if (recipe) {
    const newCount = Math.max(0, (recipe.favoritesCount || 0) - 1);
    await storage.updateById('recipes', recipeId, { favoritesCount: newCount });
    return { message: 'Recipe removed from cookbook.', isFavorited: false, favoritesCount: newCount };
  }

  return { message: 'Recipe removed from cookbook.', isFavorited: false };
}

export async function getUserFavorites(userId) {
  const favorites = await storage.find('favorites', (f) => String(f.userId) === String(userId));
  const recipeIds = favorites.map((f) => String(f.recipeId));

  const allRecipes = await storage.readAll('recipes');
  const userFavoriteRecipes = allRecipes.filter((r) => recipeIds.includes(String(r.id)));

  return userFavoriteRecipes;
}

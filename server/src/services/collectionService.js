import * as storage from './storageService.js';

export async function createCollection(userId, name) {
  if (!name || !name.trim()) {
    const error = new Error('Collection name is required.');
    error.statusCode = 400;
    throw error;
  }
  return storage.create('collections', { userId, name: name.trim(), recipeIds: [] });
}

export async function getCollections(userId) {
  const collections = await storage.find('collections', (item) => String(item.userId) === String(userId));
  return Promise.all(collections.map(async (collection) => ({
    ...collection,
    recipes: (await Promise.all(collection.recipeIds.map((id) => storage.findById('recipes', id))))
      .filter(Boolean),
  })));
}

async function getOwnedCollection(userId, collectionId) {
  const collection = await storage.findById('collections', collectionId);
  if (!collection) {
    const error = new Error('Collection not found.');
    error.statusCode = 404;
    throw error;
  }
  if (String(collection.userId) !== String(userId)) {
    const error = new Error('You do not own this collection.');
    error.statusCode = 403;
    throw error;
  }
  return collection;
}

export async function renameCollection(userId, collectionId, name) {
  await getOwnedCollection(userId, collectionId);
  if (!name || !name.trim()) {
    const error = new Error('Collection name is required.');
    error.statusCode = 400;
    throw error;
  }
  return storage.updateById('collections', collectionId, { name: name.trim() });
}

export async function deleteCollection(userId, collectionId) {
  await getOwnedCollection(userId, collectionId);
  return storage.deleteById('collections', collectionId);
}

export async function updateCollectionRecipes(userId, collectionId, recipeId, action) {
  const collection = await getOwnedCollection(userId, collectionId);
  if (!(await storage.findById('recipes', recipeId))) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  let recipeIds = Array.isArray(collection.recipeIds) ? collection.recipeIds : [];
  if (action === 'add' && !recipeIds.includes(recipeId)) recipeIds = [...recipeIds, recipeId];
  if (action === 'remove') recipeIds = recipeIds.filter((id) => String(id) !== String(recipeId));
  return storage.updateById('collections', collectionId, { recipeIds });
}

export async function generateShoppingList(recipeIds, servingOverrides = {}) {
  const uniqueIds = Array.isArray(recipeIds) ? [...new Set(recipeIds.map(String))] : [];
  const recipes = (await Promise.all(uniqueIds.map((id) => storage.findById('recipes', id))))
    .filter(Boolean);

  const items = new Map();
  for (const recipe of recipes) {
    const originalServings = parseFloat(recipe.servings) || 1;
    const override = parseFloat(servingOverrides[recipe.id]);
    const targetServings = Number.isFinite(override) && override > 0 ? override : originalServings;
    const scale = targetServings / originalServings;

    for (const ingredient of recipe.ingredients || []) {
      const name = typeof ingredient === 'string' ? ingredient : ingredient.name;
      if (!name) continue;
      const unit = typeof ingredient === 'string' ? '' : (ingredient.unit || '').trim().toLowerCase();
      const amountText = typeof ingredient === 'string' ? '' : String(ingredient.amount || '').trim();
      const numericAmount = parseFloat(amountText);
      const key = `${name.trim().toLowerCase()}|${unit}`;
      const existing = items.get(key);
      const nextAmount = Number.isFinite(numericAmount) ? numericAmount * scale : null;

      if (existing) {
        if (existing.amount !== null && nextAmount !== null) existing.amount += nextAmount;
      } else {
        items.set(key, {
          id: Buffer.from(key).toString('base64url'),
          name: name.trim(),
          amount: nextAmount,
          unit,
        });
      }
    }
  }

  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}

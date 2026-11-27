const Collection = require('../models/Collection');
const Recipe = require('../models/Recipe');
const AppError = require('../utils/AppError');
const { serializeRecipe } = require('../utils/serialize');

async function listCollections(userId) {
  const collections = await Collection.find({ userId }).populate({
    path: 'recipeIds',
    populate: { path: 'authorId', select: 'name username avatar' },
  }).sort({ createdAt: -1 });
  return collections.map((collection) => ({
    id: String(collection._id),
    name: collection.name,
    recipeIds: collection.recipeIds.map((recipe) => String(recipe._id)),
    recipes: collection.recipeIds.map(serializeRecipe),
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  }));
}

async function createCollection(userId, name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new AppError('Collection name is required.', 400);
  const collection = await Collection.create({ userId, name: cleanName });
  return { id: String(collection._id), name: collection.name, recipeIds: [], recipes: [] };
}

async function ownedCollection(userId, id) {
  const collection = await Collection.findById(id);
  if (!collection) throw new AppError('Collection not found.', 404);
  if (String(collection.userId) !== userId) throw new AppError('You do not own this collection.', 403);
  return collection;
}

async function renameCollection(userId, id, name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new AppError('Collection name is required.', 400);
  const collection = await ownedCollection(userId, id);
  collection.name = cleanName;
  await collection.save();
  return { id: String(collection._id), name: collection.name, recipeIds: collection.recipeIds.map(String) };
}

async function deleteCollection(userId, id) {
  const collection = await ownedCollection(userId, id);
  await collection.deleteOne();
}

async function modifyRecipes(userId, collectionId, recipeId, action) {
  const collection = await ownedCollection(userId, collectionId);
  if (!(await Recipe.exists({ _id: recipeId }))) throw new AppError('Recipe not found.', 404);
  if (action === 'add') {
    await Collection.updateOne({ _id: collectionId }, { $addToSet: { recipeIds: recipeId } });
  } else {
    await Collection.updateOne({ _id: collectionId }, { $pull: { recipeIds: recipeId } });
  }
  return { id: String(collection._id), recipeIds: (await Collection.findById(collectionId)).recipeIds.map(String) };
}

function parseQuantity(raw) {
  const value = String(raw || '').trim();
  const fraction = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  const number = Number(value);
  return value && Number.isFinite(number) ? number : null;
}

async function shoppingList(recipeIds, servings = {}) {
  if (!Array.isArray(recipeIds) || !recipeIds.length) {
    throw new AppError('Select at least one recipe.', 400);
  }
  const recipes = await Recipe.find({ _id: { $in: [...new Set(recipeIds)] } });
  const items = new Map();
  for (const recipe of recipes) {
    const defaultServings = recipe.servings || 1;
    const requestedServings = Number(servings[String(recipe._id)]);
    const scale = Number.isFinite(requestedServings) && requestedServings > 0
      ? requestedServings / defaultServings
      : 1;
    for (const ingredient of recipe.ingredients) {
      const name = ingredient.name.trim();
      const unit = ingredient.unit.trim();
      const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
      const amount = parseQuantity(ingredient.amount);
      if (!items.has(key)) {
        items.set(key, {
          id: Buffer.from(key).toString('base64url'),
          name,
          unit,
          amount: amount === null ? null : amount * scale,
        });
      } else {
        const existing = items.get(key);
        if (existing.amount !== null && amount !== null) existing.amount += amount * scale;
        else existing.amount = null;
      }
    }
  }
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = {
  listCollections, createCollection, renameCollection, deleteCollection, modifyRecipes, shoppingList,
};

import * as collectionService from '../services/collectionService.js';

export async function createCollection(req, res, next) {
  try {
    const collection = await collectionService.createCollection(req.user.id, req.body.name);
    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function getCollections(req, res, next) {
  try {
    const collections = await collectionService.getCollections(req.user.id);
    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    next(error);
  }
}

export async function renameCollection(req, res, next) {
  try {
    const collection = await collectionService.renameCollection(req.user.id, req.params.id, req.body.name);
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollection(req, res, next) {
  try {
    await collectionService.deleteCollection(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Collection deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function addRecipe(req, res, next) {
  try {
    const collection = await collectionService.updateCollectionRecipes(
      req.user.id,
      req.params.id,
      req.params.recipeId,
      'add'
    );
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function removeRecipe(req, res, next) {
  try {
    const collection = await collectionService.updateCollectionRecipes(
      req.user.id,
      req.params.id,
      req.params.recipeId,
      'remove'
    );
    res.status(200).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
}

export async function getShoppingList(req, res, next) {
  try {
    const recipeIds = Array.isArray(req.body.recipeIds)
      ? req.body.recipeIds
      : String(req.query.recipeIds || '').split(',').filter(Boolean);
    const items = await collectionService.generateShoppingList(recipeIds, req.body.servings || {});
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

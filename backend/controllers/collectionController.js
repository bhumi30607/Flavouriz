const collectionService = require('../services/collectionService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await collectionService.listCollections(req.user.id) });
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json({
    success: true,
    data: await collectionService.createCollection(req.user.id, req.body.name),
  });
});

exports.rename = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: await collectionService.renameCollection(req.user.id, req.params.id, req.body.name),
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.user.id, req.params.id);
  res.status(200).json({ success: true, message: 'Collection deleted.' });
});

exports.addRecipe = asyncHandler(async (req, res) => {
  const data = await collectionService.modifyRecipes(req.user.id, req.params.id, req.params.recipeId, 'add');
  res.status(200).json({ success: true, data });
});

exports.removeRecipe = asyncHandler(async (req, res) => {
  const data = await collectionService.modifyRecipes(req.user.id, req.params.id, req.params.recipeId, 'remove');
  res.status(200).json({ success: true, data });
});

exports.shoppingList = asyncHandler(async (req, res) => {
  const recipeIds = Array.isArray(req.body.recipeIds)
    ? req.body.recipeIds
    : String(req.query.recipeIds || '').split(',').filter(Boolean);
  const data = await collectionService.shoppingList(recipeIds, req.body.servings || {});
  res.status(200).json({ success: true, data });
});

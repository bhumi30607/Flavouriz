const favoriteService = require('../services/favoriteService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await favoriteService.listFavorites(req.user.id) });
});

exports.add = asyncHandler(async (req, res) => {
  const data = await favoriteService.addFavorite(req.user.id, req.params.recipeId);
  res.status(200).json({ success: true, message: 'Recipe saved to cookbook.', data });
});

exports.remove = asyncHandler(async (req, res) => {
  const data = await favoriteService.removeFavorite(req.user.id, req.params.recipeId);
  res.status(200).json({ success: true, message: 'Recipe removed from cookbook.', data });
});

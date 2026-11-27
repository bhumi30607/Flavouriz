const recipeService = require('../services/recipeService');
const imageService = require('../services/imageService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const Recipe = require('../models/Recipe');
const { serializeRecipe } = require('../utils/serialize');

exports.list = asyncHandler(async (req, res) => {
  const result = await recipeService.listRecipes(req.query, req.user?.id);
  res.status(200).json({
    success: true,
    data: result.recipes,
    pagination: result.pagination,
    nextCursor: result.pagination.nextCursor,
    hasMore: result.pagination.hasMore,
  });
});

exports.get = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipe(req.params.id, req.user?.id);
  res.status(200).json({ success: true, data: recipe });
});

async function prepareImages(req, folder) {
  const coverFile = req.files?.image?.[0];
  const stepFiles = req.files?.stepImages || [];
  const [cover] = coverFile ? await imageService.uploadMany([coverFile], folder) : [];
  const steps = await imageService.uploadMany(stepFiles, folder);
  return { cover: cover || null, steps };
}

exports.create = asyncHandler(async (req, res) => {
  const uploaded = await prepareImages(req, `users/${req.user.id}/recipes`);
  const recipe = await recipeService.createRecipe(req.body, req.user, uploaded.cover, uploaded.steps);
  res.status(201).json({ success: true, message: 'Recipe created successfully.', data: recipe });
});

exports.update = asyncHandler(async (req, res) => {
  const uploaded = await prepareImages(req, `users/${req.user.id}/recipes`);
  const recipe = await recipeService.updateRecipe(
    req.params.id, req.body, req.user, uploaded.cover, uploaded.steps
  );
  res.status(200).json({ success: true, message: 'Recipe updated successfully.', data: recipe });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await recipeService.deleteRecipe(req.params.id, req.user);
  res.status(200).json({ success: true, message: result.message });
});

exports.myRecipes = asyncHandler(async (req, res) => {
  const result = await recipeService.listRecipes({ authorId: req.user.id, limit: 50 }, req.user.id);
  res.status(200).json({ success: true, data: result.recipes });
});

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file uploaded.', 400);
  const image = await imageService.uploadImage(req.file, `users/${req.user.id}`);
  res.status(200).json({ success: true, message: 'Image uploaded successfully.', data: image });
});

exports.toggleFeatured = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new AppError('Recipe not found.', 404);
  recipe.isFeatured = !recipe.isFeatured;
  await recipe.save();
  res.status(200).json({
    success: true,
    message: recipe.isFeatured ? 'Recipe featured.' : 'Recipe unfeatured.',
    data: serializeRecipe(recipe),
  });
});

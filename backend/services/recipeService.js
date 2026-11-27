const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const { serializeRecipe } = require('../utils/serialize');

function slugify(value) {
  return String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'recipe';
}

function parseArray(value, field) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new AppError(`${field} must be a JSON array.`, 400);
  }
}

function normalizeInstructions(instructions, stepFiles = []) {
  return instructions.map((step, index) => {
    const input = typeof step === 'string' ? { instruction: step } : step;
    const uploaded = stepFiles[index];
    return {
      stepNumber: index + 1,
      instruction: String(input.instruction || input.text || '').trim(),
      imageUrl: uploaded?.url || input.imageUrl || '',
      imagePublicId: uploaded?.publicId || input.imagePublicId || '',
    };
  });
}

function sortConfig(sort) {
  if (sort === 'highest_rated') return { averageRating: -1, reviewsCount: -1, _id: -1 };
  if (sort === 'popular') return { favoritesCount: -1, _id: -1 };
  if (sort === 'quickest') return { totalTimeMinutes: 1, _id: 1 };
  if (sort === 'oldest') return { createdAt: 1, _id: 1 };
  return { createdAt: -1, _id: -1 };
}

function cursorFor(recipe, sort) {
  return Buffer.from(JSON.stringify({
    sort,
    id: String(recipe._id),
    createdAt: recipe.createdAt,
    averageRating: recipe.averageRating,
    reviewsCount: recipe.reviewsCount,
    favoritesCount: recipe.favoritesCount,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    totalTimeMinutes: recipe.totalTimeMinutes,
  })).toString('base64url');
}

function cursorFilter(cursor, sort) {
  let value;
  try {
    value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (value.sort !== sort || !value.id) throw new Error();
  } catch {
    throw new AppError('Invalid pagination cursor.', 400);
  }

  const id = value.id;
  if (sort === 'highest_rated') {
    return { $or: [
      { averageRating: { $lt: value.averageRating } },
      { averageRating: value.averageRating, reviewsCount: { $lt: value.reviewsCount } },
      { averageRating: value.averageRating, reviewsCount: value.reviewsCount, _id: { $lt: id } },
    ] };
  }
  if (sort === 'popular') {
    return { $or: [
      { favoritesCount: { $lt: value.favoritesCount } },
      { favoritesCount: value.favoritesCount, _id: { $lt: id } },
    ] };
  }
  if (sort === 'quickest') {
    const time = value.totalTimeMinutes;
    return { $or: [
      { totalTimeMinutes: { $gt: time } },
      { totalTimeMinutes: time, _id: { $gt: id } },
    ] };
  }
  const date = new Date(value.createdAt);
  return sort === 'oldest'
    ? { $or: [{ createdAt: { $gt: date } }, { createdAt: date, _id: { $gt: id } }] }
    : { $or: [{ createdAt: { $lt: date } }, { createdAt: date, _id: { $lt: id } }] };
}

async function listRecipes(params = {}, currentUserId = null) {
  const {
    search = '', category, cuisine, diet, difficulty, maxTime,
    sort = 'newest', page = '1', limit = '9', authorId, featured, cursor,
  } = params;
  const query = {};
  if (authorId) query.authorId = authorId;
  if (featured === 'true') query.isFeatured = true;
  if (category && category !== 'All') query.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (cuisine && cuisine !== 'All') query.cuisine = new RegExp(`^${escapeRegex(cuisine)}$`, 'i');
  if (diet && diet !== 'All') query.diet = new RegExp(`^${escapeRegex(diet)}$`, 'i');
  if (difficulty && difficulty !== 'All') query.difficulty = new RegExp(`^${escapeRegex(difficulty)}$`, 'i');
  if (maxTime && Number.isFinite(Number(maxTime))) {
    query.$expr = { $lte: [{ $add: ['$prepTimeMinutes', '$cookTimeMinutes'] }, Number(maxTime)] };
  }

  if (search.trim()) {
    query.$text = { $search: search.trim() };
  }
  const pageSize = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 9));
  const sortBy = ['newest', 'oldest', 'highest_rated', 'popular', 'quickest'].includes(sort)
    ? sort
    : 'newest';
  let cursorMode = Boolean(cursor);
  if (cursorMode) Object.assign(query, cursorFilter(cursor, sortBy));

  let total = await Recipe.countDocuments(query);
  if (search.trim() && total === 0) {
    delete query.$text;
    const pattern = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { title: pattern }, { description: pattern }, { tags: pattern },
      { 'ingredients.name': pattern },
    ];
    total = await Recipe.countDocuments(query);
  }

  const queryForRows = Recipe.find(query)
    .populate('authorId', 'name username avatar bio role')
    .sort(sortBy === 'newest' || sortBy === 'oldest' || sortBy === 'highest_rated' || sortBy === 'popular' || sortBy === 'quickest'
      ? sortConfig(sortBy)
      : { createdAt: -1, _id: -1 })
    .limit(pageSize + 1);
  if (!cursorMode) {
    queryForRows.skip((Math.max(1, Number.parseInt(page, 10) || 1) - 1) * pageSize);
  }
  let rows = await queryForRows;
  const hasMore = rows.length > pageSize;
  rows = rows.slice(0, pageSize);

  if (currentUserId && rows.length) {
    const ids = rows.map((recipe) => recipe._id);
    const favorites = await Favorite.find({ userId: currentUserId, recipeId: { $in: ids } }).select('recipeId');
    const favoritedIds = new Set(favorites.map((favorite) => String(favorite.recipeId)));
    rows = rows.map((recipe) => {
      const value = serializeRecipe(recipe);
      value.isFavorited = favoritedIds.has(value.id);
      return value;
    });
  } else {
    rows = rows.map(serializeRecipe);
  }

  const last = rows.at(-1);
  const nextCursor = hasMore && last
    ? cursorFor(await Recipe.findById(last.id).select('createdAt averageRating reviewsCount favoritesCount prepTimeMinutes cookTimeMinutes totalTimeMinutes'), sortBy)
    : null;
  const currentPage = cursorMode ? null : Math.max(1, Number.parseInt(page, 10) || 1);
  return {
    recipes: rows,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages: cursorMode ? null : Math.max(1, Math.ceil(total / pageSize)),
      hasNextPage: hasMore,
      hasPrevPage: !cursorMode && currentPage > 1,
      nextCursor,
      hasMore,
    },
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getRecipe(id, userId) {
  const recipe = await Recipe.findById(id).populate('authorId', 'name username avatar bio role');
  if (!recipe) throw new AppError('Recipe not found.', 404);
  const result = serializeRecipe(recipe);
  result.isFavorited = userId
    ? Boolean(await require('../models/Favorite').exists({ userId, recipeId: id }))
    : false;
  const userReview = userId
    ? await Review.findOne({ recipeId: id, userId }).lean()
    : null;
  result.userReview = userReview
    ? {
        ...userReview,
        id: String(userReview._id),
        recipeId: String(userReview.recipeId),
        userId: String(userReview.userId),
      }
    : null;
  if (result.userReview) delete result.userReview._id;
  result.relatedRecipes = (await Recipe.find({
    _id: { $ne: recipe._id },
    $or: [{ category: recipe.category }, { cuisine: recipe.cuisine }],
  }).limit(3)).map(serializeRecipe);
  return result;
}

async function uniqueSlug(title, excludingId) {
  const base = slugify(title);
  let slug = base;
  let suffix = 1;
  while (await Recipe.exists({ slug, ...(excludingId ? { _id: { $ne: excludingId } } : {}) })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

async function createRecipe(input, user, image, stepFiles = []) {
  const ingredients = parseArray(input.ingredients, 'ingredients')
    .map((item) => typeof item === 'string' ? { name: item.trim() } : item)
    .filter((item) => String(item.name || '').trim());
  const instructions = normalizeInstructions(parseArray(input.instructions, 'instructions'), stepFiles);
  if (!String(input.title || '').trim() || !String(input.description || '').trim() || !String(input.cuisine || '').trim()) {
    throw new AppError('Title, description, and cuisine are required.', 400);
  }
  if (!ingredients.length || !instructions.length || instructions.some((step) => !step.instruction)) {
    throw new AppError('At least one valid ingredient and cooking step are required.', 400);
  }

  let tags = input.tags || [];
  if (typeof tags === 'string') {
    try { tags = JSON.parse(tags); } catch { tags = tags.split(','); }
  }
  if (!Array.isArray(tags)) throw new AppError('Tags must be a list.', 400);

  const recipe = await Recipe.create({
    authorId: user.id,
    title: input.title.trim(),
    slug: await uniqueSlug(input.title),
    description: input.description.trim(),
    category: input.category || 'General',
    cuisine: input.cuisine.trim(),
    diet: input.diet || '',
    difficulty: input.difficulty || 'Easy',
    prepTimeMinutes: Number(input.prepTimeMinutes) || 0,
    cookTimeMinutes: Number(input.cookTimeMinutes) || 0,
    totalTimeMinutes: (Number(input.prepTimeMinutes) || 0) + (Number(input.cookTimeMinutes) || 0),
    servings: Number(input.servings) || 4,
    imageUrl: image?.url || input.imageUrl || '',
    imagePublicId: image?.publicId || '',
    ingredients,
    instructions,
    tags: tags.map((tag) => String(tag).trim()).filter(Boolean),
  });
  return serializeRecipe(await recipe.populate('authorId', 'name username avatar bio role'));
}

async function updateRecipe(id, input, user, image, stepFiles = []) {
  const recipe = await Recipe.findById(id);
  if (!recipe) throw new AppError('Recipe not found.', 404);
  if (String(recipe.authorId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to modify this recipe.', 403);
  }

  const updates = {};
  const simpleFields = [
    'title', 'description', 'category', 'cuisine', 'diet', 'difficulty',
    'prepTimeMinutes', 'cookTimeMinutes', 'servings', 'imageUrl',
  ];
  for (const field of simpleFields) {
    if (input[field] !== undefined) updates[field] = field.endsWith('Minutes') || field === 'servings'
      ? Number(input[field])
      : input[field];
  }
  if (input.prepTimeMinutes !== undefined || input.cookTimeMinutes !== undefined) {
    updates.totalTimeMinutes =
      Number(input.prepTimeMinutes ?? recipe.prepTimeMinutes) +
      Number(input.cookTimeMinutes ?? recipe.cookTimeMinutes);
  }
  if (input.title) updates.slug = await uniqueSlug(input.title, id);
  if (input.ingredients !== undefined) {
    updates.ingredients = parseArray(input.ingredients, 'ingredients').map((item) =>
      typeof item === 'string' ? { name: item.trim() } : item);
  }
  if (input.instructions !== undefined) {
    updates.instructions = normalizeInstructions(parseArray(input.instructions, 'instructions'), stepFiles);
  }
  if (input.tags !== undefined) {
    let tags = input.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { tags = tags.split(','); }
    }
    if (!Array.isArray(tags)) throw new AppError('Tags must be a list.', 400);
    updates.tags = tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (image) {
    updates.imageUrl = image.url;
    updates.imagePublicId = image.publicId;
  }
  Object.assign(recipe, updates);
  await recipe.save();
  return serializeRecipe(await recipe.populate('authorId', 'name username avatar bio role'));
}

async function deleteRecipe(id, user) {
  const recipe = await Recipe.findById(id);
  if (!recipe) throw new AppError('Recipe not found.', 404);
  if (String(recipe.authorId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to delete this recipe.', 403);
  }
  await Promise.all([
    recipe.deleteOne(),
    require('../models/Review').deleteMany({ recipeId: id }),
    require('../models/Comment').deleteMany({ recipeId: id }),
    Favorite.deleteMany({ recipeId: id }),
    require('../models/Collection').updateMany({ recipeIds: id }, { $pull: { recipeIds: id } }),
  ]);
  return { message: 'Recipe deleted successfully.' };
}

module.exports = { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };

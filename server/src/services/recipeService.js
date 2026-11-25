import * as storage from './storageService.js';

export async function recalculateRecipeRatings(recipeId) {
  const reviews = await storage.find('reviews', (r) => String(r.recipeId) === String(recipeId));
  const count = reviews.length;
  let average = 0;
  if (count > 0) {
    const sum = reviews.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    average = Math.round((sum / count) * 10) / 10; // 1 decimal place
  }
  await storage.updateById('recipes', recipeId, {
    averageRating: average,
    reviewsCount: count,
  });
  return { averageRating: average, reviewsCount: count };
}

export async function getRecipes(queryParams = {}) {
  const {
    search = '',
    category = '',
    cuisine = '',
    difficulty = '',
    sort = 'newest',
    page = 1,
    limit = 9,
    authorId = '',
    featured = '',
  } = queryParams;

  let recipes = await storage.readAll('recipes');

  // Filter: Author
  if (authorId) {
    recipes = recipes.filter((r) => String(r.authorId) === String(authorId));
  }

  // Filter: Featured
  if (featured === 'true') {
    recipes = recipes.filter((r) => r.isFeatured === true);
  }

  // Filter: Category
  if (category && category !== 'All') {
    recipes = recipes.filter(
      (r) => r.category && r.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter: Cuisine
  if (cuisine && cuisine !== 'All') {
    recipes = recipes.filter(
      (r) => r.cuisine && r.cuisine.toLowerCase() === cuisine.toLowerCase()
    );
  }

  // Filter: Difficulty
  if (difficulty && difficulty !== 'All') {
    recipes = recipes.filter(
      (r) => r.difficulty && r.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  // Filter: Search (title, description, tags, ingredients)
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    recipes = recipes.filter((r) => {
      const titleMatch = r.title && r.title.toLowerCase().includes(term);
      const descMatch = r.description && r.description.toLowerCase().includes(term);
      const cuisineMatch = r.cuisine && r.cuisine.toLowerCase().includes(term);
      const categoryMatch = r.category && r.category.toLowerCase().includes(term);
      const ingredientMatch =
        Array.isArray(r.ingredients) &&
        r.ingredients.some((ing) => {
          const ingText = typeof ing === 'string' ? ing : `${ing.name || ''} ${ing.notes || ''}`;
          return ingText.toLowerCase().includes(term);
        });
      return titleMatch || descMatch || cuisineMatch || categoryMatch || ingredientMatch;
    });
  }

  // Sorting
  recipes.sort((a, b) => {
    switch (sort) {
      case 'highest_rated': {
        const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      }
      case 'popular': {
        const popA = (a.reviewsCount || 0) + (a.favoritesCount || 0);
        const popB = (b.reviewsCount || 0) + (b.favoritesCount || 0);
        return popB - popA;
      }
      case 'quickest': {
        const timeA = (a.prepTimeMinutes || 0) + (a.cookTimeMinutes || 0);
        const timeB = (b.prepTimeMinutes || 0) + (b.cookTimeMinutes || 0);
        return timeA - timeB;
      }
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const total = recipes.length;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const itemsPerPage = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecipes = recipes.slice(startIndex, startIndex + itemsPerPage);

  return {
    recipes: paginatedRecipes,
    pagination: {
      total,
      page: currentPage,
      limit: itemsPerPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  };
}

export async function getRecipeById(id, currentUserId = null) {
  const recipe = await storage.findById('recipes', id);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  // Attach author details
  const author = await storage.findById('users', recipe.authorId);
  const authorInfo = author
    ? {
        id: author.id,
        name: author.name,
        username: author.username,
        avatar: author.avatar,
        bio: author.bio,
      }
    : {
        id: recipe.authorId,
        name: 'Community Chef',
        username: 'chef',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef',
        bio: '',
      };

  // Check if favorited by current user
  let isFavorited = false;
  let userReview = null;

  if (currentUserId) {
    const favorite = await storage.findOne(
      'favorites',
      (f) => String(f.userId) === String(currentUserId) && String(f.recipeId) === String(id)
    );
    isFavorited = Boolean(favorite);

    userReview = await storage.findOne(
      'reviews',
      (r) => String(r.userId) === String(currentUserId) && String(r.recipeId) === String(id)
    );
  }

  // Find related recipes (same category or cuisine, excluding current)
  const allRecipes = await storage.readAll('recipes');
  const relatedRecipes = allRecipes
    .filter(
      (r) =>
        String(r.id) !== String(id) &&
        (r.category === recipe.category || r.cuisine === recipe.cuisine)
    )
    .slice(0, 3);

  return {
    ...recipe,
    author: authorInfo,
    isFavorited,
    userReview,
    relatedRecipes,
  };
}

export async function createRecipe(recipeData, user) {
  const {
    title,
    description,
    category,
    cuisine,
    difficulty,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    ingredients,
    instructions,
    imageUrl,
    tags,
  } = recipeData;

  // Validation
  if (!title || !description || !category || !cuisine || !difficulty) {
    const error = new Error('Title, description, category, cuisine, and difficulty are required.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    const error = new Error('At least one ingredient is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(instructions) || instructions.length === 0) {
    const error = new Error('At least one cooking instruction step is required.');
    error.statusCode = 400;
    throw error;
  }

  // Normalize ingredients
  const formattedIngredients = ingredients.map((ing, idx) => {
    if (typeof ing === 'string') {
      return { id: idx + 1, name: ing.trim(), amount: '', unit: '' };
    }
    return {
      id: idx + 1,
      name: ing.name?.trim() || '',
      amount: ing.amount !== undefined ? String(ing.amount).trim() : '',
      unit: ing.unit?.trim() || '',
    };
  });

  // Normalize instructions
  const formattedInstructions = instructions.map((step, idx) => {
    if (typeof step === 'string') {
      return { stepNumber: idx + 1, instruction: step.trim() };
    }
    return {
      stepNumber: idx + 1,
      instruction: (step.instruction || step.text || '').trim(),
    };
  });

  const newRecipe = await storage.create('recipes', {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    cuisine: cuisine.trim(),
    difficulty: difficulty.trim(),
    prepTimeMinutes: parseInt(prepTimeMinutes, 10) || 15,
    cookTimeMinutes: parseInt(cookTimeMinutes, 10) || 30,
    servings: parseInt(servings, 10) || 4,
    ingredients: formattedIngredients,
    instructions: formattedInstructions,
    imageUrl:
      imageUrl ||
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
    tags: Array.isArray(tags) ? tags : [],
    authorId: user.id,
    authorName: user.name,
    averageRating: 0,
    reviewsCount: 0,
    favoritesCount: 0,
    isFeatured: false,
  });

  return newRecipe;
}

export async function updateRecipe(id, updates, requestingUser) {
  const recipe = await storage.findById('recipes', id);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: owner or admin
  const isOwner = String(recipe.authorId) === String(requestingUser.id);
  const isAdmin = requestingUser.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only edit your own recipes.');
    error.statusCode = 403;
    throw error;
  }

  // Format updates safely
  const allowedFields = [
    'title',
    'description',
    'category',
    'cuisine',
    'difficulty',
    'prepTimeMinutes',
    'cookTimeMinutes',
    'servings',
    'ingredients',
    'instructions',
    'imageUrl',
    'tags',
    'isFeatured',
  ];

  const safeUpdates = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'ingredients' && Array.isArray(updates.ingredients)) {
        safeUpdates.ingredients = updates.ingredients.map((ing, idx) => ({
          id: idx + 1,
          name: typeof ing === 'string' ? ing.trim() : (ing.name || '').trim(),
          amount: typeof ing === 'object' && ing.amount !== undefined ? String(ing.amount).trim() : '',
          unit: typeof ing === 'object' && ing.unit ? ing.unit.trim() : '',
        }));
      } else if (field === 'instructions' && Array.isArray(updates.instructions)) {
        safeUpdates.instructions = updates.instructions.map((step, idx) => ({
          stepNumber: idx + 1,
          instruction: typeof step === 'string' ? step.trim() : (step.instruction || step.text || '').trim(),
        }));
      } else if (field === 'prepTimeMinutes' || field === 'cookTimeMinutes' || field === 'servings') {
        safeUpdates[field] = parseInt(updates[field], 10) || 0;
      } else if (field === 'isFeatured') {
        // Only admin can feature
        if (isAdmin) {
          safeUpdates.isFeatured = Boolean(updates.isFeatured);
        }
      } else {
        safeUpdates[field] = updates[field];
      }
    }
  }

  const updated = await storage.updateById('recipes', id, safeUpdates);
  return updated;
}

export async function deleteRecipe(id, requestingUser) {
  const recipe = await storage.findById('recipes', id);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(recipe.authorId) === String(requestingUser.id);
  const isAdmin = requestingUser.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only delete your own recipes.');
    error.statusCode = 403;
    throw error;
  }

  // Delete recipe
  await storage.deleteById('recipes', id);

  // Cascade delete favorites, reviews, comments, and reports
  const allFavorites = await storage.readAll('favorites');
  const remainingFavorites = allFavorites.filter((f) => String(f.recipeId) !== String(id));
  if (remainingFavorites.length !== allFavorites.length) {
    await storage.writeAll('favorites', remainingFavorites);
  }

  const allReviews = await storage.readAll('reviews');
  const remainingReviews = allReviews.filter((r) => String(r.recipeId) !== String(id));
  if (remainingReviews.length !== allReviews.length) {
    await storage.writeAll('reviews', remainingReviews);
  }

  const allComments = await storage.readAll('comments');
  const remainingComments = allComments.filter((c) => String(c.recipeId) !== String(id));
  if (remainingComments.length !== allComments.length) {
    await storage.writeAll('comments', remainingComments);
  }

  return { message: 'Recipe and related items deleted successfully.' };
}

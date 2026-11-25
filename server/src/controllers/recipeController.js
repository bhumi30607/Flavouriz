import * as recipeService from '../services/recipeService.js';

export async function getRecipes(req, res, next) {
  try {
    const result = await recipeService.getRecipes(req.query);
    res.status(200).json({
      success: true,
      data: result.recipes,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecipeById(req, res, next) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const recipe = await recipeService.getRecipeById(req.params.id, currentUserId);
    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
}

export async function createRecipe(req, res, next) {
  try {
    let imageUrl = req.body.imageUrl;

    // Check if an image file was uploaded via Multer
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    let ingredients = req.body.ingredients;
    if (typeof ingredients === 'string') {
      try {
        ingredients = JSON.parse(ingredients);
      } catch (_) {
        ingredients = ingredients.split('\n').filter(Boolean);
      }
    }

    let instructions = req.body.instructions;
    if (typeof instructions === 'string') {
      try {
        instructions = JSON.parse(instructions);
      } catch (_) {
        instructions = instructions.split('\n').filter(Boolean);
      }
    }

    let tags = req.body.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (_) {
        tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const recipe = await recipeService.createRecipe(
      {
        ...req.body,
        ingredients,
        instructions,
        tags,
        imageUrl,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully.',
      data: recipe,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRecipe(req, res, next) {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof updates.ingredients === 'string') {
      try {
        updates.ingredients = JSON.parse(updates.ingredients);
      } catch (_) {
        updates.ingredients = updates.ingredients.split('\n').filter(Boolean);
      }
    }

    if (typeof updates.instructions === 'string') {
      try {
        updates.instructions = JSON.parse(updates.instructions);
      } catch (_) {
        updates.instructions = updates.instructions.split('\n').filter(Boolean);
      }
    }

    if (typeof updates.tags === 'string') {
      try {
        updates.tags = JSON.parse(updates.tags);
      } catch (_) {
        updates.tags = updates.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const updatedRecipe = await recipeService.updateRecipe(req.params.id, updates, req.user);
    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully.',
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipe(req, res, next) {
  try {
    const result = await recipeService.deleteRecipe(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyRecipes(req, res, next) {
  try {
    const result = await recipeService.getRecipes({
      authorId: req.user.id,
      limit: 100,
    });
    res.status(200).json({
      success: true,
      data: result.recipes,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file uploaded.',
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully.',
    data: {
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    },
  });
}

import * as favoriteService from '../services/favoriteService.js';

export async function addFavorite(req, res, next) {
  try {
    const result = await favoriteService.addFavorite(req.user.id, req.params.recipeId);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const result = await favoriteService.removeFavorite(req.user.id, req.params.recipeId);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFavorites(req, res, next) {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
}

import * as reviewService from '../services/reviewService.js';

export async function getReviewsForRecipe(req, res, next) {
  try {
    const reviews = await reviewService.getReviewsForRecipe(req.params.id);
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

export async function addReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const result = await reviewService.addReview(
      {
        recipeId: req.params.id,
        rating,
        comment,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const result = await reviewService.updateReview(
      req.params.id,
      { rating, comment },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const result = await reviewService.deleteReview(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

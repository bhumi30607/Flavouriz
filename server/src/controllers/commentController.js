import * as commentService from '../services/commentService.js';

export async function getCommentsForRecipe(req, res, next) {
  try {
    const comments = await commentService.getCommentsForRecipe(req.params.id);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { content } = req.body;
    const comment = await commentService.addComment(
      {
        recipeId: req.params.id,
        content,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComment(req, res, next) {
  try {
    const { content } = req.body;
    const comment = await commentService.updateComment(req.params.id, { content }, req.user);
    res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const result = await commentService.deleteComment(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

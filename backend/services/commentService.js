const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const AppError = require('../utils/AppError');
const { serializeComment } = require('../utils/serialize');

async function listComments(recipeId) {
  return (await Comment.find({ recipeId })
    .populate('userId', 'name username avatar')
    .sort({ createdAt: 1 }))
    .map(serializeComment);
}

async function createComment(recipeId, userId, content) {
  if (!(await Recipe.exists({ _id: recipeId }))) throw new AppError('Recipe not found.', 404);
  const cleanContent = String(content || '').trim();
  if (!cleanContent) throw new AppError('Comment content is required.', 400);
  const comment = await Comment.create({ recipeId, userId, content: cleanContent });
  return serializeComment(await comment.populate('userId', 'name username avatar'));
}

async function updateComment(id, user, content) {
  const comment = await Comment.findById(id);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (String(comment.userId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to modify this comment.', 403);
  }
  const cleanContent = String(content || '').trim();
  if (!cleanContent) throw new AppError('Comment content is required.', 400);
  comment.content = cleanContent;
  await comment.save();
  return serializeComment(await comment.populate('userId', 'name username avatar'));
}

async function deleteComment(id, user) {
  const comment = await Comment.findById(id);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (String(comment.userId) !== user.id && user.role !== 'admin') {
    throw new AppError('You are not allowed to delete this comment.', 403);
  }
  await comment.deleteOne();
}

module.exports = { listComments, createComment, updateComment, deleteComment };

import * as storage from './storageService.js';

export async function getCommentsForRecipe(recipeId) {
  const comments = await storage.find('comments', (c) => String(c.recipeId) === String(recipeId));

  comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const users = await storage.readAll('users');
  const userMap = new Map(users.map((u) => [String(u.id), u]));

  return comments.map((c) => {
    const user = userMap.get(String(c.userId));
    return {
      ...c,
      userName: user ? user.name : c.userName || 'Community Cook',
      userUsername: user ? user.username : 'cook',
      userAvatar: user ? user.avatar : c.userAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=foodie',
    };
  });
}

export async function addComment({ recipeId, content }, user) {
  const recipe = await storage.findById('recipes', recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!content || !content.trim()) {
    const error = new Error('Comment content cannot be empty.');
    error.statusCode = 400;
    throw error;
  }

  const comment = await storage.create('comments', {
    recipeId,
    userId: user.id,
    userName: user.name,
    userUsername: user.username,
    userAvatar: user.avatar,
    content: content.trim(),
  });

  return comment;
}

export async function updateComment(commentId, { content }, user) {
  const comment = await storage.findById('comments', commentId);
  if (!comment) {
    const error = new Error('Comment not found.');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(comment.userId) === String(user.id);
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only edit your own comments.');
    error.statusCode = 403;
    throw error;
  }

  if (!content || !content.trim()) {
    const error = new Error('Comment content cannot be empty.');
    error.statusCode = 400;
    throw error;
  }

  const updatedComment = await storage.updateById('comments', commentId, {
    content: content.trim(),
  });

  return updatedComment;
}

export async function deleteComment(commentId, user) {
  const comment = await storage.findById('comments', commentId);
  if (!comment) {
    const error = new Error('Comment not found.');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = String(comment.userId) === String(user.id);
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    const error = new Error('Forbidden: You can only delete your own comments.');
    error.statusCode = 403;
    throw error;
  }

  await storage.deleteById('comments', commentId);
  return { message: 'Comment deleted successfully.' };
}

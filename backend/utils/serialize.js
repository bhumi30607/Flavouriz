function serializeUser(user) {
  if (!user) return null;
  const value = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete value.password;
  delete value.passwordHash;
  value.id = String(value._id || value.id);
  delete value._id;
  delete value.__v;
  value.avatar = value.avatar || value.avatarUrl || '';
  return value;
}

function serializeRecipe(recipe) {
  if (!recipe) return null;
  const value = typeof recipe.toObject === 'function' ? recipe.toObject() : { ...recipe };
  const author = value.authorId && typeof value.authorId === 'object'
    ? value.authorId
    : null;
  value.id = String(value._id || value.id);
  value.authorId = String(author?._id || value.authorId || '');
  if (author) {
    value.authorName = author.name;
    value.author = serializeUser(author);
  }
  value.imageUrl = value.imageUrl || value.coverUrl || '';
  value.averageRating = Number(value.averageRating || 0);
  value.reviewsCount = Number(value.reviewsCount || 0);
  value.instructions = (value.instructions || value.steps || []).map((step, index) => ({
    ...step,
    stepNumber: step.stepNumber || step.order || index + 1,
    instruction: step.instruction || step.text || '',
  }));
  delete value._id;
  delete value.__v;
  return value;
}

function serializeReview(review) {
  if (!review) return null;
  const value = typeof review.toObject === 'function' ? review.toObject() : { ...review };
  const user = value.userId && typeof value.userId === 'object' ? value.userId : null;
  value.id = String(value._id || value.id);
  value.recipeId = String(value.recipeId);
  value.userId = String(user?._id || value.userId);
  if (user) {
    value.userName = user.name;
    value.userAvatar = user.avatar || user.avatarUrl || '';
  }
  delete value._id;
  delete value.__v;
  delete value.helpfulVoters;
  return value;
}

function serializeComment(comment) {
  if (!comment) return null;
  const value = typeof comment.toObject === 'function' ? comment.toObject() : { ...comment };
  const user = value.userId && typeof value.userId === 'object' ? value.userId : null;
  value.id = String(value._id || value.id);
  value.recipeId = String(value.recipeId);
  value.userId = String(user?._id || value.userId);
  if (user) {
    value.userName = user.name;
    value.userAvatar = user.avatar || user.avatarUrl || '';
  }
  delete value._id;
  delete value.__v;
  return value;
}

module.exports = { serializeUser, serializeRecipe, serializeReview, serializeComment };

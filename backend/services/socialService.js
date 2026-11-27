const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const AppError = require('../utils/AppError');
const { serializeUser, serializeRecipe } = require('../utils/serialize');

async function follow(currentUserId, targetUserId) {
  if (String(currentUserId) === String(targetUserId)) throw new AppError('You cannot follow yourself.', 400);
  const target = await User.findById(targetUserId);
  if (!target || !target.isActive) throw new AppError('User not found.', 404);
  await Promise.all([
    User.updateOne({ _id: currentUserId }, { $addToSet: { following: targetUserId } }),
    User.updateOne({ _id: targetUserId }, { $addToSet: { followers: currentUserId } }),
  ]);
  return { following: true };
}

async function unfollow(currentUserId, targetUserId) {
  await Promise.all([
    User.updateOne({ _id: currentUserId }, { $pull: { following: targetUserId } }),
    User.updateOne({ _id: targetUserId }, { $pull: { followers: currentUserId } }),
  ]);
  return { following: false };
}

async function listRelationships(userId, field) {
  const user = await User.findById(userId).select(field);
  if (!user) throw new AppError('User not found.', 404);
  const ids = user[field] || [];
  const users = await User.find({ _id: { $in: ids }, isActive: true });
  return users.map(serializeUser);
}

async function getFeed(userId, cursor, limit = 9) {
  const user = await User.findById(userId).select('following');
  if (!user) throw new AppError('User not found.', 404);
  const pageSize = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 9));
  const query = { authorId: { $in: user.following } };
  if (cursor) {
    let value;
    try {
      value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      if (!mongoose.isValidObjectId(value.id) || !Number.isFinite(Date.parse(value.createdAt))) throw new Error();
    } catch {
      throw new AppError('Invalid feed cursor.', 400);
    }
    query.$or = [
      { createdAt: { $lt: new Date(value.createdAt) } },
      { createdAt: new Date(value.createdAt), _id: { $lt: value.id } },
    ];
  }
  const rows = await Recipe.find(query)
    .populate('authorId', 'name username avatar bio role')
    .sort({ createdAt: -1, _id: -1 })
    .limit(pageSize + 1);
  const hasMore = rows.length > pageSize;
  const page = rows.slice(0, pageSize);
  const last = page.at(-1);
  const nextCursor = hasMore && last
    ? Buffer.from(JSON.stringify({ id: String(last._id), createdAt: last.createdAt })).toString('base64url')
    : null;
  return { recipes: page.map(serializeRecipe), nextCursor, hasMore };
}

module.exports = { follow, unfollow, listRelationships, getFeed };

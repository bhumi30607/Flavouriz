const User = require('../models/User');
const Recipe = require('../models/Recipe');
const socialService = require('../services/socialService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { serializeUser, serializeRecipe } = require('../utils/serialize');

exports.profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.isActive) throw new AppError('User not found.', 404);
  const recipes = await Recipe.find({ authorId: user._id }).sort({ createdAt: -1 });
  const profile = serializeUser(user);
  profile.recipes = recipes.map(serializeRecipe);
  profile.totalRecipes = recipes.length;
  profile.followersCount = user.followers.length;
  profile.followingCount = user.following.length;
  profile.isFollowing = req.user
    ? user.followers.some((follower) => String(follower) === req.user.id)
    : false;
  res.status(200).json({ success: true, data: profile });
});

exports.follow = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await socialService.follow(req.user.id, req.params.id) });
});

exports.unfollow = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await socialService.unfollow(req.user.id, req.params.id) });
});

exports.followers = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await socialService.listRelationships(req.params.id, 'followers') });
});

exports.following = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await socialService.listRelationships(req.params.id, 'following') });
});

const authService = require('../services/authService');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { serializeUser } = require('../utils/serialize');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, message: 'Logged in successfully.', data: result });
});

exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

exports.me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await authService.getCurrentUser(req.user.id) });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found.', 404);
  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) throw new AppError('Name cannot be blank.', 400);
    user.name = name;
  }
  if (req.body.bio !== undefined) user.bio = String(req.body.bio).trim();
  if (req.body.avatar !== undefined) user.avatar = String(req.body.avatar).trim();
  if (req.uploadedAvatar) {
    user.avatar = req.uploadedAvatar.url;
    user.avatarPublicId = req.uploadedAvatar.publicId;
  }
  await user.save();
  res.status(200).json({ success: true, message: 'Profile updated successfully.', data: serializeUser(user) });
});

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');
const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { serializeUser } = require('../utils/serialize');

exports.stats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalRecipes, featuredRecipes, totalReviews, totalComments, pendingReports, categories, recent] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Recipe.countDocuments(),
      Recipe.countDocuments({ isFeatured: true }),
      Review.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Recipe.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Recipe.find().sort({ createdAt: -1 }).limit(5).populate('authorId', 'name username avatar'),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalRecipes,
      featuredRecipes,
      totalReviews,
      totalComments,
      pendingReports,
      categoryBreakdown: Object.fromEntries(categories.map((item) => [item._id || 'General', item.count])),
      recentRecipes: recent.map((recipe) => {
        const value = require('../utils/serialize').serializeRecipe(recipe);
        value.author = recipe.authorId?.name || '';
        return value;
      }),
    },
  });
});

exports.users = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.search) {
    const pattern = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: pattern }, { username: pattern }, { email: pattern }];
  }
  if (req.query.role) query.role = req.query.role;
  const users = await User.find(query).sort({ createdAt: -1 }).limit(100);
  res.status(200).json({ success: true, data: users.map(serializeUser) });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) throw new AppError('Role must be user or admin.', 400);
  if (req.params.id === req.user.id) throw new AppError('You cannot change your own role.', 400);
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  res.status(200).json({ success: true, message: 'User role updated.', data: serializeUser(user) });
});

exports.toggleStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError('You cannot deactivate your own account.', 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({
    success: true,
    message: user.isActive ? 'User account activated.' : 'User account suspended.',
    data: serializeUser(user),
  });
});

exports.reports = asyncHandler(async (req, res) => {
  const reports = await reportService.listReports(req.query.status);
  res.status(200).json({
    success: true,
    data: reports.map((report) => ({
      ...report,
      id: String(report._id),
      targetSummary: `${report.targetType}: ${report.reason}`,
    })),
  });
});

exports.resolveReport = asyncHandler(async (req, res) => {
  const report = await reportService.resolveReport(req.params.id, req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Report resolved.',
    data: { id: String(report._id), status: report.status },
  });
});

const Report = require('../models/Report');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');

const targets = { recipe: Recipe, review: Review, comment: Comment, user: User };

async function createReport(reporterId, input) {
  if (!targets[input.targetType] || !input.targetId || !String(input.reason || '').trim()) {
    throw new AppError('A valid target type, target ID, and reason are required.', 400);
  }
  if (!(await targets[input.targetType].exists({ _id: input.targetId }))) {
    throw new AppError('Reported content was not found.', 404);
  }
  return Report.create({
    reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: String(input.reason).trim(),
    details: String(input.details || '').trim(),
  });
}

async function listReports(status) {
  const query = status ? { status } : {};
  return Report.find(query).populate('reporterId', 'name username').sort({ createdAt: -1 }).lean();
}

async function resolveReport(id, adminId, { action, notes }) {
  const report = await Report.findById(id);
  if (!report) throw new AppError('Report not found.', 404);
  if (report.status !== 'pending') throw new AppError('This report has already been resolved.', 409);

  if (action === 'remove') action = 'delete_content';
  if (action === 'suspend' || action === 'suspend_user' || action === 'ban_user') action = 'ban_user';

  if (action === 'delete_content') {
    if (report.targetType === 'recipe') {
      await require('./recipeService').deleteRecipe(String(report.targetId), { id: adminId, role: 'admin' });
    } else if (report.targetType === 'review') {
      const review = await Review.findByIdAndDelete(report.targetId);
      if (review) await require('./reviewService').updateRecipeRating(review.recipeId);
    } else if (report.targetType === 'comment') {
      await Comment.deleteOne({ _id: report.targetId });
    } else {
      throw new AppError('Choose ban_user to moderate a reported account.', 400);
    }
  } else if (action === 'ban_user') {
    if (report.targetType !== 'user') throw new AppError('Only user reports can suspend an account.', 400);
    await User.updateOne({ _id: report.targetId }, { $set: { isActive: false } });
  } else if (action !== 'dismiss') {
    throw new AppError('Choose dismiss, delete_content, or ban_user.', 400);
  }

  report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
  report.resolution = { action, notes: String(notes || '').trim(), resolvedBy: adminId };
  await report.save();
  return report;
}

module.exports = { createReport, listReports, resolveReport };

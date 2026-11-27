const reviewService = require('../services/reviewService');
const imageService = require('../services/imageService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await reviewService.listReviews(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  const photos = await imageService.uploadMany(req.files || [], `users/${req.user.id}/reviews`);
  const review = await reviewService.createReview(req.params.id, req.user.id, req.body, photos);
  res.status(201).json({ success: true, message: 'Review submitted.', data: { review } });
});

exports.update = asyncHandler(async (req, res) => {
  const photos = await imageService.uploadMany(req.files || [], `users/${req.user.id}/reviews`);
  const review = await reviewService.updateReview(req.params.id, req.user, req.body, photos);
  res.status(200).json({ success: true, data: review });
});

exports.remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Review deleted.' });
});

exports.helpful = asyncHandler(async (req, res) => {
  const result = await reviewService.toggleHelpful(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: result });
});

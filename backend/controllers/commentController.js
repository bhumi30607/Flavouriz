const commentService = require('../services/commentService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: await commentService.listComments(req.params.id) });
});

exports.create = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment(req.params.id, req.user.id, req.body.content);
  res.status(201).json({ success: true, message: 'Comment posted.', data: comment });
});

exports.update = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(req.params.id, req.user, req.body.content);
  res.status(200).json({ success: true, data: comment });
});

exports.remove = asyncHandler(async (req, res) => {
  await commentService.deleteComment(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Comment deleted.' });
});

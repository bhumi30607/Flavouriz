const socialService = require('../services/socialService');
const asyncHandler = require('../utils/asyncHandler');

module.exports = asyncHandler(async (req, res) => {
  const result = await socialService.getFeed(req.user.id, req.query.cursor, req.query.limit);
  res.status(200).json({
    success: true,
    data: result.recipes,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
});

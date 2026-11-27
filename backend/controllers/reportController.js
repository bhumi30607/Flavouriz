const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

exports.create = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Report submitted.', data: { id: String(report._id) } });
});

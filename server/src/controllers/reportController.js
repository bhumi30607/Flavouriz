import * as reportService from '../services/reportService.js';

export async function createReport(req, res, next) {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const report = await reportService.createReport(
      { targetType, targetId, reason, details },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review it.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const reports = await reportService.getAllReports({ status: req.query.status });
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveReport(req, res, next) {
  try {
    const { action, notes } = req.body;
    const report = await reportService.resolveReport(req.params.id, { action, notes }, req.user);
    res.status(200).json({
      success: true,
      message: 'Report resolved successfully.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

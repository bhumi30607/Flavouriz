import * as storage from './storageService.js';

export async function createReport({ targetType, targetId, reason, details }, user) {
  if (!targetType || !targetId || !reason) {
    const error = new Error('targetType, targetId, and reason are required for a report.');
    error.statusCode = 400;
    throw error;
  }

  const validTypes = ['recipe', 'comment', 'review', 'user'];
  if (!validTypes.includes(targetType)) {
    const error = new Error(`Invalid targetType. Must be one of: ${validTypes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const report = await storage.create('reports', {
    targetType,
    targetId,
    reason,
    details: (details || '').trim(),
    reportedByUserId: user.id,
    reportedByUsername: user.username,
    status: 'pending', // 'pending' | 'resolved' | 'dismissed'
    actionTaken: null,
    resolvedByUserId: null,
    resolvedAt: null,
  });

  return report;
}

export async function getAllReports({ status } = {}) {
  let reports = await storage.readAll('reports');

  if (status) {
    reports = reports.filter((r) => r.status === status);
  }

  reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Attach target preview details
  const enriched = await Promise.all(
    reports.map(async (rep) => {
      let targetSummary = 'Unknown Item';
      try {
        if (rep.targetType === 'recipe') {
          const item = await storage.findById('recipes', rep.targetId);
          if (item) targetSummary = `Recipe: "${item.title}" by ${item.authorName || 'User'}`;
        } else if (rep.targetType === 'comment') {
          const item = await storage.findById('comments', rep.targetId);
          if (item) targetSummary = `Comment: "${item.content.substring(0, 40)}..." by ${item.userName}`;
        } else if (rep.targetType === 'review') {
          const item = await storage.findById('reviews', rep.targetId);
          if (item) targetSummary = `Review: "${item.rating} stars - ${(item.comment || '').substring(0, 30)}..."`;
        } else if (rep.targetType === 'user') {
          const item = await storage.findById('users', rep.targetId);
          if (item) targetSummary = `User: @${item.username} (${item.name})`;
        }
      } catch (_) {}

      return {
        ...rep,
        targetSummary,
      };
    })
  );

  return enriched;
}

export async function resolveReport(reportId, { action, notes }, adminUser) {
  const report = await storage.findById('reports', reportId);
  if (!report) {
    const error = new Error('Report not found.');
    error.statusCode = 404;
    throw error;
  }

  const validActions = ['dismiss', 'delete_content', 'ban_user'];
  if (!validActions.includes(action)) {
    const error = new Error(`Action must be one of: ${validActions.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Perform moderation action
  if (action === 'delete_content') {
    if (report.targetType === 'recipe') {
      await storage.deleteById('recipes', report.targetId);
    } else if (report.targetType === 'comment') {
      await storage.deleteById('comments', report.targetId);
    } else if (report.targetType === 'review') {
      await storage.deleteById('reviews', report.targetId);
    }
  } else if (action === 'ban_user') {
    await storage.updateById('users', report.targetId, { isActive: false });
  }

  const updatedReport = await storage.updateById('reports', reportId, {
    status: action === 'dismiss' ? 'dismissed' : 'resolved',
    actionTaken: action,
    adminNotes: notes || '',
    resolvedByUserId: adminUser.id,
    resolvedAt: new Date().toISOString(),
  });

  return updatedReport;
}

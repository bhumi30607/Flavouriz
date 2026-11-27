const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['recipe', 'review', 'comment', 'user'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true, trim: true, maxlength: 100 },
  details: { type: String, default: '', trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
  resolution: { action: String, notes: String, resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

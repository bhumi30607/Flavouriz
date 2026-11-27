const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', trim: true, maxlength: 2000 },
  photos: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
  }],
  helpfulCount: { type: Number, default: 0, min: 0 },
  helpfulVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

reviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

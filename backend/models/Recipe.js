const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  amount: { type: String, default: '', trim: true, maxlength: 40 },
  unit: { type: String, default: '', trim: true, maxlength: 40 },
}, { _id: false });

const instructionSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true, min: 1 },
  instruction: { type: String, required: true, trim: true, maxlength: 2000 },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  category: { type: String, default: 'General', trim: true, index: true },
  cuisine: { type: String, required: true, trim: true, index: true },
  diet: { type: String, default: '', trim: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy', index: true },
  prepTimeMinutes: { type: Number, default: 0, min: 0, max: 1440 },
  cookTimeMinutes: { type: Number, default: 0, min: 0, max: 1440 },
  totalTimeMinutes: { type: Number, default: 0, min: 0, max: 2880 },
  servings: { type: Number, default: 4, min: 1, max: 100 },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  ingredients: { type: [ingredientSchema], validate: (items) => items.length > 0 },
  instructions: { type: [instructionSchema], validate: (items) => items.length > 0 },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0, min: 0 },
  favoritesCount: { type: Number, default: 0, min: 0 },
  isFeatured: { type: Boolean, default: false, index: true },
}, { timestamps: true });

recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
  tags: 'text',
}, {
  weights: { title: 10, tags: 5, 'ingredients.name': 4, description: 2 },
  name: 'recipe_search',
});
recipeSchema.index({ createdAt: -1, _id: -1 });
recipeSchema.index({ averageRating: -1, reviewsCount: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);

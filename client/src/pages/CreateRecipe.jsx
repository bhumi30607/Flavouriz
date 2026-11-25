import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  Clock,
  Users,
  ChefHat,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const CUISINES = ['Italian', 'Mexican', 'Indian', 'Mediterranean', 'Asian', 'American', 'French', 'Global'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function CreateRecipe() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Dinner',
    cuisine: 'Italian',
    difficulty: 'Easy',
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    imageUrl: '',
    tags: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Dynamic ingredients list
  const [ingredients, setIngredients] = useState([
    { name: '', amount: '', unit: '' },
    { name: '', amount: '', unit: '' },
    { name: '', amount: '', unit: '' },
  ]);

  // Dynamic instruction steps
  const [instructions, setInstructions] = useState([
    { instruction: '' },
    { instruction: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Handle Image File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file exceeds the 5MB size limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addIngredientRow = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredientRow = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Instructions handlers
  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index].instruction = value;
    setInstructions(updated);
  };

  const addInstructionStep = () => {
    setInstructions([...instructions, { instruction: '' }]);
  };

  const removeInstructionStep = (index) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a title and a description for your recipe.');
      return;
    }

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const validInstructions = instructions.filter((step) => step.instruction.trim() !== '');
    if (validInstructions.length === 0) {
      setError('Please add at least one cooking instruction step.');
      return;
    }

    try {
      setLoading(true);

      // If an image file was selected, use FormData multipart upload
      if (imageFile) {
        const payload = new FormData();
        payload.append('title', formData.title.trim());
        payload.append('description', formData.description.trim());
        payload.append('category', formData.category);
        payload.append('cuisine', formData.cuisine);
        payload.append('difficulty', formData.difficulty);
        payload.append('prepTimeMinutes', String(formData.prepTimeMinutes));
        payload.append('cookTimeMinutes', String(formData.cookTimeMinutes));
        payload.append('servings', String(formData.servings));
        payload.append('ingredients', JSON.stringify(validIngredients));
        payload.append('instructions', JSON.stringify(validInstructions));
        payload.append('image', imageFile);

        const tagsArray = formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        payload.append('tags', JSON.stringify(tagsArray));

        const res = await recipeApi.createRecipe(payload);
        showToast('Recipe published successfully!');
        navigate(`/recipes/${res.data.id}`);
      } else {
        // Send as JSON
        const tagsArray = formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        const res = await recipeApi.createRecipe({
          ...formData,
          ingredients: validIngredients,
          instructions: validInstructions,
          tags: tagsArray,
        });

        showToast('Recipe published successfully!');
        navigate(`/recipes/${res.data.id}`);
      }
    } catch (err) {
      console.error('Create recipe error:', err);
      setError(err.message || 'Failed to create recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
          Flavouriz Kitchen Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green">
          Share Your Recipe
        </h1>
        <p className="text-sm text-charcoal-light mt-1">
          Publish your culinary creation with clear measurements, cooking steps, and appetizing photos.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BASIC RECIPE INFO CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-6">
          <h2 className="font-serif text-xl font-bold text-forest-green border-b border-gray-100 pb-3">
            General Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Recipe Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Creamy Tuscan Garlic Butter Salmon"
              className="w-full px-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Short Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe the flavors, texture, and why you love making this dish..."
              className="w-full p-4 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 leading-relaxed"
              required
            />
          </div>

          {/* Category, Cuisine, Difficulty Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Cuisine
              </label>
              <select
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              >
                {CUISINES.map((cui) => (
                  <option key={cui} value={cui}>
                    {cui}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prep, Cook Time, Servings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                name="prepTimeMinutes"
                value={formData.prepTimeMinutes}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Cook Time (minutes)
              </label>
              <input
                type="number"
                name="cookTimeMinutes"
                value={formData.cookTimeMinutes}
                onChange={handleInputChange}
                min="0"
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Servings (portions)
              </label>
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                min="1"
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-semibold text-charcoal"
              />
            </div>
          </div>
        </div>

        {/* RECIPE IMAGE UPLOAD CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-forest-green border-b border-gray-100 pb-3">
            Recipe Photography
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* File Upload via Multer */}
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-2">
                Upload Image File (Max 5MB)
              </label>
              <div className="border-2 border-dashed border-forest-green/20 hover:border-terracotta rounded-2xl p-6 text-center transition-colors bg-cream/30">
                <Upload className="w-8 h-8 text-terracotta mx-auto mb-2" />
                <p className="text-xs text-charcoal-light font-medium mb-2">
                  Drag and drop or choose file
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-forest-green file:text-cream hover:file:bg-forest-green-light cursor-pointer"
                />
              </div>
            </div>

            {/* Image URL fallback */}
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-2">
                Or Provide an Online Image URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>

              {/* Preview */}
              {imagePreview && (
                <div className="mt-3 relative aspect-video rounded-xl overflow-hidden bg-cream border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                    onError={() => setError('Image preview failed. Please check the URL or file.')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INGREDIENTS CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest-green">Ingredients List *</h2>
              <p className="text-xs text-gray-400">Specify precise amounts and units</p>
            </div>
            <button
              type="button"
              onClick={addIngredientRow}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-cream text-forest-green hover:bg-forest-green hover:text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {/* Ingredient name */}
                <input
                  type="text"
                  placeholder="Ingredient name (e.g. Pecorino Romano)"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  className="flex-grow p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
                {/* Amount */}
                <input
                  type="text"
                  placeholder="Amount (e.g. 1/2)"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                  className="w-28 p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
                {/* Unit */}
                <input
                  type="text"
                  placeholder="Unit (e.g. cup, g)"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  className="w-24 p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeIngredientRow(idx)}
                  disabled={ingredients.length <= 1}
                  className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                  aria-label="Remove ingredient"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUCTIONS CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest-green">Cooking Instructions *</h2>
              <p className="text-xs text-gray-400">Write numbered, sequential preparation steps</p>
            </div>
            <button
              type="button"
              onClick={addInstructionStep}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-cream text-forest-green hover:bg-forest-green hover:text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-forest-green text-cream font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                  {idx + 1}
                </div>
                <textarea
                  rows={2}
                  placeholder={`Step ${idx + 1} description...`}
                  value={step.instruction}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  className="flex-grow p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
                <button
                  type="button"
                  onClick={() => removeInstructionStep(idx)}
                  disabled={instructions.length <= 1}
                  className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20 transition-colors mt-1"
                  aria-label="Remove step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TAGS CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-2">
          <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1">
            Tags (Comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="e.g. Pasta, Italian Classics, Comfort Food, Quick"
            className="w-full px-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full border border-gray-200 text-xs font-bold text-charcoal hover:bg-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-dark text-white font-bold text-sm shadow-soft transition-all flex items-center gap-2"
          >
            <span>{loading ? 'Publishing Recipe...' : 'Publish Recipe'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </div>
  );
}

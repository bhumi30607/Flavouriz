import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import {
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const CUISINES = ['Italian', 'Mexican', 'Indian', 'Mediterranean', 'Asian', 'American', 'French', 'Global'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function EditRecipe() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true);
        const res = await recipeApi.getRecipeById(id);
        const recipe = res.data;

        // Check ownership
        if (user && String(recipe.authorId) !== String(user.id) && !isAdmin) {
          showToast('You do not have permission to edit this recipe.', 'error');
          navigate(`/recipes/${id}`);
          return;
        }

        setFormData({
          title: recipe.title || '',
          description: recipe.description || '',
          category: recipe.category || 'Dinner',
          cuisine: recipe.cuisine || 'Italian',
          difficulty: recipe.difficulty || 'Easy',
          prepTimeMinutes: recipe.prepTimeMinutes || 15,
          cookTimeMinutes: recipe.cookTimeMinutes || 25,
          servings: recipe.servings || 4,
          imageUrl: recipe.imageUrl || '',
          tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
        });

        setImagePreview(recipe.imageUrl || '');

        setIngredients(
          Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0
            ? recipe.ingredients.map((ing) => ({
                name: typeof ing === 'string' ? ing : ing.name || '',
                amount: typeof ing === 'object' ? ing.amount || '' : '',
                unit: typeof ing === 'object' ? ing.unit || '' : '',
              }))
            : [{ name: '', amount: '', unit: '' }]
        );

        setInstructions(
          Array.isArray(recipe.instructions) && recipe.instructions.length > 0
            ? recipe.instructions.map((step) => ({
                instruction: typeof step === 'string' ? step : step.instruction || step.text || '',
              }))
            : [{ instruction: '' }]
        );
      } catch (err) {
        setError(err.message || 'Failed to load recipe.');
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id, user, isAdmin]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    if (validIngredients.length === 0) {
      setError('Please provide at least one ingredient.');
      return;
    }

    const validInstructions = instructions.filter((step) => step.instruction.trim() !== '');
    if (validInstructions.length === 0) {
      setError('Please provide at least one cooking instruction step.');
      return;
    }

    try {
      setSubmitting(true);

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

        await recipeApi.updateRecipe(id, payload);
      } else {
        const tagsArray = formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        await recipeApi.updateRecipe(id, {
          ...formData,
          ingredients: validIngredients,
          instructions: validInstructions,
          tags: tagsArray,
        });
      }

      showToast('Recipe updated successfully!');
      navigate(`/recipes/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recipe details for editing..." />;
  }

  if (error && !formData.title) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
            Recipe Editor
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest-green">
            Edit Recipe
          </h1>
        </div>
        <button
          onClick={() => navigate(`/recipes/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-green hover:text-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipe</span>
        </button>
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
              className="w-full px-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-4 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 leading-relaxed"
              required
            />
          </div>

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
                Servings
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

        {/* IMAGE CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-forest-green border-b border-gray-100 pb-3">
            Update Photograph
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-2">
                Replace with Upload (Max 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-forest-green file:text-cream cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-2">
                Or Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => {
                  handleInputChange(e);
                  setImagePreview(e.target.value);
                }}
                className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="mt-4 relative aspect-[21/9] rounded-2xl overflow-hidden bg-cream border border-gray-200 max-h-48">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* INGREDIENTS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-serif text-xl font-bold text-forest-green">Ingredients</h2>
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
                <input
                  type="text"
                  placeholder="Ingredient"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  className="flex-grow p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="Amount"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                  className="w-28 p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ing.unit}
                  onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  className="w-24 p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeIngredientRow(idx)}
                  disabled={ingredients.length <= 1}
                  className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-serif text-xl font-bold text-forest-green">Instructions</h2>
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
                  value={step.instruction}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  className="flex-grow p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => removeInstructionStep(idx)}
                  disabled={instructions.length <= 1}
                  className="p-3 text-gray-400 hover:text-red-600 disabled:opacity-20 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(`/recipes/${id}`)}
            className="px-6 py-3 rounded-full border border-gray-200 text-xs font-bold text-charcoal hover:bg-cream"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-full bg-forest-green hover:bg-forest-green-light text-cream font-bold text-sm shadow-soft transition-all flex items-center gap-2"
          >
            <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </button>
        </div>

      </form>
    </div>
  );
}

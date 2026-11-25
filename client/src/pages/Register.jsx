import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { UtensilsCrossed, User, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio || 'Excited home cook sharing recipes on Flavouriz!',
      });
      showToast('Welcome to Flavouriz! Your account is created.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-forest-green/10 shadow-card">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-forest-green flex items-center justify-center mx-auto mb-4 text-cream shadow-soft">
            <UtensilsCrossed className="w-6 h-6 text-terracotta" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
            Start Your Culinary Journey
          </span>
          <h2 className="font-serif text-3xl font-bold text-forest-green">
            Join Flavouriz
          </h2>
          <p className="text-xs text-charcoal-light mt-1">
            Create an account to publish, rate, and collect delicious recipes.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Chef Maria Silva"
                className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <span className="text-sm font-bold text-gray-400">@</span>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="maria_cooks"
                className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="maria@example.com"
                className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
                Confirm *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-type"
                  className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Short Bio (Optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={2}
              placeholder="Tell other food lovers what cuisines you like to cook..."
              className="w-full p-3 bg-cream/40 rounded-xl border border-gray-200 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-forest-green hover:bg-forest-green-light text-cream font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-terracotta hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}

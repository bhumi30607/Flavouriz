import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { UtensilsCrossed, Mail, Lock, ArrowRight, Shield, ChefHat } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Logged in successfully! Welcome back.');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for teachers & evaluators
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    try {
      setLoading(true);
      await login(demoEmail, demoPassword);
      showToast(`Logged in as ${demoEmail.split('@')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed.');
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
            Welcome Back, Chef
          </span>
          <h2 className="font-serif text-3xl font-bold text-forest-green">
            Sign In to Flavouriz
          </h2>
          <p className="text-xs text-charcoal-light mt-1">
            Access your cookbook, manage your recipes, and connect.
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
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@flavouriz.com"
                className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-full bg-forest-green hover:bg-forest-green-light text-cream font-bold text-sm shadow-soft transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </button>
        </form>

        {/* DEMO ACCOUNTS QUICK-LOGIN (Viva & Testing Aid) */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
            Quick One-Click Demo Logins
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@flavouriz.com', 'Admin@12345')}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-forest-green/5 hover:bg-forest-green/10 border border-forest-green/15 text-xs text-forest-green font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-terracotta" />
                <span>Admin: Alessandro</span>
              </div>
              <span className="text-[10px] text-gray-400">admin@flavouriz.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@flavouriz.com', 'Chef@12345')}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-cream/80 hover:bg-cream border border-forest-green/10 text-xs text-forest-green font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-forest-green" />
                <span>Chef: Sarah Jenkins</span>
              </div>
              <span className="text-[10px] text-gray-400">sarah@flavouriz.com</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          New to Flavouriz?{' '}
          <Link to="/register" className="font-bold text-terracotta hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

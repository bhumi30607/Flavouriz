import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  UtensilsCrossed,
  PlusCircle,
  Bookmark,
  BookOpen,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Compass,
  Search,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#263D2C]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-forest-green flex items-center justify-center text-cream shadow-soft group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-forest-green">
                Flavouriz
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-terracotta -mt-1">
                Culinary Community
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors hover:text-terracotta ${
                location.pathname === '/' ? 'text-forest-green font-bold' : 'text-charcoal-light'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors hover:text-terracotta ${
                location.pathname === '/explore' ? 'text-forest-green font-bold' : 'text-charcoal-light'
              }`}
            >
              <Compass className="w-4 h-4 text-terracotta" />
              Explore Recipes
            </Link>
            {isAuthenticated && (
              <Link
                to="/cookbook"
                className={`text-sm font-semibold flex items-center gap-1.5 transition-colors hover:text-terracotta ${
                  location.pathname === '/cookbook' ? 'text-forest-green font-bold' : 'text-charcoal-light'
                }`}
              >
                <Bookmark className="w-4 h-4 text-terracotta" />
                My Cookbook
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/recipes/create"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta text-white font-medium text-sm hover:bg-terracotta-dark shadow-soft transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Share Recipe</span>
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-forest-green/20 hover:border-terracotta transition-all bg-white shadow-sm"
                    aria-label="User menu"
                  >
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
                      alt={user?.name || 'User avatar'}
                      className="w-8 h-8 rounded-full object-cover bg-cream"
                      onError={(e) => {
                        e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef';
                      }}
                    />
                    <span className="text-xs font-bold text-forest-green px-1 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-[#263D2C]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-forest-green truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/profile/${user?.id}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-charcoal hover:bg-cream/60 transition-colors"
                        >
                          <User className="w-4 h-4 text-forest-green" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/my-recipes"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-charcoal hover:bg-cream/60 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-terracotta" />
                          <span>My Recipes</span>
                        </Link>
                        <Link
                          to="/cookbook"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-charcoal hover:bg-cream/60 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-forest-green" />
                          <span>My Cookbook</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-terracotta font-semibold hover:bg-terracotta/10 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-terracotta" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-forest-green hover:text-terracotta transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full bg-forest-green text-cream font-medium text-sm hover:bg-forest-green-light shadow-soft transition-all duration-200"
                >
                  Join Flavouriz
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-forest-green hover:bg-cream transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#263D2C]/10 bg-cream/98 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-base font-medium text-forest-green hover:bg-white"
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="block px-3 py-2 rounded-lg text-base font-medium text-forest-green hover:bg-white"
          >
            Explore Recipes
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/recipes/create"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-terracotta hover:bg-white"
              >
                + Create New Recipe
              </Link>
              <Link
                to="/cookbook"
                className="block px-3 py-2 rounded-lg text-base font-medium text-forest-green hover:bg-white"
              >
                My Cookbook
              </Link>
              <Link
                to="/my-recipes"
                className="block px-3 py-2 rounded-lg text-base font-medium text-forest-green hover:bg-white"
              >
                My Published Recipes
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                className="block px-3 py-2 rounded-lg text-base font-medium text-forest-green hover:bg-white"
              >
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-lg text-base font-bold text-terracotta hover:bg-white"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-3 border-t border-forest-green/10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-white"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2 border-t border-forest-green/10">
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-full border border-forest-green text-forest-green font-medium text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 rounded-full bg-forest-green text-cream font-medium text-sm"
              >
                Join Flavouriz
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

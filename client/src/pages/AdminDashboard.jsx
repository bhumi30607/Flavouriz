import React, { useState, useEffect } from 'react';
import { adminApi, recipeApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import {
  Shield,
  Users,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  Search,
} from 'lucide-react';

export default function AdminDashboard() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reports' | 'recipes' | 'users'
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected report resolution modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('dismiss');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, recipesRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getReports(),
        recipeApi.getRecipes({ limit: 50 }),
        adminApi.getUsers(),
      ]);

      setStats(statsRes.data);
      setReports(reportsRes.data || []);
      setRecipes(recipesRes.data || []);
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      showToast(err.message || 'Error loading admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Report Resolution
  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setResolving(true);
      await adminApi.resolveReport(selectedReport.id, {
        action: resolutionAction,
        notes: resolutionNotes,
      });

      showToast(`Report ${resolutionAction === 'dismiss' ? 'dismissed' : 'resolved'}.`);
      setSelectedReport(null);
      setResolutionNotes('');

      // Refresh reports & stats
      const [reportsRes, statsRes, recipesRes] = await Promise.all([
        adminApi.getReports(),
        adminApi.getStats(),
        recipeApi.getRecipes({ limit: 50 }),
      ]);
      setReports(reportsRes.data || []);
      setStats(statsRes.data);
      setRecipes(recipesRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to resolve report.', 'error');
    } finally {
      setResolving(false);
    }
  };

  // Toggle Recipe Featured
  const handleToggleFeatured = async (recipeId) => {
    try {
      const res = await adminApi.toggleFeatured(recipeId);
      showToast(res.message);
      setRecipes(
        recipes.map((r) => (r.id === recipeId ? { ...r, isFeatured: res.data.isFeatured } : r))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update featured state.', 'error');
    }
  };

  // Delete recipe as admin
  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe from the platform?')) return;
    try {
      await recipeApi.deleteRecipe(recipeId);
      showToast('Recipe deleted by admin.');
      setRecipes(recipes.filter((r) => r.id !== recipeId));
    } catch (err) {
      showToast(err.message || 'Failed to delete recipe.', 'error');
    }
  };

  // Toggle User Status (Active/Suspended)
  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await adminApi.toggleUserStatus(userId);
      showToast(res.message);
      setUsersList(
        usersList.map((u) => (u.id === userId ? { ...u, isActive: res.data.isActive } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle user status.', 'error');
    }
  };

  // Toggle Role (Admin <-> User)
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      showToast(`User role changed to ${newRole}.`);
      setUsersList(
        usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update role.', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading administrative intelligence..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-forest-green/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-green text-cream flex items-center justify-center shadow-soft">
            <Shield className="w-6 h-6 text-terracotta" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta block">
              Platform Governance
            </span>
            <h1 className="font-serif text-3xl font-bold text-forest-green">
              Admin Moderation Center
            </h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-forest-green/10 shadow-sm self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reports', label: `Reports (${stats?.pendingReports || 0})` },
            { id: 'recipes', label: `Recipes (${recipes.length})` },
            { id: 'users', label: `Users (${usersList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-forest-green text-cream shadow-sm'
                  : 'text-charcoal hover:bg-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-terracotta" />
                <span className="text-[10px] font-bold uppercase bg-cream px-2 py-0.5 rounded-full text-forest-green">
                  Active
                </span>
              </div>
              <span className="font-serif text-3xl font-bold text-forest-green block">
                {stats.totalUsers}
              </span>
              <span className="text-xs text-gray-400">Total Registered Members</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-5 h-5 text-forest-green" />
                <span className="text-[10px] font-bold uppercase bg-cream px-2 py-0.5 rounded-full text-terracotta">
                  {stats.featuredRecipes} Featured
                </span>
              </div>
              <span className="font-serif text-3xl font-bold text-forest-green block">
                {stats.totalRecipes}
              </span>
              <span className="text-xs text-gray-400">Published Recipes</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold uppercase bg-cream px-2 py-0.5 rounded-full text-forest-green">
                  Ratings
                </span>
              </div>
              <span className="font-serif text-3xl font-bold text-forest-green block">
                {stats.totalReviews}
              </span>
              <span className="text-xs text-gray-400">Community Reviews</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-forest-green/10 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>
              <span className="font-serif text-3xl font-bold text-red-600 block">
                {stats.pendingReports}
              </span>
              <span className="text-xs text-gray-400">Flags Awaiting Review</span>
            </div>
          </div>

          {/* Category Breakdown & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft">
              <h3 className="font-serif text-xl font-bold text-forest-green mb-4">
                Recipe Category Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.categoryBreakdown || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal">{category}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-cream rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-forest-green h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (count / (stats.totalRecipes || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-terracotta w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft">
              <h3 className="font-serif text-xl font-bold text-forest-green mb-4">
                Recent Recipe Submissions
              </h3>
              <div className="space-y-3">
                {stats.recentRecipes?.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-cream/40 text-xs"
                  >
                    <div>
                      <p className="font-bold text-forest-green">{r.title}</p>
                      <p className="text-[10px] text-gray-400">By {r.authorName || 'Chef'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white text-forest-green font-semibold">
                      {r.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-green">Community Reports</h2>
              <p className="text-xs text-gray-500">Review reported recipes, comments, or users</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cream text-xs font-bold text-forest-green">
              {reports.length} Total Reports
            </span>
          </div>

          <div className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    report.status === 'pending'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-cream/20 border-gray-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-green text-cream">
                        {report.targetType}
                      </span>
                      <span className="text-xs font-bold text-red-600 uppercase">
                        Reason: {report.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Status: {report.status}
                      </span>
                      {report.status === 'pending' && (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-3.5 py-1.5 rounded-full bg-terracotta hover:bg-terracotta-dark text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          Take Action
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-bold text-forest-green mb-1">
                    {report.targetSummary || `Target ID: ${report.targetId}`}
                  </p>

                  {report.details && (
                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                      "{report.details}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 text-[10px] text-gray-400">
                    <span>Reported by: @{report.reportedByUsername || 'user'}</span>
                    <span>Date: {new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-sm text-gray-400">
                All clear! No reports currently require moderation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE RECIPES */}
      {activeTab === 'recipes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-green">Manage All Recipes</h2>
              <p className="text-xs text-gray-500">Feature recipes on the homepage or remove violations</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cream text-xs font-bold text-forest-green">
              {recipes.length} Recipes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Recipe</th>
                  <th className="pb-3 font-bold">Chef</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Rating</th>
                  <th className="pb-3 font-bold">Featured</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recipes.map((r) => (
                  <tr key={r.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-forest-green max-w-[200px] truncate">
                      {r.title}
                    </td>
                    <td className="py-3 text-gray-600">{r.authorName || 'Chef'}</td>
                    <td className="py-3 text-gray-600">{r.category}</td>
                    <td className="py-3 text-gray-600">
                      ★ {Number(r.averageRating || 0).toFixed(1)} ({r.reviewsCount || 0})
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleFeatured(r.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] transition-colors ${
                          r.isFeatured
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{r.isFeatured ? 'Featured' : 'Not Featured'}</span>
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteRecipe(r.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-green/10 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-2xl font-bold text-forest-green">User Directory</h2>
              <p className="text-xs text-gray-500">Manage member privileges and account statuses</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-cream text-xs font-bold text-forest-green">
              {usersList.length} Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 font-bold">User</th>
                  <th className="pb-3 font-bold">Email</th>
                  <th className="pb-3 font-bold">Role</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-forest-green">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover bg-cream"
                        />
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[10px] text-gray-400">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{u.email}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          u.role === 'admin'
                            ? 'bg-forest-green text-cream'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Click to toggle admin/user"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          u.isActive !== false
                            ? 'bg-red-50 hover:bg-red-100 text-red-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.isActive !== false ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title="Resolve Moderation Report"
      >
        <form onSubmit={handleResolveReport} className="space-y-4">
          <p className="text-xs text-gray-500">
            Target: <strong>{selectedReport?.targetSummary}</strong>
          </p>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1">
              Action to Take
            </label>
            <select
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
              className="w-full p-2.5 bg-cream/50 rounded-xl border border-gray-200 text-xs font-semibold"
            >
              <option value="dismiss">Dismiss report (Content is acceptable)</option>
              <option value="delete_content">Delete reported content immediately</option>
              <option value="ban_user">Suspend target user account</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1">
              Admin Moderation Notes
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="Record reason for this moderation action..."
              className="w-full p-3 bg-cream/50 rounded-xl border border-gray-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-xs font-bold shadow-sm"
            >
              {resolving ? 'Executing...' : 'Apply Resolution'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

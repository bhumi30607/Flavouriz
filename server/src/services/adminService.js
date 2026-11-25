import * as storage from './storageService.js';
import { sanitizeUser } from './authService.js';

export async function getAdminStats() {
  const users = await storage.readAll('users');
  const recipes = await storage.readAll('recipes');
  const reviews = await storage.readAll('reviews');
  const comments = await storage.readAll('comments');
  const reports = await storage.readAll('reports');

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const totalRecipes = recipes.length;
  const featuredRecipes = recipes.filter((r) => r.isFeatured === true).length;
  const totalReviews = reviews.length;
  const totalComments = comments.length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;

  // Compute category breakdown
  const categoryCount = {};
  recipes.forEach((r) => {
    const cat = r.category || 'Other';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // Recent 5 recipes
  const recentRecipes = [...recipes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      title: r.title,
      authorName: r.authorName,
      category: r.category,
      createdAt: r.createdAt,
    }));

  return {
    totalUsers,
    activeUsers,
    totalRecipes,
    featuredRecipes,
    totalReviews,
    totalComments,
    pendingReports,
    categoryBreakdown: categoryCount,
    recentRecipes,
  };
}

export async function getAllUsers({ search = '', role = '' } = {}) {
  let users = await storage.readAll('users');

  if (role) {
    users = users.filter((u) => u.role === role);
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    users = users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
    );
  }

  return users.map((u) => sanitizeUser(u));
}

export async function updateUserRole(userId, newRole) {
  if (!['admin', 'user'].includes(newRole)) {
    const error = new Error("Role must be 'admin' or 'user'.");
    error.statusCode = 400;
    throw error;
  }

  const user = await storage.findById('users', userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const updated = await storage.updateById('users', userId, { role: newRole });
  return sanitizeUser(updated);
}

export async function toggleUserStatus(userId) {
  const user = await storage.findById('users', userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const newStatus = user.isActive === false ? true : false;
  const updated = await storage.updateById('users', userId, { isActive: newStatus });
  return sanitizeUser(updated);
}

export async function toggleRecipeFeatured(recipeId) {
  const recipe = await storage.findById('recipes', recipeId);
  if (!recipe) {
    const error = new Error('Recipe not found.');
    error.statusCode = 404;
    throw error;
  }

  const isFeatured = !recipe.isFeatured;
  const updated = await storage.updateById('recipes', recipeId, { isFeatured });
  return updated;
}

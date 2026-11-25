const API_BASE_URL = '/api';

/**
 * Retrieve auth token from localStorage if present
 */
export function getStoredToken() {
  return localStorage.getItem('flavouriz_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('flavouriz_token', token);
  } else {
    localStorage.removeItem('flavouriz_token');
  }
}

/**
 * Core HTTP client using native Fetch API
 */
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, error: 'Failed to parse server response.' };
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==================== AUTH API ====================
export const authApi = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me'),
};

// ==================== RECIPES API ====================
export const recipeApi = {
  getRecipes: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/recipes${queryString}`);
  },

  getRecipeById: (id) => request(`/recipes/${id}`),

  createRecipe: (formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request('/recipes', {
      method: 'POST',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  updateRecipe: (id, formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request(`/recipes/${id}`, {
      method: 'PATCH',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  deleteRecipe: (id) =>
    request(`/recipes/${id}`, {
      method: 'DELETE',
    }),

  getMyRecipes: () => request('/users/me/recipes'),
};

// ==================== FAVORITES API ====================
export const favoriteApi = {
  getFavorites: () => request('/favorites'),

  addFavorite: (recipeId) =>
    request(`/favorites/${recipeId}`, {
      method: 'POST',
    }),

  removeFavorite: (recipeId) =>
    request(`/favorites/${recipeId}`, {
      method: 'DELETE',
    }),
};

// ==================== REVIEWS API ====================
export const reviewApi = {
  getReviewsForRecipe: (recipeId) => request(`/recipes/${recipeId}/reviews`),

  addReview: (recipeId, reviewData) =>
    request(`/recipes/${recipeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  updateReview: (reviewId, reviewData) =>
    request(`/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    }),

  deleteReview: (reviewId) =>
    request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// ==================== COMMENTS API ====================
export const commentApi = {
  getCommentsForRecipe: (recipeId) => request(`/recipes/${recipeId}/comments`),

  addComment: (recipeId, commentData) =>
    request(`/recipes/${recipeId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),

  updateComment: (commentId, commentData) =>
    request(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify(commentData),
    }),

  deleteComment: (commentId) =>
    request(`/comments/${commentId}`, {
      method: 'DELETE',
    }),
};

// ==================== USERS API ====================
export const userApi = {
  getProfile: (id) => request(`/users/${id}`),

  updateMyProfile: (formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request('/users/me', {
      method: 'PATCH',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },
};

// ==================== REPORTS & ADMIN API ====================
export const reportApi = {
  createReport: (reportData) =>
    request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
};

export const adminApi = {
  getStats: () => request('/admin/stats'),

  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },

  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  toggleUserStatus: (id) =>
    request(`/admin/users/${id}/status`, {
      method: 'PATCH',
    }),

  toggleFeatured: (id) =>
    request(`/admin/recipes/${id}/featured`, {
      method: 'PATCH',
    }),

  getReports: (status = '') =>
    request(`/admin/reports${status ? `?status=${status}` : ''}`),

  resolveReport: (id, resolution) =>
    request(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(resolution),
    }),
};

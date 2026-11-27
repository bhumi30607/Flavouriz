import axios from 'axios';

const API_BASE_URL = '/api';
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 &&
      !['/auth/login', '/auth/register'].includes(error.config?.url)) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

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
  try {
    const body = options.body;
    const data = body instanceof FormData
      ? body
      : typeof body === 'string' && body
        ? JSON.parse(body)
        : body;
    const response = await apiClient.request({
      url: endpoint,
      method: options.method || 'GET',
      data,
      headers: options.headers,
      signal: options.signal,
    });
    return response.data;
  } catch (cause) {
    if (cause.response) {
      const data = cause.response.data;
      const error = new Error(data?.error || data?.message || `Request failed with status ${cause.response.status}`);
      error.status = cause.response.status;
      error.data = data;
      throw error;
    }
    throw cause;
  }
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

  markHelpful: (reviewId) =>
    request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
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

  follow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),

  unfollow: (id) => request(`/users/${id}/follow`, { method: 'DELETE' }),

  getFollowers: (id) => request(`/users/${id}/followers`),

  getFollowing: (id) => request(`/users/${id}/following`),

  updateMyProfile: (formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request('/users/me', {
      method: 'PATCH',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },
};

export const feedApi = {
  getFeed: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/feed${query ? `?${query}` : ''}`);
  },
};

export const collectionApi = {
  getCollections: () => request('/collections'),

  createCollection: (name) =>
    request('/collections', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  renameCollection: (id, name) =>
    request(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),

  deleteCollection: (id) =>
    request(`/collections/${id}`, {
      method: 'DELETE',
    }),

  addRecipe: (collectionId, recipeId) =>
    request(`/collections/${collectionId}/recipes/${recipeId}`, {
      method: 'POST',
    }),

  removeRecipe: (collectionId, recipeId) =>
    request(`/collections/${collectionId}/recipes/${recipeId}`, {
      method: 'DELETE',
    }),

  getShoppingList: (recipeIds, servings = {}) =>
    request('/collections/shopping-list', {
      method: 'POST',
      body: JSON.stringify({ recipeIds, servings }),
    }),
};

export const uploadApi = {
  getSignature: () => request('/uploads/signature'),

  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return request('/uploads', { method: 'POST', body: formData });
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getStoredToken, setStoredToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user on initial application mount
  useEffect(() => {
    async function initAuth() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setStoredToken(null);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        setStoredToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setStoredToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.error || 'Login failed.');
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    if (response.success && response.data) {
      setStoredToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response.error || 'Registration failed.');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

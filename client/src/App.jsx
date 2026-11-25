import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import MyCookbook from './pages/MyCookbook.jsx';
import UserProfile from './pages/UserProfile.jsx';
import EditProfile from './pages/EditProfile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-cream">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/recipes/:id" element={<RecipeDetails />} />
                <Route path="/profile/:id" element={<UserProfile />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route
                  path="/recipes/create"
                  element={
                    <ProtectedRoute>
                      <CreateRecipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recipes/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditRecipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cookbook"
                  element={
                    <ProtectedRoute>
                      <MyCookbook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-recipes"
                  element={
                    <ProtectedRoute>
                      <MyRecipes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Restricted Route */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

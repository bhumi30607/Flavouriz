import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User, Upload, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar file exceeds 5MB size limit.');
        return;
      }
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name cannot be blank.');
      return;
    }

    try {
      setLoading(true);

      let updatedUserData;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('bio', bio.trim());
        formData.append('avatar', avatarFile);
        const res = await userApi.updateMyProfile(formData);
        updatedUserData = res.data;
      } else {
        const res = await userApi.updateMyProfile({
          name: name.trim(),
          bio: bio.trim(),
          avatar: avatarUrl.trim(),
        });
        updatedUserData = res.data;
      }

      updateUser(updatedUserData);
      showToast('Profile updated successfully!');
      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-forest-green/10 shadow-soft">
        
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta mb-1 block">
              Account Settings
            </span>
            <h1 className="font-serif text-3xl font-bold text-forest-green">
              Edit Profile
            </h1>
          </div>
          <button
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-green hover:text-terracotta"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Preview & Selection */}
          <div className="flex items-center gap-6">
            <img
              src={preview || 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef'}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-forest-green/20 bg-cream shadow-sm"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=chef';
              }}
            />
            <div className="space-y-2 flex-grow">
              <label className="block text-xs font-bold text-forest-green uppercase tracking-wider">
                Change Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cream file:text-forest-green hover:file:bg-forest-green hover:file:text-white cursor-pointer"
              />
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setPreview(e.target.value);
                }}
                placeholder="Or paste an online photo URL..."
                className="w-full p-2.5 bg-cream/40 rounded-xl border border-gray-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-cream/40 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-green uppercase tracking-wider mb-1.5">
              Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell other foodies about your cooking philosophy and favorite culinary traditions..."
              className="w-full p-4 bg-cream/40 rounded-xl border border-gray-200 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/profile/${user?.id}`)}
              className="px-6 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-charcoal hover:bg-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-full bg-forest-green hover:bg-forest-green-light text-cream text-xs font-bold shadow-soft transition-all"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

import * as storage from '../services/storageService.js';
import { sanitizeUser } from '../services/authService.js';

export async function getUserProfile(req, res, next) {
  try {
    const user = await storage.findById('users', req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Get published recipes by this user
    const userRecipes = await storage.find('recipes', (r) => String(r.authorId) === String(user.id));

    res.status(200).json({
      success: true,
      data: {
        ...sanitizeUser(user),
        recipes: userRecipes,
        totalRecipes: userRecipes.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const { name, bio, avatar } = req.body;
    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }
    if (bio !== undefined) {
      updates.bio = bio.trim();
    }
    if (avatar && avatar.trim()) {
      updates.avatar = avatar.trim();
    }

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await storage.updateById('users', req.user.id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
}

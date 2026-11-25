import * as adminService from '../services/adminService.js';

export async function getStats(req, res, next) {
  try {
    const stats = await adminService.getAdminStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const updatedUser = await adminService.updateUserRole(req.params.id, role);
    res.status(200).json({
      success: true,
      message: 'User role updated.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const updatedUser = await adminService.toggleUserStatus(req.params.id);
    res.status(200).json({
      success: true,
      message: updatedUser.isActive ? 'User account activated.' : 'User account suspended.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleRecipeFeatured(req, res, next) {
  try {
    const updatedRecipe = await adminService.toggleRecipeFeatured(req.params.id);
    res.status(200).json({
      success: true,
      message: updatedRecipe.isFeatured ? 'Recipe featured on homepage.' : 'Recipe removed from featured.',
      data: updatedRecipe,
    });
  } catch (error) {
    next(error);
  }
}

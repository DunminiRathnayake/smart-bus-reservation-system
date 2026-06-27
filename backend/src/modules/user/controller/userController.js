/**
 * @file userController.js
 * @description User Controller mapping HTTP requests to UserService actions using standard response helpers.
 */

const userService = require('../service/userService');
const asyncHandler = require('../../../middleware/asyncHandler');
const { successResponse, paginatedResponse } = require('../../../utils/response');

/**
 * @desc    Get authenticated user's profile (Phase 3A)
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by authenticate middleware
  return successResponse(res, 'User profile retrieved successfully', { user: req.user });
});

/**
 * @desc    Update authenticated user's profile (Phase 3A)
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
const updateMe = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user._id, req.body, req.user._id);
  return successResponse(res, 'User profile updated successfully', { user: updatedUser });
});

/**
 * @desc    Get all users (Phase 3B - Admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, status, sortBy } = req.query;
  const result = await userService.getUsers({ page, limit, search, role, status, sortBy });
  
  return paginatedResponse(res, 'Users retrieved successfully', 'users', result.users, result.pagination);
});

/**
 * @desc    Get user by ID (Phase 3B - Admin only)
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return successResponse(res, 'User details retrieved successfully', { user });
});

/**
 * @desc    Update user details by ID (Phase 3B - Admin only)
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body, req.user._id);
  return successResponse(res, 'User updated successfully', { user: updatedUser });
});

/**
 * @desc    Update user status (Phase 3B - Admin only)
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateStatus(req.params.id, req.body.status, req.user._id);
  return successResponse(res, `User status updated to ${req.body.status.toLowerCase()} successfully`, { user: updatedUser });
});

/**
 * @desc    Deactivate a user (Phase 3B - Admin only)
 * @route   PATCH /api/v1/users/:id/deactivate
 * @access  Private/Admin
 */
const deactivate = asyncHandler(async (req, res) => {
  const updatedUser = await userService.deactivateUser(req.params.id, req.user._id);
  return successResponse(res, 'User account deactivated successfully', { user: updatedUser });
});

/**
 * @desc    Reactivate a user (Phase 3B - Admin only)
 * @route   PATCH /api/v1/users/:id/reactivate
 * @access  Private/Admin
 */
const reactivate = asyncHandler(async (req, res) => {
  const updatedUser = await userService.reactivateUser(req.params.id, req.user._id);
  return successResponse(res, 'User account reactivated successfully', { user: updatedUser });
});

/**
 * @desc    Soft-delete a user (Phase 3B - Admin only)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.softDeleteUser(req.params.id, req.user._id);
  return successResponse(res, 'User deleted successfully', null);
});

module.exports = {
  getMe,
  updateMe,
  getUsers,
  getUserById,
  updateUser,
  updateStatus,
  deactivate,
  reactivate,
  deleteUser
};

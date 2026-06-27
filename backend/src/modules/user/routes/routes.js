/**
 * @file routes.js
 * @description Routes for User module protecting endpoints with auth, authorization, validation, and mapping to controllers.
 */

const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const { authenticate, authorize } = require('../../../middleware/auth');
const { updateProfileRules, updateUserRules, updateStatusRules } = require('../validation/userValidation');
const validate = require('../../../middleware/validate');

// ==========================================
// Phase 3A: User Profile (Authenticated Users)
// ==========================================

/**
 * @route   GET /api/v1/users/me
 * @desc    Get authenticated user profile details
 * @access  Private
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update authenticated user profile (permitted fields only)
 * @access  Private
 */
router.put('/me', authenticate, updateProfileRules, validate, userController.updateMe);

// ==========================================
// Phase 3B: User Administration (Admin Only)
// ==========================================

// Global protection middleware applying Authentication and Admin role checks to all downstream routes
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   GET /api/v1/users
 * @desc    List all users (Admin only, supports pagination, searching, filtering, sorting)
 * @access  Private/Admin
 */
router.get('/', userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Retrieve user details by ID (Admin only)
 * @access  Private/Admin
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user details by ID (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', updateUserRules, validate, userController.updateUser);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Update user status (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', updateStatusRules, validate, userController.updateStatus);

/**
 * @route   PATCH /api/v1/users/:id/deactivate
 * @desc    Deactivate a user (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/deactivate', userController.deactivate);

/**
 * @route   PATCH /api/v1/users/:id/reactivate
 * @desc    Reactivate a user (Admin only)
 * @access  Private/Admin
 */
router.patch('/:id/reactivate', userController.reactivate);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft-delete a user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;

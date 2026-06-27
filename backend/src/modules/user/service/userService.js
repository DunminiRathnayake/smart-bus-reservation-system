/**
 * @file userService.js
 * @description Encapsulates all business logic for User Profile (Phase 3A) and User Administration (Phase 3B).
 */

const userRepository = require('../repository/userRepository');
const UserStatus = require('../../../constants/userStatus');

class UserService {
  /**
   * Retrieves a user profile by ID.
   * 
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Object>} The user profile object.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Updates an authenticated user's own profile (Phase 3A).
   * Restricts updates to permitted fields only: fullName and phoneNumber.
   * 
   * @param {string} userId - The user ID.
   * @param {Object} profileData - The fields to update.
   * @param {string} updatedById - The ID of the user performing the update.
   * @returns {Promise<Object>} The updated user profile object.
   */
  async updateProfile(userId, profileData, updatedById) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Restrict update to allowed profile fields only (exclude email, password, role, status)
    const updatePayload = {
      fullName: profileData.fullName !== undefined ? profileData.fullName : user.fullName,
      phoneNumber: profileData.phoneNumber !== undefined ? profileData.phoneNumber : user.phoneNumber,
      updatedBy: updatedById
    };

    return await userRepository.update(userId, updatePayload);
  }

  /**
   * Retrieves all users (Phase 3B - Admin only).
   * 
   * @param {Object} queryOptions - Pagination, searching, filtering and sorting parameters.
   * @returns {Promise<Object>} Object containing users list and pagination metadata.
   */
  async getUsers(queryOptions) {
    return await userRepository.findAll(queryOptions);
  }

  /**
   * Retrieves user details by ID (Phase 3B - Admin only).
   * 
   * @param {string} userId - The user ID.
   * @returns {Promise<Object>} The user document.
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Updates user details by ID (Phase 3B - Admin only).
   * 
   * @param {string} userId - The target user ID.
   * @param {Object} updateData - Update values.
   * @param {string} updatedById - The user ID of the admin.
   * @returns {Promise<Object>} The updated user document.
   */
  async updateUser(userId, updateData, updatedById) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Security Rule: Prevent an admin from deactivating or suspending themselves
    if (userId.toString() === updatedById.toString() && updateData.status && updateData.status !== UserStatus.ACTIVE) {
      const error = new Error('Operation denied: You cannot deactivate or suspend your own admin account');
      error.statusCode = 400;
      throw error;
    }

    // Strip unpermitted modifier tracking fields from input payload to control audit trails
    const cleanUpdatePayload = {
      fullName: updateData.fullName !== undefined ? updateData.fullName : user.fullName,
      phoneNumber: updateData.phoneNumber !== undefined ? updateData.phoneNumber : user.phoneNumber,
      role: updateData.role !== undefined ? updateData.role : user.role,
      status: updateData.status !== undefined ? updateData.status : user.status,
      updatedBy: updatedById
    };

    return await userRepository.update(userId, cleanUpdatePayload);
  }

  /**
   * Updates user status (Phase 3B - Admin only).
   * 
   * @param {string} userId - The target user ID.
   * @param {string} status - New status.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated user document.
   */
  async updateStatus(userId, status, updatedById) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Security Rule: Prevent an admin from suspending/deactivating themselves
    if (userId.toString() === updatedById.toString() && status !== UserStatus.ACTIVE) {
      const error = new Error('Operation denied: You cannot deactivate or suspend your own admin account');
      error.statusCode = 400;
      throw error;
    }

    return await userRepository.update(userId, { status, updatedBy: updatedById });
  }

  /**
   * Deactivates a user (Phase 3B - Admin only).
   * 
   * @param {string} userId - The target user ID.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated user document.
   */
  async deactivateUser(userId, updatedById) {
    if (userId.toString() === updatedById.toString()) {
      const error = new Error('Operation denied: You cannot deactivate your own admin account');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await userRepository.update(userId, { status: UserStatus.INACTIVE, updatedBy: updatedById });
  }

  /**
   * Reactivates a user (Phase 3B - Admin only).
   * 
   * @param {string} userId - The target user ID.
   * @param {string} updatedById - The admin performing the update.
   * @returns {Promise<Object>} The updated user document.
   */
  async reactivateUser(userId, updatedById) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await userRepository.update(userId, { status: UserStatus.ACTIVE, updatedBy: updatedById });
  }

  /**
   * Soft-deletes a user (Phase 3B - Admin only).
   * Sets status = INACTIVE, deletedAt, and deletedBy.
   * 
   * @param {string} userId - The target user ID.
   * @param {string} deletedById - The admin performing the deletion.
   * @returns {Promise<Object>} The soft-deleted user document.
   */
  async softDeleteUser(userId, deletedById) {
    if (userId.toString() === deletedById.toString()) {
      const error = new Error('Operation denied: You cannot delete your own admin account');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await userRepository.update(userId, {
      status: UserStatus.INACTIVE,
      deletedAt: new Date(),
      deletedBy: deletedById
    });
  }
}

module.exports = new UserService();

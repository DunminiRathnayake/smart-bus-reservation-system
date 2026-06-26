/**
 * @file userRepository.js
 * @description Encapsulates all database operations for the User model.
 */

const User = require('../model/User');

class UserRepository {
  /**
   * Finds a user by their email address.
   * 
   * @param {string} email - The email to search for.
   * @param {boolean} [includePassword=false] - Whether to explicitly include the password field in the query result.
   * @returns {Promise<Object|null>} The user document, or null if not found.
   */
  async findByEmail(email, includePassword = false) {
    try {
      const query = User.findOne({ email });
      if (includePassword) {
        query.select('+password');
      }
      return await query.exec();
    } catch (error) {
      throw new Error(`Database error in findByEmail: ${error.message}`);
    }
  }

  /**
   * Finds a user by their unique database ID.
   * 
   * @param {string} id - The MongoDB ID.
   * @returns {Promise<Object|null>} The user document, or null if not found.
   */
  async findById(id) {
    try {
      return await User.findById(id).exec();
    } catch (error) {
      throw new Error(`Database error in findById: ${error.message}`);
    }
  }

  /**
   * Creates and saves a new user.
   * 
   * @param {Object} userData - The details of the user to create.
   * @returns {Promise<Object>} The saved user document.
   */
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error(`Database error in create: ${error.message}`);
    }
  }

  /**
   * Updates an existing user.
   * 
   * @param {string} id - The MongoDB ID of the user to update.
   * @param {Object} data - The updated data.
   * @returns {Promise<Object|null>} The updated user document, or null if not found.
   */
  async update(id, data) {
    try {
      return await User.findByIdAndUpdate(id, data, {
        new: true, // Returns the modified document rather than the original
        runValidators: true // Runs validation checks on the update data against the schema rules
      }).exec();
    } catch (error) {
      throw new Error(`Database error in update: ${error.message}`);
    }
  }

  /**
   * Deletes a user by their ID.
   * 
   * @param {string} id - The MongoDB ID of the user to delete.
   * @returns {Promise<Object|null>} The deleted user document, or null if not found.
   */
  async delete(id) {
    try {
      return await User.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error(`Database error in delete: ${error.message}`);
    }
  }

  /**
   * Checks if a user with the specified email address exists.
   * 
   * @param {string} email - The email to check.
   * @returns {Promise<boolean>} True if user exists, false otherwise.
   */
  async exists(email) {
    try {
      const result = await User.exists({ email });
      return !!result;
    } catch (error) {
      throw new Error(`Database error in exists: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();

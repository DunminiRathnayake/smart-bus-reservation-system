/**
 * @file authService.js
 * @description Encapsulates all business logic related to user registration, login,
 * password hashing, and token generation.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../../user/repository/userRepository');

class AuthService {
  /**
   * Hashes a password string.
   * 
   * @param {string} password - The plain-text password.
   * @returns {Promise<string>} The hashed password.
   */
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Compares a plain-text password with a hash.
   * 
   * @param {string} password - The plain-text password.
   * @param {string} hashed - The hashed password.
   * @returns {Promise<boolean>} True if match, false otherwise.
   */
  async comparePassword(password, hashed) {
    try {
      return await bcrypt.compare(password, hashed);
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  /**
   * Generates a signed JWT token for the user.
   * 
   * @param {Object} user - The user object.
   * @returns {string} The signed JWT token.
   */
  generateToken(user) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined');
      }
      
      const payload = {
        id: user._id,
        role: user.role
      };

      const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '2h'
      };

      return jwt.sign(payload, secret, options);
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Executes the user registration flow.
   * 
   * @param {Object} userData - The details of the user to register.
   * @returns {Promise<Object>} The registered user object without password.
   */
  async register(userData) {
    // 1. Check if email already exists
    const emailExists = await userRepository.exists(userData.email);
    if (emailExists) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    // 2. Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // 3. Save user with hashed password
    const savedUser = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // 4. Return user object without password
    const userObj = savedUser.toObject();
    delete userObj.password;
    return userObj;
  }

  /**
   * Executes the user login flow.
   * 
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<Object>} Object containing user details and access token.
   */
  async login(email, password) {
    // 1. Retrieve user by email (explicitly selecting password)
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 2. Check if user is active
    if (!user.isActive) {
      const error = new Error('User account is deactivated');
      error.statusCode = 403;
      throw error;
    }

    // 3. Verify password
    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 4. Generate token
    const token = this.generateToken(user);

    // 5. Format user details (omitting password)
    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token
    };
  }
}

module.exports = new AuthService();

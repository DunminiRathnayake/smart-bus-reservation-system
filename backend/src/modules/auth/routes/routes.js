/**
 * @file routes.js
 * @description Routes for Authentication module mapping endpoints to validation rules, validation middleware, and controllers.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { registerValidationRules, loginValidationRules } = require('../validation/authValidation');
const validate = require('../../../middleware/validate');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidationRules, validate, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login a user and return access token
 * @access  Public
 */
router.post('/login', loginValidationRules, validate, authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout placeholder
 * @access  Public
 */
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: "Logout endpoint placeholder" });
});

module.exports = router;

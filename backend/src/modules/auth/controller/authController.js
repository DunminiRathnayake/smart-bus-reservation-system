/**
 * @file authController.js
 * @description Authentication controller handling HTTP requests and routing them to the AuthService.
 */

const authService = require('../service/authService');
const asyncHandler = require('../../../middleware/asyncHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const user = await authService.register(userData);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
    errors: []
  });
});

/**
 * @desc    Login a user and return details & access token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
    errors: []
  });
});

module.exports = {
  register,
  login
};

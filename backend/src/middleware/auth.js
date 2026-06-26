/**
 * @file auth.js
 * @description JWT authentication and authorization middleware for protecting routes.
 */

const jwt = require('jsonwebtoken');
const userRepository = require('../modules/user/repository/userRepository');
const asyncHandler = require('./asyncHandler');

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Validates the token, checks user existence & active status, and binds to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header (split "Bearer <token>")
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Return 401 if token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No token provided',
      data: null,
      errors: [{ field: 'authorization', message: 'Bearer token required' }]
    });
  }

  try {
    // 3. Verify JWT token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Retrieve database user to check active status and existence
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: User account no longer exists',
        data: null,
        errors: [{ field: 'authorization', message: 'User not found' }]
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: User account is deactivated',
        data: null,
        errors: [{ field: 'authorization', message: 'Account suspended' }]
      });
    }

    // 5. Attach user object to request and continue
    req.user = user;
    next();
  } catch (error) {
    let message = 'Access denied: Invalid token';
    if (error.name === 'TokenExpiredError') {
      message = 'Access denied: Token expired';
    }

    return res.status(401).json({
      success: false,
      message,
      data: null,
      errors: [{ field: 'authorization', message: error.message }]
    });
  }
});

/**
 * Middleware to authorize requests based on matching user roles.
 * 
 * @param {...string} roles - The list of permitted roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user object was attached by authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: User not authenticated',
        data: null,
        errors: []
      });
    }

    // Check if user's role is in the authorized roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user.role}' is not authorized to access this resource`,
        data: null,
        errors: []
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

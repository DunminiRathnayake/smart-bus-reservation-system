const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let errorResponse = {
    success: false,
    message: err.message || 'Server Error',
    timestamp: new Date().toISOString()
  };

  let statusCode = err.statusCode || 500;

  // Mongoose duplicate key
  if (err.code === 11000) {
    errorResponse.message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    errorResponse.message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

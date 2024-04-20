// Error middleware function
const errorMiddleware = (err, req, res, next) => {
  // Log the error
  console.error(err.stack);

  // Set default status code to 500 (Internal Server Error)
  let statusCode = 500;

  // Check if the error has a status code
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};

module.exports = errorMiddleware;

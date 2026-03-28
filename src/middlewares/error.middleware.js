'use strict';

/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message   || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;

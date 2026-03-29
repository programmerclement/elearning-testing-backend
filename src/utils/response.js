'use strict';

/**
 * Creates a standardised API response object.
 */
const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = null, message = 'Created successfully') =>
  success(res, data, message, 201);

const paginated = (res, data, pagination) =>
  res.status(200).json({ success: true, data, pagination });

const notFound = (message = 'Resource not found') => {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
};

const badRequest = (message = 'Bad request') => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const serverError = (message = 'Internal server error') => {
  const err = new Error(message);
  err.statusCode = 500;
  return err;
};

/**
 * New unified response functions for auth and other endpoints
 */
const successResponse = (res, response = {}, statusCode = 200) => {
  const { message = 'Success', data = null } = response;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
};

module.exports = { 
  success, 
  created, 
  paginated, 
  notFound, 
  badRequest, 
  serverError,
  successResponse,
  errorResponse,
};

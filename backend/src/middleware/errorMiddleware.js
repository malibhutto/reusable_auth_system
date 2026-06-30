import { sendError } from '../utils/response.js';

/**
 * Centralized error handler middleware.
 * Returns consistent error responses while avoiding leaking backend implementation details.
 */
export const errorHandler = (err, req, res, next) => {
  // Always log the error details internally
  console.error('🔥 [Unhandled Error]:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  
  // Clean message for production environments
  let userFriendlyMessage = err.message;
  if (process.env.NODE_ENV === 'production' && !err.statusCode) {
    userFriendlyMessage = 'An unexpected internal server error occurred';
  }

  return sendError(res, userFriendlyMessage, statusCode);
};
export default errorHandler;

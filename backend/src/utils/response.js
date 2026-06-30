/**
 * Send a structured success API response.
 * @param {object} res - Express response object
 * @param {string} message - User-friendly message
 * @param {object} data - Optional payload data
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send a structured error API response.
 * @param {object} res - Express response object
 * @param {string} message - Error description message
 * @param {number} statusCode - HTTP status code
 */
export const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

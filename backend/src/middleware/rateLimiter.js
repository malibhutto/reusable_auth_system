import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";

/**
 * Factory function to create custom rate limiters.
 * @param {number} minutes - Time window in minutes
 * @param {number} maxAttempts - Maximum attempts allowed in the window
 * @param {string} customMessage - Response error message
 */
const createLimiter = (minutes, maxAttempts, customMessage) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: maxAttempts,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      return sendError(res, customMessage, 429);
    },
  });
};

// Limit signups to 5 requests per 15 minutes per IP
export const signupLimiter = createLimiter(
  15,
  5,
  "Too many signup attempts from this IP. Please try again after 15 minutes.",
);

// Limit logins to 10 requests per 15 minutes per IP
export const loginLimiter = createLimiter(
  15,
  10,
  "Too many login attempts. Please try again after 15 minutes.",
);

// Limit verification attempts to 10 requests per 15 minutes per IP
export const verifyLimiter = createLimiter(
  15,
  10,
  "Too many OTP verification attempts. Please try again after 15 minutes.",
);

// Limit forgot password request to 5 requests per 15 minutes per IP
export const forgotPasswordLimiter = createLimiter(
  15,
  5,
  "Too many forgot password requests. Please try again after 15 minutes.",
);

// Limit reset password request to 5 requests per 15 minutes per IP
export const resetPasswordLimiter = createLimiter(
  15,
  5,
  "Too many password reset attempts. Please try again after 15 minutes.",
);

export default {
  signupLimiter,
  loginLimiter,
  verifyLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};

import authService from '../services/authService.js';
import tokenService from '../services/tokenService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Handle user registration.
 */
export const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return sendSuccess(res, 'Registration successful! Please check your email for the verification code.', user, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user email address with OTP.
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await authService.verifyEmail(email, otp);
    return sendSuccess(res, 'Email verified successfully! You can now log in.', {});
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email verification OTP.
 */
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.resendVerification(email);
    return sendSuccess(res, 'A new verification code has been sent to your email.', {});
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate credentials and establish login session.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    // Set refresh token in HttpOnly cookie
    tokenService.setRefreshTokenCookie(res, refreshToken);

    return sendSuccess(res, 'Login successful!', {
      accessToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send password recovery email (Prevents user enumeration).
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    
    // Always return a success response to avoid leaking account existence
    return sendSuccess(
      res,
      'If the email is registered, a password recovery code has been sent to it.',
      {}
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using verification OTP.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    await authService.resetPassword(email, otp, password);
    return sendSuccess(res, 'Password updated successfully! You can now log in with your new password.', {});
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate current user session (Revoke active refresh token).
 */
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    // Clear client cookies
    tokenService.clearRefreshTokenCookie(res);
    return sendSuccess(res, 'Logged out successfully.', {});
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate all active user sessions.
 */
export const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await tokenService.revokeAllUserRefreshTokens(userId);

    // Clear client cookies
    tokenService.clearRefreshTokenCookie(res);
    return sendSuccess(res, 'Successfully logged out of all active sessions.', {});
  } catch (error) {
    next(error);
  }
};

/**
 * Rotate refresh session cookie and issue a new access token.
 */
export const refreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return sendError(res, 'Session expired or refresh token missing', 401);
    }

    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshSession(oldRefreshToken);

    // Set rotated token in secure cookie
    tokenService.setRefreshTokenCookie(res, newRefreshToken);

    return sendSuccess(res, 'Session token refreshed', {
      accessToken,
      user,
    });
  } catch (error) {
    // Clear cookie on invalid/expired refresh attempts
    tokenService.clearRefreshTokenCookie(res);
    return sendError(res, 'Invalid or expired session. Please log in again.', 401);
  }
};

/**
 * Return current logged-in user profile.
 */
export const me = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserProfile(userId);
    return sendSuccess(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  refreshToken,
  me,
};

import { Router } from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  signupLimiter,
  loginLimiter,
  verifyLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} from '../middleware/rateLimiter.js';
import {
  validateSignup,
  validateVerifyEmail,
  validateResendOtp,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/authValidator.js';

const router = Router();

// Signup Route (Rate Limited, Input Validated)
router.post('/signup', signupLimiter, validateSignup, authController.signup);

// Verify Email Route (Rate Limited, Input Validated)
router.post('/verify-email', verifyLimiter, validateVerifyEmail, authController.verifyEmail);

// Resend Verification OTP Route (Rate Limited, Input Validated)
router.post('/resend-verification', verifyLimiter, validateResendOtp, authController.resendVerification);

// Login Route (Rate Limited, Input Validated)
router.post('/login', loginLimiter, validateLogin, authController.login);

// Forgot Password Route (Rate Limited, Input Validated)
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, authController.forgotPassword);

// Reset Password Route (Rate Limited, Input Validated)
router.post('/reset-password', resetPasswordLimiter, validateResetPassword, authController.resetPassword);

// Refresh Token Route (Rotation Flow)
router.post('/refresh-token', authController.refreshToken);

// Logout Route (Revokes active session token)
router.post('/logout', authController.logout);

// Logout All Sessions Route (Protected, Revokes all user tokens)
router.post('/logout-all', protect, authController.logoutAll);

// Fetch current session profile (Protected)
router.get('/me', protect, authController.me);

export default router;

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Hash a plain-text password using bcrypt.
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

/**
 * Compare a plain-text password with its hashed version.
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Hash an OTP using SHA-256 for secure DB storage.
 * Provides fast verification while protecting against database leak exposures.
 * @param {string} otp 
 * @returns {string}
 */
export const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Compare a plain-text OTP with its hashed version.
 * @param {string} plainOtp 
 * @param {string} hashedOtp 
 * @returns {boolean}
 */
export const compareOtp = (plainOtp, hashedOtp) => {
  return hashOtp(plainOtp) === hashedOtp;
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * @returns {string}
 */
export const generateNumericOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

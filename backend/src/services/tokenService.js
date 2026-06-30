import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Load secrets with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-jwt-refresh-secret';
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';

/**
 * Parse time string (e.g., '15m', '7d') into milliseconds.
 * @param {string} duration 
 * @returns {number}
 */
const parseDurationToMs = (duration) => {
  const value = parseInt(duration, 10);
  const unit = duration.slice(-1).toLowerCase();
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000; // default 7 days
  }
};

/**
 * Generate a standard short-lived Access Token.
 * @param {object} user 
 * @returns {string}
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
};

/**
 * Generate a long-lived Refresh Token and store it in the database.
 * @param {object} user 
 * @returns {Promise<string>}
 */
export const generateAndStoreRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  const ms = parseDurationToMs(REFRESH_TOKEN_EXPIRES);
  const expiresAt = new Date(Date.now() + ms);

  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return token;
};

/**
 * Verify an Access Token.
 * @param {string} token 
 * @returns {object} - Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify a Refresh Token and check if it exists in the database.
 * @param {string} token 
 * @returns {Promise<object>} - Decoded payload if valid
 */
export const verifyRefreshToken = async (token) => {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new Error('Refresh token not found in database');
  }

  if (new Date() > tokenRecord.expiresAt) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { token } });
    throw new Error('Refresh token expired');
  }

  return { decoded, tokenRecord };
};

/**
 * Revoke/Delete a specific Refresh Token from the database.
 * @param {string} token 
 */
export const revokeRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
  } catch (error) {
    // If token already deleted or doesn't exist, ignore
  }
};

/**
 * Revoke/Delete all Refresh Tokens for a specific user.
 * @param {string} userId 
 */
export const revokeAllUserRefreshTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Attach the Refresh Token to response cookies.
 * @param {object} res - Express response
 * @param {string} token - Refresh Token
 */
export const setRefreshTokenCookie = (res, token) => {
  const ms = parseDurationToMs(REFRESH_TOKEN_EXPIRES);

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ms,
  });
};

/**
 * Clear the Refresh Token cookie.
 * @param {object} res - Express response
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};
export default {
  generateAccessToken,
  generateAndStoreRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};

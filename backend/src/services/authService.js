import prisma from "../config/db.js";
import {
  hashPassword,
  comparePassword,
  hashOtp,
  generateNumericOtp,
} from "../utils/hash.js";
import emailService from "./emailService.js";
import tokenService from "./tokenService.js";

const otpExpiryMinutes = Number(process.env.OTP_EXPIRES) || 10;
const otpExpiryMs = otpExpiryMinutes * 60 * 1000;

/**
 * Remove sensitive password field from user objects.
 */
const excludePassword = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Register a new user and send verification OTP.
 */
export const signup = async (userData) => {
  const { firstName, lastName, email, dob, password } = userData;

  // Double-check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Calculate age from Date of Birth
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 13) {
    throw new Error("You must be at least 13 years old to register");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      age,
      password: hashedPassword,
      isVerified: false,
    },
  });

  // Generate OTP
  const otp = generateNumericOtp();
  const hashedOtpVal = hashOtp(otp);
  const expiresAt = new Date(Date.now() + otpExpiryMs);

  // Save OTP in Database
  await prisma.otp.create({
    data: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "VERIFICATION",
      expiresAt,
    },
  });
  // console.log("date now", new Date().toISOString());
  // console.log("expire at", expiresAt.toISOString());

  // Send verification email
  await emailService.sendVerificationEmail(user.email, user.firstName, otp);

  return excludePassword(user);
};

/**
 * Verify user email using OTP.
 */
export const verifyEmail = async (email, otpCode) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  const hashedOtpVal = hashOtp(otpCode);

  // Find valid OTP
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "VERIFICATION",
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired verification code");
  }

  // Remove OTP after successful verification
  await prisma.otp.delete({
    where: { id: otpRecord.id },
  });

  // Mark User as verified
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  return excludePassword(updatedUser);
};

/**
 * Resend email verification OTP.
 */
export const resendVerification = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  // Invalidate previous verification OTPs
  await prisma.otp.updateMany({
    where: { userId: user.id, type: "VERIFICATION", isUsed: false },
    data: { isUsed: true },
  });

  // Generate new OTP
  const otp = generateNumericOtp();
  const hashedOtpVal = hashOtp(otp);
  const expiresAt = new Date(Date.now() + otpExpiryMs);

  await prisma.otp.create({
    data: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "VERIFICATION",
      expiresAt,
    },
  });

  await emailService.sendVerificationEmail(user.email, user.firstName, otp);
  return true;
};

/**
 * Authenticate credentials, check verification, and return session tokens.
 */
export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Enforce email verification before login
  if (!user.isVerified) {
    throw new Error("Email is not verified. Please verify your email first.");
  }

  // Generate Tokens
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateAndStoreRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: excludePassword(user),
  };
};

/**
 * Process Forgot Password request (Prevents user enumeration).
 */
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Safe fallback if user doesn't exist
  if (!user) {
    console.log(
      `🔍 [Enum Protection] Forgot Password requested for non-existent email: ${email}`,
    );
    return true; // Return true as if successful
  }

  // Invalidate older password reset OTPs
  await prisma.otp.updateMany({
    where: { userId: user.id, type: "PASSWORD_RESET", isUsed: false },
    data: { isUsed: true },
  });

  // Generate new OTP
  const otp = generateNumericOtp();
  const hashedOtpVal = hashOtp(otp);
  const expiresAt = new Date(Date.now() + otpExpiryMs); // 10 minutes

  await prisma.otp.create({
    data: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "PASSWORD_RESET",
      expiresAt,
    },
  });

  // console.log("password reset request created at", new Date().toISOString());
  // console.log("password reset expires at", expiresAt.toISOString());

  await emailService.sendForgotPasswordEmail(user.email, user.firstName, otp);
  return true;
};

/**
 * Verify password reset OTP without changing the password.
 */
export const verifyPasswordReset = async (email, otpCode) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  const hashedOtpVal = hashOtp(otpCode);
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "PASSWORD_RESET",
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired recovery code");
  }

  return true;
};

/**
 * Reset password using OTP recovery code.
 */
export const resetPassword = async (email, otpCode, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  const hashedOtpVal = hashOtp(otpCode);

  // Find valid recovery OTP
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      otp: hashedOtpVal,
      type: "PASSWORD_RESET",
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired password recovery code");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Remove OTP after successful password reset
  await prisma.otp.delete({
    where: { id: otpRecord.id },
  });

  // Security best practice: Revoke all existing sessions (Force relog)
  await tokenService.revokeAllUserRefreshTokens(user.id);

  return true;
};

/**
 * Rotate old refresh token to issue a new access/refresh token pair.
 */
export const refreshSession = async (oldRefreshToken) => {
  const { userRecord, tokenRecord } = await prisma.$transaction(async (tx) => {
    // 1. Verify old token exists in DB
    const dbToken = await tx.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!dbToken) {
      throw new Error("Refresh token not found or revoked");
    }

    if (new Date() > dbToken.expiresAt) {
      await tx.refreshToken.delete({ where: { token: oldRefreshToken } });
      throw new Error("Refresh token expired");
    }

    // 2. Delete old refresh token (single use / rotation)
    await tx.refreshToken.delete({
      where: { id: dbToken.id },
    });

    return { userRecord: dbToken.user, tokenRecord: dbToken };
  });

  // 3. Generate new session tokens
  const newAccessToken = tokenService.generateAccessToken(userRecord);
  const newRefreshToken =
    await tokenService.generateAndStoreRefreshToken(userRecord);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: excludePassword(userRecord),
  };
};

/**
 * Retrieve current user profile details.
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  return excludePassword(user);
};
export default {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  verifyPasswordReset,
  resetPassword,
  refreshSession,
  getUserProfile,
};

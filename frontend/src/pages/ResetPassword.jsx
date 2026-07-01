import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../components/Toast.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import ShowHidePassword from "../components/ShowHidePassword.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

export const ResetPassword = () => {
  const { resetPassword, verifyPasswordReset } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus reference for OTP boxes
  const inputRefs = useRef([]);

  // Prepopulate email from query parameter
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const newOtp = [...otpArray];
      newOtp[index] = "";
      setOtpArray(newOtp);
      return;
    }

    const digit = cleanValue.substring(cleanValue.length - 1);
    const newOtp = [...otpArray];
    newOtp[index] = digit;
    setOtpArray(newOtp);

    // Auto-focus next box
    if (index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpArray[index] === "" && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otpArray];
        newOtp[index] = "";
        setOtpArray(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .trim()
      .replace(/[^0-9]/g, "");
    if (pasteData.length === 6) {
      const newOtp = pasteData.split("");
      setOtpArray(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const otpCode = otpArray.join("");

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isOtpVerified) {
      if (otpCode.length < 6) {
        newErrors.otp = "Please enter the full 6-digit recovery code";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!password) {
      newErrors.password = "New password is required";
    } else {
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        newErrors.password =
          "Password must contain at least one special character";
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOtp = async () => {
    const otpCode = otpArray.join("");
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (otpCode.length < 6) {
      newErrors.otp = "Please enter the full 6-digit recovery code";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyPasswordReset(email, otpCode);
      setVerifiedOtp(otpCode);
      setIsOtpVerified(true);
      setErrors({});
      addToast(
        "Recovery code verified. Please choose a new password.",
        "success",
      );
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOtpVerified) {
      addToast(
        "Please verify your recovery code before resetting your password.",
        "error",
      );
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await resetPassword(email, verifiedOtp, password, confirmPassword);
      addToast("Password reset successfully! You can now log in.", "success");
      navigate("/login");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {isSubmitting && <LoadingSpinner message="Updating password..." />}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Verify the OTP and establish your new secure password
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isOtpVerified ? (
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Email Address
              </label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => {
                  const nextEmail = e.target.value;
                  if (isOtpVerified && nextEmail !== email) {
                    setIsOtpVerified(false);
                    setVerifiedOtp("");
                  }
                  setEmail(nextEmail);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="john.doe@example.com"
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          ) : (
            <div className="form-group">
              <div className="form-note">
                Resetting password for <strong>{email}</strong>
              </div>
            </div>
          )}

          {!isOtpVerified ? (
            <>
              <div className="form-group">
                <label className="form-label">Recovery Code</label>
                <div className="otp-inputs-row">
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => {
                        handleOtpChange(idx, e.target.value);
                        if (errors.otp)
                          setErrors((prev) => ({ ...prev, otp: "" }));
                      }}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className={`otp-box ${errors.otp ? "input-error" : ""}`}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <span className="error-message">{errors.otp}</span>
                )}
              </div>

              <button
                type="button"
                className="btn-submit"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify Recovery Code"}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">
                  New Password
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`form-input ${errors.password ? "input-error" : ""}`}
                    placeholder="••••••••"
                    required
                  />
                  <ShowHidePassword
                    isVisible={showPassword}
                    onToggle={() => setShowPassword((prev) => !prev)}
                  />
                </div>
                {password && <PasswordStrengthMeter password={password} />}
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                    placeholder="••••••••"
                    required
                  />
                  <ShowHidePassword
                    isVisible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useOtpInput } from "../hooks/useOtpInput.js";
import { useToast } from "../context/ToastContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

const RESEND_COOLDOWN_SECONDS = 120;

export const VerifyEmail = () => {
  const { verifyEmail, resendVerification } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    otpArray,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
    otpCode,
  } = useOtpInput(6);

  // Prepopulate email from query parameter if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer — pauses when tab is hidden to avoid drift
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      addToast("Please enter your email address.", "error");
      return;
    }
    if (otpCode.length < 6) {
      addToast("Please enter the full 6-digit code.", "error");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail(email, otpCode);
      addToast("Email verified successfully! You can now log in.", "success");
      navigate("/login");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      addToast("Please enter your email address to resend the code.", "error");
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(email);
      addToast("A new verification code has been dispatched.", "success");
      setTimeLeft(RESEND_COOLDOWN_SECONDS);
      resetOtp();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {(isVerifying || isResending) && (
        <LoadingSpinner
          message={isVerifying ? "Verifying code..." : "Sending code..."}
        />
      )}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">
            We sent a 6-digit confirmation code to your email
          </p>
        </div>

        <form className="auth-form" onSubmit={handleVerify} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="verify-email">
              Email Address
            </label>
            <input
              type="email"
              id="verify-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input form-input--readonly"
              placeholder="john.doe@example.com"
              required
              autoComplete="email"
              readOnly={!!email}
            />
          </div>

          <fieldset
            className="form-group"
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <legend className="form-label">Verification Code</legend>
            <div
              className="otp-inputs-row"
              role="group"
              aria-label="6-digit verification code"
            >
              {otpArray.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="otp-box"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  aria-label={`Digit ${idx + 1} of 6`}
                  autoFocus={idx === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </fieldset>

          <button type="submit" className="btn-submit" disabled={isVerifying}>
            Verify Code
          </button>
        </form>

        <div className="resend-container">
          {timeLeft > 0 ? (
            <span>
              Resend code in{" "}
              <strong className="countdown-timer">
                {formatTime(timeLeft)}
              </strong>
            </span>
          ) : (
            <button
              type="button"
              className="btn-resend-link"
              onClick={handleResend}
              disabled={isResending}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

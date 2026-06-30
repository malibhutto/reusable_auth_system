import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../components/Toast.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

export const VerifyEmail = () => {
  const { verifyEmail, resendVerification } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes countdown
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // References to input elements for focus management
  const inputRefs = useRef([]);

  // Prepopulate email from query parameter if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (index, value) => {
    // Keep only numbers
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
    // Backspace: clear current or move to previous box
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpArray.join("");

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
      setTimeLeft(120); // Reset countdown timer
      setOtpArray(["", "", "", "", "", ""]); // Clear boxes
      inputRefs.current[0].focus();
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

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label" htmlFor="verify-email">
              Email Address
            </label>
            <input
              type="email"
              id="verify-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <div className="otp-inputs-row">
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
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

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

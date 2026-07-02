import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast("Please enter your email address.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      addToast(
        "If the email matches an account, a recovery code has been sent.",
        "success",
      );

      // Redirect to page 2 (ResetPassword) passing the email
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {isSubmitting && <LoadingSpinner message="Sending recovery code..." />}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">
            Enter your email and we'll send you an OTP to reset your password
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">
              Email Address
            </label>
            <input
              type="email"
              id="forgot-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="john.doe@example.com"
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            Send Recovery Code
          </button>
        </form>

        <div className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

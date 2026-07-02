import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import ShowHidePassword from "../components/ShowHidePassword.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

export const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name must contain only alphabets";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name must contain only alphabets";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }

    // DOB & Age limit
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const age = calculateAge(formData.dob);
      if (age < 13) {
        newErrors.dob = "You must be at least 13 years old to register";
      }
    }

    // Password Complexity
    const pass = formData.password;
    if (!pass) {
      newErrors.password = "Password is required";
    } else {
      if (pass.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/[A-Z]/.test(pass)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(pass)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(pass)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(pass)) {
        newErrors.password =
          "Password must contain at least one special character";
      }
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      addToast(
        "Account created successfully! Verification code sent to email.",
        "success",
      );
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {isSubmitting && <LoadingSpinner message="Creating your account..." />}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us and start your journey today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`form-input ${errors.firstName ? "input-error" : ""}`}
                placeholder="John"
                required
                maxLength={50}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <span className="error-message" role="alert">
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`form-input ${errors.lastName ? "input-error" : ""}`}
                placeholder="Doe"
                required
                maxLength={50}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <span className="error-message" role="alert">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="john.doe@example.com"
              required
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dob">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className={`form-input ${errors.dob ? "input-error" : ""}`}
              required
              autoComplete="bday"
            />
            {errors.dob && (
              <span className="error-message" role="alert">
                {errors.dob}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <ShowHidePassword
                isVisible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            </div>
            {formData.password && (
              <PasswordStrengthMeter password={formData.password} />
            )}
            {errors.password && (
              <span className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              <ShowHidePassword
                isVisible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((prev) => !prev)}
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-message" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

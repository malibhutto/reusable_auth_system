import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../context/ToastContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "../styles/auth.css";

export const Home = () => {
  const { user, logout, logoutAll } = useAuth();
  const { addToast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      addToast("Logged out successfully.", "success");
    } catch {
      addToast("Error during logout.", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAll();
      addToast("Logged out of all active sessions.", "success");
    } catch {
      addToast("Error during global logout.", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="auth-wrapper dashboard-wrapper">
      {isLoggingOut && <LoadingSpinner message="Logging out..." />}

      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-card dashboard-card fade-in">
        <header className="auth-header dashboard-header">
          <span className="dashboard-label">User Workspace Dashboard</span>
          <h1 className="auth-title" style={{ marginTop: "4px" }}>
            Welcome back, {user.firstName}!
          </h1>
          <p className="auth-subtitle">
            Here is a summary of your personal account profile details.
          </p>
        </header>

        <dl className="dashboard-grid">
          <div className="dashboard-field">
            <dt className="dashboard-field-label">First Name</dt>
            <dd className="dashboard-field-value">{user.firstName}</dd>
          </div>

          <div className="dashboard-field">
            <dt className="dashboard-field-label">Last Name</dt>
            <dd className="dashboard-field-value">{user.lastName}</dd>
          </div>

          <div className="dashboard-field dashboard-field--full">
            <dt className="dashboard-field-label">Email Address</dt>
            <dd className="dashboard-field-value dashboard-field-value--break">
              {user.email}
            </dd>
          </div>

          <div className="dashboard-field">
            <dt className="dashboard-field-label">Age</dt>
            <dd className="dashboard-field-value">{user.age} Years Old</dd>
          </div>

          <div className="dashboard-field">
            <dt className="dashboard-field-label">Verification Status</dt>
            <dd className="dashboard-verified">
              <span aria-hidden="true">🟢</span> Verified
            </dd>
          </div>
        </dl>

        <div className="dashboard-actions">
          <button
            onClick={handleLogout}
            className="btn-submit"
            disabled={isLoggingOut}
            aria-label="Log out of this session"
          >
            🚪 Log Out Session
          </button>

          <button
            onClick={handleLogoutAll}
            className="btn-outline-danger"
            disabled={isLoggingOut}
            aria-label="Sign out of all devices"
          >
            🔒 Sign Out All Other Devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

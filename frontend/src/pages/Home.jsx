import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../components/Toast.jsx";
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
    } catch (err) {
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
    } catch (err) {
      addToast("Error during global logout.", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="auth-wrapper"
      style={{ minHeight: "100vh", padding: "40px 24px" }}
    >
      {isLoggingOut && <LoadingSpinner message="Logging out..." />}

      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div
        className="auth-card fade-in"
        style={{ maxWidth: "600px", gap: "32px" }}
      >
        <div
          className="auth-header"
          style={{
            textAlign: "left",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "20px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            User Workspace Dashboard
          </span>
          <h2 className="auth-title" style={{ marginTop: "4px" }}>
            Welcome back, {user.firstName}!
          </h2>
          <p className="auth-subtitle">
            Here is a summary of your personal account profile details.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              First Name
            </span>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              {user.firstName}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Last Name
            </span>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              {user.lastName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              gridColumn: "span 2",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Email Address
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                wordBreak: "break-all",
              }}
            >
              {user.email}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Age
            </span>
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              {user.age} Years Old
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Verification Status
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🟢 Verified
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={handleLogout}
            className="btn-submit"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
            }}
            disabled={isLoggingOut}
          >
            🚪 Log Out Session
          </button>

          <button
            onClick={handleLogoutAll}
            className="btn-submit"
            style={{
              background: "none",
              border: "1.5px solid var(--color-secondary)",
              color: "var(--color-secondary)",
              boxShadow: "none",
            }}
            disabled={isLoggingOut}
          >
            🔒 Sign Out All Other Devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

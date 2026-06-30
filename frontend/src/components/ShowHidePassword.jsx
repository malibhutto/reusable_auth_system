import React from "react";
import "../styles/auth.css";

/**
 * Toggle button styled as overlay inside input container.
 */
export const ShowHidePassword = ({ isVisible, onToggle }) => {
  return (
    <button
      type="button"
      className="input-icon-btn"
      onClick={onToggle}
      aria-label={isVisible ? "Hide Password" : "Show Password"}
    >
      {isVisible ? "👁️" : "🙈"}
    </button>
  );
};

export default ShowHidePassword;

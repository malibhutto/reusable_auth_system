import React from "react";
import "../styles/components.css";

export const LoadingSpinner = ({ message = "Please wait..." }) => {
  return (
    <div
      className="spinner-overlay"
      id="global-loading-spinner"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="spinner-container">
        <div className="spinner-circle" aria-hidden="true"></div>
        {message && <div className="spinner-text">{message}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

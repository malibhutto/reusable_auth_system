import React from "react";
import "../styles/components.css";

export const LoadingSpinner = ({ message = "Please wait..." }) => {
  return (
    <div className="spinner-overlay" id="global-loading-spinner">
      <div className="spinner-container">
        <div className="spinner-circle"></div>
        {message && <div className="spinner-text">{message}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;

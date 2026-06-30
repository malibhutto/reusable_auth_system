import React from "react";
import "../styles/components.css";

/**
 * Calculates password complexity index dynamically.
 * @param {string} pass
 * @returns {number} 0-4 complexity index
 */
export const getPasswordStrengthScore = (pass) => {
  let score = 0;
  if (!pass) return score;

  if (pass.length >= 8) score++; // length
  if (/[A-Z]/.test(pass)) score++; // uppercase
  if (/[a-z]/.test(pass) && /[0-9]/.test(pass)) score++; // lowercase & digit
  if (/[^A-Za-z0-9]/.test(pass)) score++; // special char

  return score;
};

export const PasswordStrengthMeter = ({ password }) => {
  const score = getPasswordStrengthScore(password);

  const getLabel = (strengthScore) => {
    switch (strengthScore) {
      case 0:
        return "Empty";
      case 1:
        return "Weak (Add upper/lower/numbers/symbols)";
      case 2:
        return "Fair (Better, but not secure)";
      case 3:
        return "Good (Almost there)";
      case 4:
        return "Strong (Excellent complexity)";
      default:
        return "Empty";
    }
  };

  return (
    <div className={`strength-meter-wrapper strength-${score}`}>
      <div className="strength-text">
        <span>Strength:</span>
        <span className="strength-label">{getLabel(score)}</span>
      </div>
      <div className="strength-meter-track">
        <div className="strength-meter-bar"></div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;

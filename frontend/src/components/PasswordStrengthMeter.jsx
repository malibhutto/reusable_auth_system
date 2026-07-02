import React from "react";
import { getPasswordStrengthScore } from "../utils/passwordStrength.js";
import "../styles/components.css";

const STRENGTH_LABELS = [
  "Empty",
  "Weak (Add upper/lower/numbers/symbols)",
  "Fair (Better, but not secure)",
  "Good (Almost there)",
  "Strong (Excellent complexity)",
];

const PasswordStrengthMeter = ({ password }) => {
  const score = getPasswordStrengthScore(password);

  return (
    <div
      className={`strength-meter-wrapper strength-${score}`}
      aria-label={`Password strength: ${STRENGTH_LABELS[score]}`}
    >
      <div className="strength-text">
        <span>Strength:</span>
        <span className="strength-label">{STRENGTH_LABELS[score]}</span>
      </div>
      <div
        className="strength-meter-track"
        role="progressbar"
        aria-valuenow={score * 25}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Password strength"
      >
        <div className="strength-meter-bar"></div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;

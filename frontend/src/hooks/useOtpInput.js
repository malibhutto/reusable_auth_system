import { useState, useRef } from "react";

/**
 * Shared hook for managing 6-digit OTP input state, focus navigation,
 * backspace handling, and paste support.
 *
 * @param {number} length - Number of OTP digits (default 6)
 * @returns {{ otpArray, inputRefs, handleOtpChange, handleKeyDown, handlePaste, resetOtp, otpCode }}
 */
export const useOtpInput = (length = 6) => {
  const [otpArray, setOtpArray] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const digit = cleanValue ? cleanValue.slice(-1) : "";

    setOtpArray((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // Auto-focus next box when a digit is entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      setOtpArray((prev) => {
        const next = [...prev];
        if (prev[index] === "" && index > 0) {
          next[index - 1] = "";
          // Move focus after state update
          setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
        } else {
          next[index] = "";
        }
        return next;
      });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .trim()
      .replace(/[^0-9]/g, "")
      .slice(0, length);

    if (pasteData.length === length) {
      setOtpArray(pasteData.split(""));
      inputRefs.current[length - 1]?.focus();
    }
  };

  const resetOtp = () => {
    setOtpArray(Array(length).fill(""));
    inputRefs.current[0]?.focus();
  };

  const otpCode = otpArray.join("");

  return {
    otpArray,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handlePaste,
    resetOtp,
    otpCode,
  };
};

export default useOtpInput;

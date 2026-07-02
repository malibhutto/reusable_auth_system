import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

/**
 * Access the toast notification context.
 * Must be used inside a ToastProvider.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

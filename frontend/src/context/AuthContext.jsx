import React, { useState, useEffect, useCallback, useRef } from "react";
import api, { setAccessToken, setOnTokenRefreshed } from "../services/api.js";
import { AuthContext } from "./authContextInstance.js";

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear session state
  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Fetch current profile details
  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
    } catch {
      clearSession();
    }
  }, [clearSession]);

  // Guard ref to prevent React StrictMode double-fire from rotating
  // the refresh token twice (the second call would use the already-deleted old token)
  const initRef = useRef(false);

  // Try to restore session on application bootstrap
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        // Trigger silent refresh using HttpOnly cookie
        const response = await api.post("/auth/refresh-token");
        const token = response.data.data.accessToken;
        setAccessToken(token);
        setUser(response.data.data.user);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearSession]);

  // Sync token rotations with user profile fetching
  useEffect(() => {
    setOnTokenRefreshed((token) => {
      if (token && !user) {
        fetchProfile();
      }
    });
  }, [user, fetchProfile]);

  // Format Axios error messages for easy handling
  const getErrorMessage = (error) => {
    return (
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  };

  // Actions
  const signup = async (userData) => {
    try {
      const response = await api.post("/auth/signup", userData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-email", { email, otp });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken: token, user: userProfile } = response.data.data;
      setAccessToken(token);
      setUser(userProfile);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue cleanup even if server route fails
    } finally {
      clearSession();
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
    } catch {
      // Continue cleanup even if server route fails
    } finally {
      clearSession();
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const verifyPasswordReset = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-password-reset", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const resetPassword = async (email, otp, password, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const value = {
    user,
    loading,
    signup,
    verifyEmail,
    resendVerification,
    login,
    logout,
    logoutAll,
    forgotPassword,
    verifyPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

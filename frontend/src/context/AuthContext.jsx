import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("kcca_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("kcca_user");
        localStorage.removeItem("kcca_token");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await api.post("/auth/login", { email: normalizedEmail, password });
      const { token, user: backendUser } = res.data;
      localStorage.setItem("kcca_token", token);
      localStorage.setItem("kcca_user", JSON.stringify(backendUser));
      setUser(backendUser);
      return backendUser;
    } catch (err) {
      const status = err.response?.status;
      const errCode = err.response?.data?.code;
      const errMsg = err.response?.data?.message;
      if (status === 403 && errCode === "EMAIL_NOT_VERIFIED") {
        const notVerifiedErr = new Error(errMsg || "Please verify your email before logging in.");
        notVerifiedErr.code = "EMAIL_NOT_VERIFIED";
        notVerifiedErr.email = err.response?.data?.email || normalizedEmail;
        throw notVerifiedErr;
      }
      throw new Error(errMsg || (status ? "Unable to sign in." : "The service is unavailable. Please try again later."));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("kcca_token");
    localStorage.removeItem("kcca_user");
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((previous) => {
      const updated = { ...previous, ...updates };
      localStorage.setItem("kcca_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

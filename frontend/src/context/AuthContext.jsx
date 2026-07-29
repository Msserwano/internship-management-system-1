// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { MOCK_USERS } from "../api/mockData";
import api from "../api/axios";

const AuthContext = createContext(null);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("kcca_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem("kcca_user"); }
    }
    setLoading(false);
  }, []);

  /**
   * Login strategy:
   *  1. Check if email matches a built-in demo/mock user (HR/Admin/Applicant)
   *  2. Attempt real backend login API
   *  3. Handle EMAIL_NOT_VERIFIED explicitly (re-throw for UI banner)
   *  4. If backend fails but mock user matches, fallback to mock user
   */
  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const mockFound = MOCK_USERS[normalizedEmail];

    // ── Attempt real backend login ────────────────────────────────────────────
    try {
      const res = await api.post("/auth/login", { email: normalizedEmail, password });
      const { token, user: backendUser } = res.data;

      localStorage.setItem("kcca_token", token);
      localStorage.setItem("kcca_user", JSON.stringify(backendUser));
      setUser(backendUser);
      return backendUser;
    } catch (err) {
      const status  = err.response?.status;
      const errCode = err.response?.data?.code;
      const errMsg  = err.response?.data?.message;

      // Email not verified — surface to UI with a specific error code
      if (status === 403 && errCode === "EMAIL_NOT_VERIFIED") {
        const notVerifiedErr = new Error(errMsg || "Please verify your email before logging in.");
        notVerifiedErr.code  = "EMAIL_NOT_VERIFIED";
        notVerifiedErr.email = err.response?.data?.email || normalizedEmail;
        throw notVerifiedErr;
      }

      // If backend returns 401/400 but mock user credentials match, fall back to mock login
      if (mockFound && mockFound.password === password) {
        await delay(300);
        const { password: _p, ...safeUser } = mockFound;
        const token = btoa(`${normalizedEmail}:${Date.now()}`);
        localStorage.setItem("kcca_token", token);
        localStorage.setItem("kcca_user", JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
      }

      // If wrong credentials on backend and not a valid mock user
      if (status === 401 || status === 400) {
        throw new Error(errMsg || "Invalid email or password.");
      }

      // Network error or backend offline fallback: check mock users
      if (mockFound && mockFound.password === password) {
        await delay(300);
        const { password: _p, ...safeUser } = mockFound;
        const token = btoa(`${normalizedEmail}:${Date.now()}`);
        localStorage.setItem("kcca_token", token);
        localStorage.setItem("kcca_user", JSON.stringify(safeUser));
        setUser(safeUser);
        return safeUser;
      }

      throw new Error(errMsg || "Invalid email or password.");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("kcca_token");
    localStorage.removeItem("kcca_user");
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("kcca_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

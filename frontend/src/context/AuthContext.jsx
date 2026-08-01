import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Decode a JWT payload client-side (no library needed — just base64 decode)
// Returns the payload object, or null if the token is malformed.
// ---------------------------------------------------------------------------
const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json   = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Returns true only when the token exists and has NOT yet expired.
const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;
  // exp is Unix seconds; Date.now() is milliseconds
  return payload.exp * 1000 > Date.now();
};

// ---------------------------------------------------------------------------
// Exported helper — called by the axios response interceptor on 401 errors
// so we can clear storage without creating a circular import.
// ---------------------------------------------------------------------------
export const clearAuthStorage = () => {
  localStorage.removeItem("kcca_token");
  localStorage.removeItem("kcca_user");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: validate the stored token before trusting the stored user.
  useEffect(() => {
    const token  = localStorage.getItem("kcca_token");
    const stored = localStorage.getItem("kcca_user");

    // If there is no token, or the token has expired → clear everything.
    if (!isTokenValid(token)) {
      clearAuthStorage();
      setLoading(false);
      return;
    }

    // Token is valid — restore the user object from storage.
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role) {
          parsed.role = String(parsed.role).toLowerCase();
        }
        setUser(parsed);
      } catch {
        // Corrupted JSON — wipe and stay logged out.
        clearAuthStorage();
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const res = await api.post("/auth/login", { email: normalizedEmail, password });
      const { token, user: backendUser } = res.data;
      if (backendUser && backendUser.role) {
        backendUser.role = String(backendUser.role).toLowerCase();
      }
      localStorage.setItem("kcca_token", token);
      localStorage.setItem("kcca_user", JSON.stringify(backendUser));
      setUser(backendUser);
      return backendUser;
    } catch (err) {
      const status = err.response?.status;
      const errCode = err.response?.data?.code;
      const errMsg  = err.response?.data?.message;
      if (status === 403 && errCode === "EMAIL_NOT_VERIFIED") {
        const notVerifiedErr = new Error(errMsg || "Please verify your email before logging in.");
        notVerifiedErr.code  = "EMAIL_NOT_VERIFIED";
        notVerifiedErr.email = err.response?.data?.email || normalizedEmail;
        throw notVerifiedErr;
      }
      throw new Error(errMsg || (status ? "Unable to sign in." : "The service is unavailable. Please try again later."));
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
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

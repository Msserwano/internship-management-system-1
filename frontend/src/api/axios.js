
import axios from "axios";
import { notifyDataChanged } from "../utils/eventBus";
import { clearAuthStorage } from "../context/AuthContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kcca_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Notify subscribers of data mutations so pages can silently refetch
    const method = res.config?.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      notifyDataChanged(res.config?.url || "");
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      // Token rejected by the server — wipe stored session and redirect to login
      clearAuthStorage();
      // Use replace so the user can't go "back" to the protected page
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;

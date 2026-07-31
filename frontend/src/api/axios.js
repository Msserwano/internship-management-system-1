
import axios from "axios";
import { notifyDataChanged } from "../utils/eventBus";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kcca_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    const method = res.config?.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      notifyDataChanged(res.config?.url || "");
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("kcca_token");
      localStorage.removeItem("kcca_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

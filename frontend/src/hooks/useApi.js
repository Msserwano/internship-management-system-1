// src/hooks/useApi.js
// Generic hook for fetching data from any API endpoint with loading/error states.
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * useApi(url, deps)
 * Fetches `url` on mount and whenever `deps` change.
 * Returns { data, loading, error, refetch }
 *
 * Example:
 *   const { data, loading, refetch } = useApi("/applications?applicantId=U001");
 */
const useApi = (url, deps = []) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      // The backend wraps lists in { success, data } or { success, count, data }
      setData(res.data?.data ?? res.data);
    } catch (err) {
      console.error(`[useApi] ${url}`, err);
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => { fetch(); }, [fetch, ...deps]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;

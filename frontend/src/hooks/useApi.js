

import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { subscribeDataChange } from "../utils/eventBus";

const useApi = (url, deps = []) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async (isSilent = false) => {
    if (!url) return;
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      setData(res.data?.data ?? res.data);
    } catch (err) {
      console.error(`[useApi] ${url}`, err);
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetch();

    // Auto-refetch silently whenever any data change is broadcast (from local admin actions or other tabs)
    const unsubscribe = subscribeDataChange(() => {
      fetch(true);
    });

    return () => unsubscribe();
  }, [fetch, ...deps]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;

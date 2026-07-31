

import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";


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

      setData(res.data?.data ?? res.data);
    } catch (err) {
      console.error(`[useApi] ${url}`, err);
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }

  }, [url]);

  useEffect(() => { fetch(); }, [fetch, ...deps]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;

import { useEffect, useState, useCallback } from "react";
import { useApi } from "./ApiContext";

export default function useQuery(resource, tag) {
  const { request, provideTag } = useApi();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await request(resource);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [request, resource]);

  useEffect(() => {
    // Call query only after mount / resource change
    if (tag) provideTag(tag, query);
    query();
  }, [query, tag, provideTag]);

  return { data, loading, error };
}

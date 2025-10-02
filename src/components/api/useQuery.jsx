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
    setData(undefined);
    try {
      const result = await request(resource);
      setData(result);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [request, resource]);

  useEffect(() => {
    setData(undefined);
    setError(null);
  }, [resource]);

  useEffect(() => {
    if (tag) provideTag(tag, query);
    query();
  }, [resource, tag, query, provideTag]);
  return { data, loading, error, refetch: query };
}

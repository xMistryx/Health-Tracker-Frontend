import { useState } from "react";
import { useApi } from "./ApiContext";

export default function useMutation(method, resource, tagToInvalidate) {
  const { request, invalidateTags } = useApi();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (body, dynamicResource) => {
    setLoading(true);
    setError(null);
    try {
      const target = dynamicResource || resource; // fallback to default
      const result = await request(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setData(result);

      if (tagToInvalidate) {
        invalidateTags(tagToInvalidate);
      }

      return result;
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
}

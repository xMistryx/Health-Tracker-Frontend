import { useState } from "react";
import { useApi } from "./ApiContext";

export default function useMutation(method, resource, tagToInvalidate) {
    const { request, invalidateTags } = useApi();
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (body) => {
        setLoading(true);
        setError(null);
        try {
            const result = await request(resource, {
                method,
                body: JSON.stringify(body)
            });
            setData(result);
            invalidateTags(tagToInvalidate);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    return { mutate, data, loading, error };
}
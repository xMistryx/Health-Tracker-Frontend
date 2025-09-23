import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

export const API = "http://localhost:3000";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const { token } = useAuth();

  const request = useCallback(
    async (resource, options) => {
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(API + resource, {
        ...options,
        headers,
      });
      const isJson = /json/.test(response.headers.get("Content-Type"));
      const result = isJson ? await response.json() : undefined;
      if (!response.ok) {
        console.error("API error:", result);
        throw Error(result?.message || JSON.stringify(result));
      }
      return result;
    },
    [token]
  ); 

  const [tags, setTags] = useState({});

  const provideTag = useCallback((tag, query) => {
    setTags((prevTags) => ({ ...prevTags, [tag]: query }));
  }, []);

  const invalidateTags = useCallback((tagsToInvalidate) => {
    setTags((prevTags) => {
      tagsToInvalidate.forEach((tag) => {
        const query = prevTags[tag];
        if (query) query();
      });
      return prevTags;
    });
  }, []);

  const value = { request, provideTag, invalidateTags };
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw Error("useApi needs to be inside ApiProvider");
  return context;
}

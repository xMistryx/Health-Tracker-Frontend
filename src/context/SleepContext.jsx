// context/SleepContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const SleepContext = createContext();

export function SleepProvider({ children }) {
  const [sleepLogs, setSleepLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from backend
  const fetchSleepLogs = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/sleep", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch sleep logs");
      const data = await res.json();
      setSleepLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  // Add new log to backend + update state
  const addSleepLog = async (log) => {
    try {
      const res = await fetch("http://localhost:3000/api/sleep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(log),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add sleep log");
      }

      const newLog = await res.json();
      setSleepLogs((prev) => [...prev, newLog]); // update locally
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SleepContext.Provider
      value={{ sleepLogs, loading, fetchSleepLogs, addSleepLog }}
    >
      {children}
    </SleepContext.Provider>
  );
}

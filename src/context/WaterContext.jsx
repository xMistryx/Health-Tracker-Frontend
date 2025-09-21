// context/WaterContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const WaterContext = createContext();

export function WaterProvider({ children }) {
  const [todayOz, setTodayOz] = useState(0);

  // fetch water logs for today on mount
  useEffect(() => {
    async function fetchToday() {
      try {
        const res = await fetch("http://localhost:3000/api/water/today", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTodayOz(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch water logs", err);
      }
    }
    fetchToday();
  }, []);

  // expose todayOz + setter so logs can update it
  return (
    <WaterContext.Provider value={{ todayOz, setTodayOz }}>
      {children}
    </WaterContext.Provider>
  );
}

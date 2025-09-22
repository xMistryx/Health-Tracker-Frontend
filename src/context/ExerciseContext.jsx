import React, { createContext, useContext, useState, useEffect } from "react";

const ExerciseContext = createContext();

export function useExercise() {
  return useContext(ExerciseContext);
}

export function ExerciseProvider({ children }) {
  const [exerciseLogs, setExerciseLogs] = useState([]);

  // Fetch all logs on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/exercise_logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch exercise logs");
      const data = await res.json();
      setExerciseLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addExerciseLog = async ({ date, exercise_type, duration }) => {
    try {
      const res = await fetch("http://localhost:3000/api/exercise_logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ date, exercise_type, duration }),
      });
      if (!res.ok) throw new Error("Failed to add exercise log");
      const newLog = await res.json();
      setExerciseLogs((prev) => [...prev, newLog]);
    } catch (err) {
      console.error(err);
    }
  };

  const value = {
    exerciseLogs,
    fetchLogs,
    addExerciseLog,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TipBox from "../tips/TipBox";
import "./ExerciseProgress.css";

// Map exercise types exactly to DB values
const typeColors = {
  Cardio: "#A8C3A0",
  "Strength Training": "#D9A48F",
  "Flexibility Training": "#6FA49C",
  "Balance Training": "#4B7A74",
  Stretching: "#B3735D",
};

function ExerciseRow({ day, exercises, isToday }) {
  const totalMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className={`exercise-row ${isToday ? "today" : ""}`}>
      <span className="day-label">
        {day.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

      <div className="exercise-timeline">
        {exercises.map((ex, idx) => (
          <div
            key={idx}
            className="exercise-block"
            style={{
              backgroundColor: typeColors[ex.type] || "#ccc",
              width: `${ex.duration}px`, // 1 min = 1px (adjust scale if needed)
            }}
            title={`${ex.type} - ${ex.duration} min`}
          />
        ))}
      </div>

      <span className="total-minutes">{totalMinutes} min</span>
    </div>
  );
}

export default function ExerciseProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const [range, setRange] = useState("week");
  const [exerciseLogs, setExerciseLogs] = useState([]);

  // Fetch logs from correct backend route
  useEffect(() => {
    async function fetchExercises() {
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
    }
    fetchExercises();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const days = [];
  let length = range === "month" ? 30 : range === "week" ? 7 : 1;
  for (let i = 0; i < length; i++) {
    const d = new Date();
    if (range === "yesterday") d.setDate(d.getDate() - 1);
    else if (range === "week" || range === "month") {
      d.setDate(d.getDate() - (length - 1 - i));
    }

    const dateStr = d.toISOString().split("T")[0];

    const exercises = exerciseLogs
      .filter(
        (log) => new Date(log.date).toISOString().split("T")[0] === dateStr
      )
      .map((log) => ({
        type: log.exercise_type,
        duration: log.duration,
      }));

    days.push({ day: d, exercises });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Exercise Progress</h1>
      <div className="progress-container">
        {/* LEFT COLUMN NAVIGATION */}
        <div className="left-column">
          <button
            onClick={() => navigate("/dashboard")}
            className={`btn ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
          >
            ⬅ Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/progress/water")}
            className={`btn btn-water ${
              location.pathname === "/progress/water" ? "active" : ""
            }`}
          >
            Water
          </button>
          <button
            onClick={() => navigate("/progress/sleep")}
            className={`btn btn-sleep ${
              location.pathname === "/progress/sleep" ? "active" : ""
            }`}
          >
            Sleep
          </button>
          <button
            onClick={() => navigate("/progress/exercise")}
            className={`btn btn-exercise ${
              location.pathname === "/progress/exercise" ? "active" : ""
            }`}
          >
            Exercise
          </button>
        </div>

        {/* RIGHT COLUMN CONTENT */}
        <div className="right-column">
          <div className="range-buttons">
            {["today", "yesterday", "week", "month"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`btn-range ${range === r ? "active" : ""}`}
              >
                {r === "week"
                  ? "1 Week"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="exercise-grid mt-4">
            {days.map((d, idx) => (
              <ExerciseRow
                key={idx}
                day={d.day}
                exercises={d.exercises}
                isToday={d.day.toISOString().split("T")[0] === todayStr}
              />
            ))}
          </div>

          <div className="mt-6">
            <TipBox category="Exercise" />
          </div>
        </div>
      </div>
    </div>
  );
}

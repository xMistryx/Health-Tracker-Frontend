import React, { useState, useEffect } from "react";
import TipBox from "../tips/TipBox";
import { useNavigate } from "react-router-dom";
import Header from "../navbar/Header.jsx";
import "./ExerciseProgress.css";

export default function ExerciseProgress({ range: initialRange = "week" }) {
  const [category, setCategory] = useState("Exercise");
  const [range, setRange] = useState(initialRange);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const navigate = useNavigate();

  // ✅ Color mapping for exercise types
  const typeColors = {
    Cardio: "#A8C3A0",
    "Strength Training": "#D9A48F",
    "Flexibility Training": "#6FA49C",
    "Balance Training": "#4B7A74",
    Stretching: "#B3735D",
  };

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:3000/api/exercise_logs", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch exercise logs");
        const data = await res.json();

        // ✅ Normalize: add "activity" so we can use it consistently
        const normalized = data.map((log) => ({
          ...log,
          activity: log.exercise_type, // <-- add alias
        }));

        setExerciseLogs(normalized);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLogs();
  }, []);

  // Prepare display data
  const todayStr = new Date().toISOString().split("T")[0];
  const rangeLengths = { today: 1, yesterday: 1, week: 7, month: 30 };
  const length = rangeLengths[range] || 7;

  const data = Array.from({ length }, (_, i) => {
    const d = new Date();
    if (range === "yesterday") d.setDate(d.getDate() - 1);
    else if (range === "week" || range === "month")
      d.setDate(d.getDate() - (length - 1 - i));

    const dateStr = d.toISOString().split("T")[0];
    const logs = exerciseLogs.filter((l) => l.date.split("T")[0] === dateStr);
    const totalMinutes = logs.reduce((sum, l) => sum + l.duration, 0);

    return {
      dateStr,
      label: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      logs,
      totalMinutes,
    };
  });

  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">{category} Progress</h1>

      {/* Dropdowns below heading */}
      <div className="filters mb-4 flex gap-4">
        <select
          className="dropdown"
          value={category}
          onChange={(e) => {
            const cat = e.target.value;
            setCategory(cat);

            // Navigate to the corresponding page
            if (cat === "Water") navigate("/progress/water");
            else if (cat === "Sleep") navigate("/progress/sleep");
            else if (cat === "Exercise") navigate("/progress/exercise");
            else if (cat === "Food") navigate("/progress/food");
          }}
        >
          {["Water", "Sleep", "Exercise", "Food"].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="dropdown"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {["today", "yesterday", "week", "month"].map((r) => (
            <option key={r} value={r}>
              {r === "week" ? "1 Week" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise data rows */}
      <div className={`exercise-grid ${range === "month" ? "month-view" : ""}`}>
        {data.map((d) => (
          <div
            key={d.dateStr}
            className={`exercise-row ${d.dateStr === todayStr ? "today" : ""}`}
          >
            <span className="day-label">{d.label}</span>
            <div className="exercise-timeline">
              {d.logs.map((l, i) => (
                <div
                  key={i}
                  className="exercise-block"
                  style={{
                    flex: l.duration,
                    backgroundColor: typeColors[l.activity] || "#6fa49c", // ✅ use activity
                  }}
                  title={`${l.activity} - ${l.duration} min`} // ✅ tooltip fixed
                />
              ))}
            </div>
            <span className="total-minutes">{d.totalMinutes} min</span>
          </div>
        ))}
      </div>

      {/* Legend for exercise types */}
      <div className="legend mt-4 flex flex-wrap gap-4">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="legend-item flex items-center gap-2">
            <div
              className="legend-color-box"
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: color,
              }}
            />
            <span>{type}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <TipBox category={category} />
      </div>
    </div>
  );
}

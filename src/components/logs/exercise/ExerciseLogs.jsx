import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import ExerciseForm from "./ExerciseForm";
import TipBox from "../../tip/Tip";
import ExerciseTooltip from "./ExerciseTooltip";
import Encouragement from "../../encouragement/Encouragement";
import "./ExerciseLogs.css";

const typeColors = {
  Cardio: "#D9A48F",
  "Strength Training": "#A8C3A0",
  "Flexibility Training": "#6FA49C",
  "Balance Training": "#4B7A74",
  Stretching: "#B3735D",
};

function ExerciseRow({ day, exercises, isToday }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const totalMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className={`exercise-exercise-row ${isToday ? "today" : ""}`}>
      <span className="exercise-day-label">{day.getDate()}</span>

      <div className="exercise-exercise-timeline">
        {exercises.map((ex, idx) => (
          <div
            key={idx}
            className="exercise-exercise-block"
            style={{
              backgroundColor: typeColors[ex.type] || "#ccc",
              width: `${ex.duration}px`,
            }}
            onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
          >
            <ExerciseTooltip
              exercise={ex}
              isActive={activeTooltip === idx}
              onClose={() => setActiveTooltip(null)}
            />
          </div>
        ))}
      </div>

      <span className="exercise-total-minutes">{totalMinutes} min</span>
    </div>
  );
}

export default function ExerciseLogs() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Fetch exercise logs
  const {
    data: rawExerciseLogs,
    loading,
    error,
  } = useQuery("/exercise_logs", "exercise_logs");

  // Fetch encouragements
  const { data: encouragements = [] } = useQuery(
    "/encouragements",
    "encouragements"
  );

  const [logs, setLogs] = useState(rawExerciseLogs || []);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef("");

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    setLogs(rawExerciseLogs || []);
  }, [rawExerciseLogs]);

  if (!token) return <p>Please sign in to view your exercise logs.</p>;
  if (loading) return <p>Loading exercise logs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  // Fill missing dates
  const fillMissingDates = (logsArray) => {
    const result = [];
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];

      const exercises = logsArray
        .filter((log) => log.date.split("T")[0] === dateStr)
        .map((log) => ({
          id: log.id,
          type: log.exercise_type || log.type || "Unknown",
          duration: Number(log.duration || 0),
          notes: log.notes || "",
          date: log.date,
        }));

      result.push({ day: d, exercises });
    }
    return result;
  };

  const days = fillMissingDates(logs);

  const totalMinutes = days.reduce(
    (sum, d) => sum + d.exercises.reduce((eSum, e) => eSum + e.duration, 0),
    0
  );
  const avgMinutes = (totalMinutes / days.length).toFixed(1);

  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleExerciseAdded = (newLog) => {
    if (!newLog) return;

    const log = {
      type: newLog.exercise_type || newLog.type || "Unknown",
      duration: Number(newLog.duration || 0),
      date: newLog.date,
    };

    const updatedLogs = [...logs, log];
    setLogs(updatedLogs);

    // Use a ref to track triggered milestones
    const triggeredRef =
      lastMilestoneRef.currentSet || (lastMilestoneRef.currentSet = new Set());

    let milestoneKey = null;

    // --- Type-based milestones ---
    if (log.type === "Strength Training" && log.duration >= 30)
      milestoneKey = "Strength30";
    else if (log.type === "Cardio" && log.duration >= 20)
      milestoneKey = "Cardio20";
    else if (log.type === "Flexibility Training" && log.duration >= 15)
      milestoneKey = "Flexibility15";
    else if (log.type === "Balance Training" && log.duration >= 10)
      milestoneKey = "Balance10";

    // --- Count-based milestones ---
    const exercisesToday = updatedLogs.filter(
      (l) => l.date.split("T")[0] === log.date.split("T")[0]
    );

    if (!milestoneKey) {
      // Only if no type-based milestone triggered
      if (exercisesToday.length === 1) milestoneKey = "1Log";
      else if (exercisesToday.length === 5) milestoneKey = "5Logs";
      else if (exercisesToday.length === 10) milestoneKey = "10Logs";
      else if (exercisesToday.length === 20) milestoneKey = "20Logs";
    }

    // Skip if milestone already triggered
    if (!milestoneKey || triggeredRef.has(milestoneKey)) return;

    const encouragement = encouragements.find(
      (e) =>
        e.category?.toLowerCase().trim() === "exercise" &&
        e.milestone?.toLowerCase().trim() === milestoneKey.toLowerCase()
    );

    if (encouragement) {
      setToastMessage(encouragement.message);
      triggeredRef.add(milestoneKey);
      console.log("Encouragement shown:", encouragement.message);
    }
  };

  return (
    <div className="exercise-page-container">
      <h1 className="text-2xl font-bold mb-6">Exercise Log</h1>
      <div className="exercise-progress-container">
        <div className="exercise-left-column">
          <button
            onClick={() => navigate("/dashboard")}
            className="exercise-btn"
          >
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{currentMonthName}</p>
        </div>

        <div className="exercise-right-column">
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

          <ExerciseForm onAdded={handleExerciseAdded} />

          <Encouragement
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

          <div className="exerciseinfo">
            <p>
              <strong>Total:</strong> {totalMinutes} minutes
            </p>
            <p>
              <strong>Average:</strong> {avgMinutes} minutes
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TipBox
          category={["Exercise & Movement", "Rest & Recovery", "Balance"]}
        />
      </div>
    </div>
  );
}

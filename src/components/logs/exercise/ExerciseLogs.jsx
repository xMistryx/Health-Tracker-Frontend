import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import ExerciseForm from "./ExerciseForm";
import TipBox from "../../tip/Tip";
import Encouragement from "../../encouragement/Encouragement";
import "./ExerciseLogs.css";

const typeColors = {
  Cardio: "#D9A48F",
  "Strength Training": "#A8C3A0",
  "Flexibility Training": "#6FA49C",
  "Balance Training": "#4B7A74",
  Stretching: "#B3735D",
};
const getIntensityClass = (exerciseIndex) => {
  if (exerciseIndex === 0) return "intensity-1";
  if (exerciseIndex === 1) return "intensity-2";
  if (exerciseIndex === 2) return "intensity-3";
  if (exerciseIndex === 3) return "intensity-4";
  if (exerciseIndex === 4) return "intensity-5";
  return "intensity-6";
};

function ExerciseRow({ day, exercises, isToday }) {
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
            title={`${ex.type} - ${ex.duration} min`}
          />
        ))}
      </div>

      <span className="exercise-total-minutes">{totalMinutes} min</span>
    </div>
  );
}

export default function ExerciseLogs() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    data: rawExerciseLogs,
    loading,
    error,
  } = useQuery("/exercise_logs", "exercise_logs");

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
          type: log.exercise_type,
          duration: log.duration,
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

  const summary = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Encouragement messages
  const encouragementMessages = {
    "1Exercise": "Great start! Keep moving! 💪",
    "3Exercises": "Awesome! You're building consistency!",
    "5Exercises": "Wow! Your effort this week is paying off!",
    "10Exercises": "Incredible! Your habits are unstoppable!",
  };

  const handleExerciseAdded = (newLog) => {
    console.log("Exercise added:", newLog);
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    const exercisesToday = updatedLogs.filter(
      (log) => log.date.split("T")[0] === newLog.date.split("T")[0]
    );

    let milestoneKey = null;
    if (exercisesToday.length >= 10) milestoneKey = "10Exercises";
    else if (exercisesToday.length >= 5) milestoneKey = "5Exercises";
    else if (exercisesToday.length >= 3) milestoneKey = "3Exercises";
    else if (exercisesToday.length >= 1) milestoneKey = "1Exercise";

    if (milestoneKey && lastMilestoneRef.current !== milestoneKey) {
      setToastMessage(encouragementMessages[milestoneKey]);
      lastMilestoneRef.current = milestoneKey;
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
          <p className="font-bold mb-4">{summary}</p>
        </div>

        <div className="exercise-right-column">
          <div className="exercise-grid">
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

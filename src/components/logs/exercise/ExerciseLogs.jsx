import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import ExerciseForm from "./ExerciseForm";
import TipBox from "../../tip/Tip";
import "./ExerciseLogs.css";

const typeColors = {
  Cardio: "#D9A48F",
  "Strength Training": "#A8C3A0",
  "Flexibility Training": "#6FA49C",
  "Balance Training": "#4B7A74",
  Stretching: "#B3735D",
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

export default function ExerciseProgress() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    data: rawExerciseLogs,
    loading,
    error,
  } = useQuery("/exercise_logs", "exercise_logs");

  const exerciseLogs = rawExerciseLogs || [];

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  if (!token) {
    return (
      <div className="exercise-page-container">
        <h1 className="text-2xl font-bold mb-6">Exercise Log</h1>
        <p>Please sign in to view your exercise logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="exercise-page-container">
        <h1 className="text-2xl font-bold mb-6">Exercise Log</h1>
        <p>Loading exercise logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exercise-page-container">
        <h1 className="text-2xl font-bold mb-6">Exercise Logs</h1>
        <p className="text-red-500">Error loading exercise logs: {error}</p>
      </div>
    );
  }

  function fillMissingDates(logs) {
    const result = [];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];

      const exercises = logs
        .filter(
          (log) => new Date(log.date).toISOString().split("T")[0] === dateStr
        )
        .map((log) => ({
          type: log.exercise_type,
          duration: log.duration,
        }));

      result.push({ day: d, exercises });
    }

    return result;
  }

  const days = fillMissingDates(exerciseLogs);

  const totalMinutes = days.reduce(
    (sum, d) => sum + d.exercises.reduce((exSum, e) => exSum + e.duration, 0),
    0
  );
  const avgMinutes = (totalMinutes / days.length).toFixed(1);

  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const summary = `${currentMonthName}`;

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
          <ExerciseForm />
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

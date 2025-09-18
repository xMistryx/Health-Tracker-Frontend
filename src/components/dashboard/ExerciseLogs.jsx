import React, { useState } from "react";
import exerciseIcon from "../../assets/images/fitness-icon.jpg";

export default function ExerciseLogs({ date }) {
  const [exerciseType, setExerciseType] = useState("Stretching");
  const [duration, setDuration] = useState("");

  return (
    <div className="exercise-log">
      {/* Left Icon */}
      <img src={exerciseIcon} alt="Exercise" />

      {/* Inputs */}
      <select
        value={exerciseType}
        onChange={(e) => setExerciseType(e.target.value)}
      >
        <option value="Stretching">Stretching</option>
        <option value="Cardio">Cardio</option>
        <option value="Strength Training">Strength Training</option>
        <option value="Flexibility Training">Flexibility Training</option>
        <option value="Balance Training">Balance Training</option>
      </select>
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
    </div>
  );
}

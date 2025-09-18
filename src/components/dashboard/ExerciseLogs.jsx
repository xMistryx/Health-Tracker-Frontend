import React, { useState } from "react";
import exerciseIcon from "../../assets/images/fitness-icon.jpg";

export default function ExerciseLogs({ date }) {
  const [exerciseType, setExerciseType] = useState("Stretching");
  const [duration, setDuration] = useState("");

  const handleAddExercise = async () => {
    if (!exerciseType || duration === "") {
      return alert("Enter all fields!");
    }

    try {
      const res = await fetch("http://localhost:3000/api/exercise_logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date,
          exercise_type: exerciseType,
          duration: Number(duration),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add exercise log");
      }

      const data = await res.json();
      alert(`Exercise log added: ${exerciseType} for ${duration} minutes`);
      setDuration(""); // reset input
    } catch (err) {
      console.error(err);
      alert("Error adding exercise log: " + err.message);
    }
  };

  return (
    <div className="exercise-log">
      {/* Left Icon */}
      <img
        src={exerciseIcon}
        alt="Exercise"
        style={{ width: "40px", height: "40px", marginRight: "10px" }}
      />

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

      <button onClick={handleAddExercise}>Add</button>
    </div>
  );
}

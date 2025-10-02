import React from "react";
import useMutation from "../../api/useMutation";
import "./ExerciseTooltip.css";

const ExerciseTooltip = ({ exercise, isActive, onClose}) => {
  const { mutate } = useMutation("DELETE", "/exercise_logs/" + exercise.id, ["exercise_logs"]);

  if (!isActive) return null;

  return (
    <>
      <div className="tooltip-backdrop" onClick={onClose}></div>
      <div className="custom-tooltip active">
        <strong>{exercise.exercise_type || exercise.type}</strong>
        <br />
        Duration: {exercise.duration} minutes
        <br />
        <div className="tooltip-buttons">
          <button className="tooltip-button" onClick={() => mutate()}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default ExerciseTooltip;

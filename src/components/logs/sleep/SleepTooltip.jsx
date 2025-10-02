import React from "react";
import useMutation from "../../api/useMutation";
import "./SleepTooltip.css";

const SleepTooltip = ({ segment, isActive, onClose }) => {
  const { mutate } = useMutation("DELETE", "/sleep_logs/" + segment.id, ["sleep_logs"]);

  if (!isActive) return null;

  const formatTime = (hourDecimal) => {
    const h = Math.floor(hourDecimal % 24);
    const m = Math.round((hourDecimal % 1) * 60);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <>
      <div className="tooltip-backdrop" onClick={onClose}></div>
      <div className="custom-tooltip active">
        <strong>{segment.type}</strong>
        <br />
        Start: {formatTime(segment.start)}
        <br />
        End: {formatTime(segment.end)}
        <br />
        Duration: {segment.duration.toFixed(1)} hours
        <div className="tooltip-buttons">
          <button className="tooltip-button" onClick={() => mutate()}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default SleepTooltip;

import React, { useState } from "react";
import sleepIcon from "../../assets/images/sleep-icon.jpg";

export default function SleepLogs({ date }) {
  const [sleepType, setSleepType] = useState("Sleep");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");

  return (
    <div className="sleep-log">
      {/* Left Icon */}
      <img src={sleepIcon} alt="Sleep" />

      {/* Inputs */}
      <select value={sleepType} onChange={(e) => setSleepType(e.target.value)}>
        <option value="Sleep">Sleep</option>
        <option value="Nap">Nap</option>
      </select>
      <input
        type="time"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <input
        type="time"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
    </div>
  );
}

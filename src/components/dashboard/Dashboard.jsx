import React, { useState } from "react";
import Header from "../navbar/Header.jsx";

import WaterLogs from "./WaterLogs";
import SleepLogs from "./SleepLogs";
import ExerciseLogs from "./ExerciseLogs";
import "./Dashboard.css";

export default function Dashboard({ user, onSignOut }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div className="dashboard-container">
      <Header user={user} onSignOut={onSignOut} />

      <div className="date-picker-container">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="logs-section">
        <WaterLogs date={date} />
        <SleepLogs date={date} />
        <ExerciseLogs date={date} />
      </div>
    </div>
  );
}

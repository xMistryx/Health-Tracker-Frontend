import React, { useState } from "react";
import WaterDash from "./WaterDash";
import SleepDash from "./SleepDash";
import ExerciseDash from "./ExerciseDash";
import "./Dashboard.css";

export default function Dashboard({ user, onSignOut }) {
  const today = new Date();
  const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const [date, setDate] = useState(todayString);

  console.log("Dashboard rendering with date:", date);

  return (
    <div className="dashboard-container">
      <div className="date-picker-container">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            console.log("Date changed to:", e.target.value);
            setDate(e.target.value);
          }}
        />
      </div>

      <div className="logs-section">
        <WaterDash date={date} />
        <SleepDash date={date} />
        <ExerciseDash date={date} />
      </div>
    </div>
  );
}

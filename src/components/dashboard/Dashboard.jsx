import React, { useState } from "react";
import WaterDash from "./WaterDash";
import SleepDash from "./SleepDash";
import ExerciseDash from "./ExerciseDash";
import FoodDash from "./FoodDash";
import AffirmationBox from "./Affirmation";
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

  return (
    <div className="dashboard-container">
      <div className="date-picker-container">
        <input
          type="date"
          value={date}
          onChange={(e) => {
          setDate(e.target.value);
          }}
        />
      </div>

      <div className="logs-section">
        <WaterDash date={date} />
        <SleepDash date={date} />
        <ExerciseDash date={date} />
        <FoodDash date={date} />
        <AffirmationBox />
      </div>
    </div>
  );
}

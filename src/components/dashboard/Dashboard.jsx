import React, { useState } from "react";
import Header from "../navbar/Header.jsx";
import WaterLogs from "./WaterLogs";
import SleepLogs from "./SleepLogs";
import ExerciseLogs from "./ExerciseLogs";
import "./Dashboard.css";

export default function Dashboard({ user, onSignOut }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // yyyy-mm-dd

  const handleSubmitAll = (e) => {
    e.preventDefault();
    // Collect all forms data and submit to backend
    alert("All logs submitted!");
  };

  return (
    <div className="dashboard-container">
      {/* Navbar Header */}
      <Header user={user} onSignOut={onSignOut} />

      {/* Common Date Picker */}
      <div className="date-picker-container">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* All forms */}
      <form onSubmit={handleSubmitAll} className="logs-section">
        <WaterLogs date={date} />
        <SleepLogs date={date} />
        <ExerciseLogs date={date} />

        {/* Submit Button */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="submit" className="submit-btn">
            Submit All
          </button>
        </div>
      </form>
    </div>
  );
}

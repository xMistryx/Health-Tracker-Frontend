import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import TipBox from "../../tip/Tip";
import "./WaterLogs.css";

function DropletRow({ label, oz, isToday }) {
  const droplets = Math.floor(oz / 8);
  const half = oz % 8 >= 4;
  const totalDroplets = 10;

  return (
    <div className={`water-droplet-row ${isToday ? "today" : ""}`}>
      <span className="water-day-label">{label}</span>
      <div className="water-droplets" aria-hidden>
        {Array.from({ length: totalDroplets }, (_, i) => {
          const fill =
            i < droplets ? "full" : i === droplets && half ? "half" : "empty";
          return (
            <span
              key={i}
              className={`water-droplet ${fill}`}
              title={`${oz} oz on ${label}`}
            >
              💧
            </span>
          );
        })}
      </div>
      <span className="water-day-total">{oz} oz</span>
    </div>
  );
}

export default function WaterLogs() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    data: rawWaterLogs,
    loading,
    error,
  } = useQuery("/water_logs", "water");

  const waterLogs = rawWaterLogs
    ? rawWaterLogs
        .map((row) => ({
          date: row.date.split("T")[0],
          total_oz: Number(row.total_oz),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  if (!token) {
    return (
      <div className="water-page-container">
        <h1 className="text-2xl font-bold mb-6">Water Log</h1>
        <p>Please sign in to view your water logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="water-page-container">
        <h1 className="text-2xl font-bold mb-6">Water Log</h1>
        <p>Loading water logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="water-page-container">
        <h1 className="text-2xl font-bold mb-6">Water Logs</h1>
        <p className="text-red-500">Error loading water logs: {error}</p>
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
      const found = logs.find((l) => l.date === dateStr);
      result.push({
        date: dateStr,
        label: d.getDate().toString(),
        oz: found ? Number(found.total_oz) : 0,
      });
    }

    return result;
  }

  const data = fillMissingDates(waterLogs);

  const total = data.reduce((sum, d) => sum + Number(d.oz), 0);
  const avg = (total / data.length).toFixed(1);

  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const summary = `${currentMonthName}`;

  return (
    <div className="water-page-container">
      <h1 className="text-2xl font-bold mb-6">Water Log</h1>
      <div className="water-progress-container">
        <div className="water-left-column">
          <button onClick={() => navigate("/dashboard")} className="water-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{summary}</p>
        </div>

        <div className="water-right-column">
          <div className="water-droplet-grid">
            {data.map((d) => (
              <DropletRow
                key={d.date}
                label={d.label}
                oz={d.oz}
                isToday={d.date === todayStr}
              />
            ))}
          </div>
          <div className="mt-4">
            <p>
              <strong>Total:</strong> {total} oz
            </p>
            <p>
              <strong>Average:</strong> {avg} oz
            </p>
          </div>
          <div className="mt-6">
            <TipBox category="Water" />
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/progress/WaterProgress.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import { WaterContext } from "../../context/WaterContext";
import "./Progress.css";

// Format date to "Sep 21, 2025"
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Visual row for a single day
function DropletRow({ label, oz, isToday }) {
  const droplets = Math.floor(oz / 8);
  const half = oz % 8 >= 4;
  const totalDroplets = 10;

  return (
    <div className={`droplet-row ${isToday ? "today" : ""}`}>
      <span className="day-label">{label}</span>
      <div className="droplets" aria-hidden>
        {Array.from({ length: totalDroplets }, (_, i) => {
          const fill =
            i < droplets ? "full" : i === droplets && half ? "half" : "empty";
          return (
            <span
              key={i}
              className={`droplet ${fill}`}
              title={`${oz} oz on ${label}`}
            >
              💧
            </span>
          );
        })}
      </div>
      <span className="day-total">{oz} oz</span>
    </div>
  );
}

export default function WaterProgress() {
  const navigate = useNavigate();
  const [range, setRange] = useState("week");
  const [waterLogs, setWaterLogs] = useState([]); // aggregated {date, total_oz}
  const { todayOz, setTodayOz } = useContext(WaterContext) || {};

  // Fetch and aggregate water logs from backend
  useEffect(() => {
    async function fetchAndAggregate() {
      try {
        const res = await fetch("http://localhost:3000/api/water", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch water logs");

        const raw = await res.json(); // [{date, total_oz}, ...]
        // normalize date and convert oz to number
        const aggregated = raw
          .map((row) => ({
            date: row.date.split("T")[0], // remove time
            total_oz: Number(row.total_oz),
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setWaterLogs(aggregated);

        // Update today's context
        const todayStr = new Date().toISOString().split("T")[0];
        const todaySum =
          aggregated.find((l) => l.date === todayStr)?.total_oz || 0;
        if (typeof setTodayOz === "function") setTodayOz(todaySum);
      } catch (err) {
        console.error("fetchAndAggregate error:", err);
      }
    }

    fetchAndAggregate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // Fill missing days for week/month
  function fillMissingDates(logs, length) {
    const result = [];
    for (let i = 0; i < length; i++) {
      const d = new Date();
      if (length === 7) d.setDate(d.getDate() - (6 - i));
      if (length === 30) d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      const found = logs.find((l) => l.date === dateStr);
      result.push({
        date: dateStr,
        label: formatDate(d),
        oz: found ? Number(found.total_oz) : 0,
      });
    }
    return result;
  }

  // Determine data to display
  let data = [];
  if (range === "today") {
    const found = waterLogs.find((l) => l.date === todayStr);
    const initialOz = found ? Number(found.total_oz) : 0;
    const finalOz = typeof todayOz === "number" ? todayOz : initialOz;
    data = [{ date: todayStr, label: formatDate(todayStr), oz: finalOz }];
  } else if (range === "yesterday") {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const dateStr = y.toISOString().split("T")[0];
    const found = waterLogs.find((l) => l.date === dateStr);
    data = [
      {
        date: dateStr,
        label: formatDate(dateStr),
        oz: found ? Number(found.total_oz) : 0,
      },
    ];
  } else if (range === "week") {
    data = fillMissingDates(waterLogs, 7).map((d) =>
      d.date === todayStr
        ? { ...d, oz: typeof todayOz === "number" ? todayOz : d.oz }
        : d
    );
  } else if (range === "month") {
    data = fillMissingDates(waterLogs, 30).map((d) =>
      d.date === todayStr
        ? { ...d, oz: typeof todayOz === "number" ? todayOz : d.oz }
        : d
    );
  }

  const total = data.reduce((sum, d) => sum + Number(d.oz), 0);
  const avg = (total / data.length).toFixed(1);

  let summary = "";
  if (range === "today") summary = `Today you drank ${data[0].oz} oz of water.`;
  else if (range === "yesterday")
    summary = `Yesterday you drank ${data[0].oz} oz of water.`;
  else if (range === "week")
    summary = `In the last 7 days you drank ${total} oz (avg ${avg} oz/day).`;
  else if (range === "month")
    summary = `In the last 30 days you drank ${total} oz (avg ${avg} oz/day).`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Water Progress</h1>
      <div className="progress-container">
        {/* Left navigation */}
        <div className="left-column">
          <button onClick={() => navigate("/dashboard")} className="btn">
            ⬅ Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/progress/water")}
            className="btn btn-water"
          >
            Water
          </button>
          <button
            onClick={() => navigate("/progress/sleep")}
            className="btn btn-sleep"
          >
            Sleep
          </button>
          <button
            onClick={() => navigate("/progress/exercise")}
            className="btn btn-exercise"
          >
            Exercise
          </button>
        </div>

        {/* Right content */}
        <div className="right-column">
          <div className="range-buttons">
            {["today", "yesterday", "week", "month"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={range === r ? "btn-range active" : "btn-range"}
              >
                {r === "week"
                  ? "1 Week"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <p className="font-bold mb-4">{summary}</p>

          <div className="droplet-grid">
            {data.map((d) => (
              <DropletRow
                key={d.date}
                label={d.label}
                oz={d.oz}
                isToday={d.date === todayStr}
              />
            ))}
          </div>

          {(range === "week" || range === "month") && (
            <div className="mt-4">
              <p>
                <strong>Total:</strong> {total} oz
              </p>
              <p>
                <strong>Average:</strong> {avg} oz
              </p>
            </div>
          )}

          <div className="mt-6">
            <TipBox category="Water" />
          </div>
        </div>
      </div>
    </div>
  );
}

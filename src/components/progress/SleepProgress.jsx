import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import "./SleepProgress.css";

// Format date as "Sep 20, 2025"
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format decimal hour to 12-hour AM/PM string
function formatHour(hourDecimal) {
  const h = Math.floor(hourDecimal % 24);
  const m = Math.round((hourDecimal % 1) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// Single day's row
function SleepRow({ day, segments, isToday }) {
  const totalSleepHours = segments
    .reduce((sum, s) => sum + s.duration, 0)
    .toFixed(1);

  const renderSegments = (segs) =>
    segs.map((seg, idx) => {
      const startPct = (Math.max(seg.start, 0) / 24) * 100;
      const widthPct =
        ((Math.min(seg.end, 24) - Math.max(seg.start, 0)) / 24) * 100;
      const color = seg.type === "Sleep" ? "#6FA49C" : "#9BC0B0";
      return (
        <div
          key={idx}
          className="segment"
          style={{
            left: `${startPct}%`,
            width: `${widthPct}%`,
            backgroundColor: color,
          }}
          title={`${seg.type}: ${formatHour(seg.start)} - ${formatHour(
            seg.end
          )}`}
        />
      );
    });

  return (
    <div className={`sleep-row ${isToday ? "today" : ""}`}>
      <span className="day-label">{formatDate(day)}</span>
      <div className="timeline" style={{ height: "22px" }}>
        {renderSegments(segments)}
      </div>
      <span className="total-hours">{totalSleepHours} hrs</span>
    </div>
  );
}

export default function SleepProgress() {
  const navigate = useNavigate();
  const [range, setRange] = useState("week");
  const [sleepLogs, setSleepLogs] = useState([]);

  useEffect(() => {
    async function fetchSleep() {
      try {
        const res = await fetch("http://localhost:3000/api/sleep", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch sleep logs");
        const data = await res.json();
        setSleepLogs(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSleep();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-CA");

  // Prepare rows for selected range
  const days = [];
  let length = 7;
  if (range === "today") length = 1;
  else if (range === "yesterday") length = 1;
  else if (range === "month") length = 30;

  for (let i = 0; i < length; i++) {
    const d = new Date();
    if (range === "yesterday") d.setDate(d.getDate() - 1);
    else if (range === "week" || range === "month")
      d.setDate(d.getDate() - (length - 1 - i));

    const dateStr = d.toLocaleDateString("en-CA"); // ✅ local YYYY-MM-DD

    // Only include logs starting on this local date
    const segments = sleepLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        const logDateStr = logDate.toLocaleDateString("en-CA"); // ✅ local
        return logDateStr === dateStr;
      })
      .map((log) => {
        const [startH, startM] = log.start_time.split(":").map(Number);
        const [endH, endM] = log.end_time.split(":").map(Number);

        let startHour = startH + startM / 60;
        let endHour = endH + endM / 60;
        if (endHour <= startHour) endHour += 24; // overnight

        return {
          start: startHour,
          end: endHour,
          type: log.sleep_type,
          duration:
            endHour - startHour < 0
              ? endHour - startHour + 24
              : endHour - startHour,
        };
      });

    days.push({ day: d, segments });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sleep Progress</h1>
      <div className="progress-container">
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
          <button className="btn btn-sleep">Sleep</button>
          <button
            onClick={() => navigate("/progress/exercise")}
            className="btn btn-exercise"
          >
            Exercise
          </button>
        </div>

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

          <div className="sleep-grid mt-4">
            {days.map((d, idx) => (
              <SleepRow
                key={idx}
                day={d.day}
                segments={d.segments}
                isToday={d.day.toLocaleDateString("en-CA") === todayStr}
              />
            ))}
          </div>

          <div className="mt-6">
            <TipBox category="Sleep" />
          </div>
        </div>
      </div>
    </div>
  );
}

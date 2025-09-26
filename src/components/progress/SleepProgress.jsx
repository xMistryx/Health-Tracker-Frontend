import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import Header from "../navbar/Header.jsx";
import "./SleepProgress.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHour(hourDecimal) {
  const h = Math.floor(hourDecimal % 24);
  const m = Math.round((hourDecimal % 1) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

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

export default function SleepProgress({ initialRange = "week" }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Sleep");
  const [range, setRange] = useState(initialRange);
  const [sleepLogs, setSleepLogs] = useState([]);

  const todayStr = new Date().toLocaleDateString("en-CA");

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

  const rangeLengths = { today: 1, yesterday: 1, week: 7, month: 30 };
  const length = rangeLengths[range] || 7;

  const days = Array.from({ length }, (_, i) => {
    const d = new Date();
    if (range === "yesterday") d.setDate(d.getDate() - 1);
    else if (range === "week" || range === "month")
      d.setDate(d.getDate() - (length - 1 - i));

    const dateStr = d.toLocaleDateString("en-CA");

    const segments = sleepLogs
      .filter(
        (log) => new Date(log.date).toLocaleDateString("en-CA") === dateStr
      )
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
          duration: endHour - startHour,
        };
      });

    return { day: d, segments };
  });

  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">{category} Progress</h1>

      {/* Dropdowns */}
      <div className="filters mb-4 flex gap-4">
        <select
          className="dropdown"
          value={category}
          onChange={(e) => {
            const cat = e.target.value;
            setCategory(cat);
            if (cat === "Water") navigate("/progress/water");
            else if (cat === "Sleep") navigate("/progress/sleep");
            else if (cat === "Exercise") navigate("/progress/exercise");
            else if (cat === "Food") navigate("/progress/food");
          }}
        >
          {["Water", "Sleep", "Exercise", "Food"].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="dropdown"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {["today", "yesterday", "week", "month"].map((r) => (
            <option key={r} value={r}>
              {r === "week" ? "1 Week" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Sleep grid */}
      <div
        className={`sleep-grid ${range === "month" ? "month-view" : ""} mt-4`}
      >
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
  );
}

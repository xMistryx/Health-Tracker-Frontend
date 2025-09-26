import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TipBox from "../tips/TipBox";
import { WaterContext } from "../../context/WaterContext";
import Header from "../navbar/Header.jsx";
import "./Progress.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export default function WaterProgress({ range: initialRange = "week" }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Water");
  const [range, setRange] = useState(initialRange);
  const [waterLogs, setWaterLogs] = useState([]);
  const { todayOz, setTodayOz } = useContext(WaterContext) || {};

  useEffect(() => {
    async function fetchWaterLogs() {
      try {
        const res = await fetch("http://localhost:3000/api/water", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch water logs");

        const raw = await res.json();
        const aggregated = raw
          .map((row) => ({
            date: row.date.split("T")[0],
            total_oz: Number(row.total_oz),
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setWaterLogs(aggregated);

        const todayStr = new Date().toISOString().split("T")[0];
        const todaySum =
          aggregated.find((l) => l.date === todayStr)?.total_oz || 0;
        if (typeof setTodayOz === "function") setTodayOz(todaySum);
      } catch (err) {
        console.error(err);
      }
    }

    fetchWaterLogs();
  }, [setTodayOz]);

  const todayStr = new Date().toISOString().split("T")[0];

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

  let data = [];
  if (range === "today") {
    const found = waterLogs.find((l) => l.date === todayStr);
    const finalOz =
      typeof todayOz === "number" ? todayOz : found?.total_oz || 0;
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
        oz: found ? found.total_oz : 0,
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

  // Navigate on category change
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    if (cat === "Water") navigate("/progress/water");
    else if (cat === "Sleep") navigate("/progress/sleep");
    else if (cat === "Exercise") navigate("/progress/exercise");
    else if (cat === "Food") navigate("/progress/food");
  };

  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">{category} Progress</h1>

      {/* Dropdowns */}
      <div className="filters mb-4 flex gap-4">
        <select
          className="dropdown"
          value={category}
          onChange={handleCategoryChange}
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

      {/* Summary */}
      <p className="font-bold mb-4">{summary}</p>

      {/* Droplet rows */}
      <div className={`droplet-grid ${range === "month" ? "month-view" : ""}`}>
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
  );
}

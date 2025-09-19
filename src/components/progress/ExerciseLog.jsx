// ExerciseLog.jsx
import React, { useState, useEffect } from "react";
import TipBox from "../tips/TipBox";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { faker } from "@faker-js/faker";
import { useNavigate } from "react-router-dom";

import "./Exerciselog.css"; // make sure this path matches where you put the CSS

export default function ExerciseLog() {
  const [range, setRange] = useState("week");
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  // Generate fake exercise logs (oldest -> newest)
  useEffect(() => {
    const days =
      range === "today"
        ? 1
        : range === "yesterday"
        ? 1
        : range === "week"
        ? 7
        : 30;
    const today = new Date();

    const arr = Array.from({ length: days }, (_, i) => {
      // create dates from oldest to newest
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        minutes: faker.number.int({ min: 15, max: 90 }),
      };
    });

    setLogs(arr);
  }, [range]);

  // Today's minutes (last element) and goal for donut
  const todayMinutes = logs.length ? logs[logs.length - 1].minutes : 0;
  const goal = 60;
  const radialData = [
    { name: "Today", value: Math.min(todayMinutes, goal), fill: "#22c55e" },
  ];

  // totals and average
  const total = logs.reduce((s, it) => s + it.minutes, 0);
  const avg = logs.length ? (total / logs.length).toFixed(1) : 0;

  return (
    <div className="progress-page">
      {/* LEFT COLUMN */}
      <div className="left-column">
        <button className="btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        {/* navigate to progress pages - use the exact routes in your App.jsx */}
        <button className="btn" onClick={() => navigate("/progress/water")}>
          Water
        </button>
        <button className="btn" onClick={() => navigate("/progress/sleep")}>
          Sleep
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/progress/exercise")}
        >
          Exercise
        </button>
      </div>

      {/* RIGHT COLUMN */}
      <div className="right-column">
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
          Exercise Progress
        </h1>

        {/* Range buttons */}
        <div className="range-buttons">
          <button
            className={`btn-range ${range === "today" ? "active" : ""}`}
            onClick={() => setRange("today")}
          >
            Today
          </button>
          <button
            className={`btn-range ${range === "yesterday" ? "active" : ""}`}
            onClick={() => setRange("yesterday")}
          >
            Yesterday
          </button>
          <button
            className={`btn-range ${range === "week" ? "active" : ""}`}
            onClick={() => setRange("week")}
          >
            1 Week
          </button>
          <button
            className={`btn-range ${range === "month" ? "active" : ""}`}
            onClick={() => setRange("month")}
          >
            Month
          </button>
        </div>

        {/* Line Chart card (fixed height via CSS) */}
        <div
          className="chart-card"
          role="region"
          aria-label="Exercise line chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut + basic stats in the same row (donut fixed by css) */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div className="donut-card" aria-hidden>
            <ResponsiveContainer width="60%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={radialData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar minAngle={15} clockWise dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {todayMinutes} min
              </div>
              <div style={{ color: "#6b7280" }}>of {goal} min goal</div>
            </div>
          </div>

          <div style={{ minWidth: 200 }}>
            <div style={{ fontWeight: 700 }}>
              Total (
              {range === "month"
                ? "30 days"
                : range === "week"
                ? "7 days"
                : range === "today" || range === "yesterday"
                ? "1 day"
                : ""}
              ):
            </div>
            <div style={{ fontSize: 18 }}>{total} min</div>

            <div style={{ marginTop: 8, fontWeight: 700 }}>Average:</div>
            <div style={{ fontSize: 18 }}>{avg} min/day</div>
            <div className="mt-6">
              <TipBox category="Exercise" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import TipBox from "../tips/TipBox";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { faker } from "@faker-js/faker";

import "./Progress.css";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateFakeSleep(range) {
  const today = new Date();
  if (range === "today") {
    return [
      { day: formatDate(today), hours: faker.number.int({ min: 4, max: 9 }) },
    ];
  }
  if (range === "yesterday") {
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    return [
      { day: formatDate(yest), hours: faker.number.int({ min: 4, max: 9 }) },
    ];
  }
  if (range === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return {
        day: formatDate(d),
        hours: faker.number.int({ min: 4, max: 9 }),
      };
    });
  }
  if (range === "month") {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return {
        day: formatDate(d),
        hours: faker.number.int({ min: 4, max: 9 }),
      };
    });
  }
  return [];
}

export default function SleepLog() {
  const navigate = useNavigate();
  const [range, setRange] = useState("week");
  const data = generateFakeSleep(range);

  const total = data.reduce((sum, d) => sum + d.hours, 0);
  const avg = (total / data.length).toFixed(1);

  let summary = "";
  if (range === "today")
    summary = `Today (${data[0].day}) you slept ${data[0].hours} hours.`;
  else if (range === "yesterday")
    summary = `Yesterday (${data[0].day}) you slept ${data[0].hours} hours.`;
  else if (range === "week")
    summary = `In the last 7 days you slept ${total} hrs (avg ${avg} hrs/day).`;
  else if (range === "month")
    summary = `In the last 30 days you slept ${total} hrs (avg ${avg} hrs/day).`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sleep Progress</h1>
      <div className="progress-container">
        {/* Left column */}
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

        {/* Right column */}
        <div className="right-column">
          <div className="range-buttons">
            <button
              onClick={() => setRange("today")}
              className={range === "today" ? "btn-range active" : "btn-range"}
            >
              Today
            </button>
            <button
              onClick={() => setRange("yesterday")}
              className={
                range === "yesterday" ? "btn-range active" : "btn-range"
              }
            >
              Yesterday
            </button>
            <button
              onClick={() => setRange("week")}
              className={range === "week" ? "btn-range active" : "btn-range"}
            >
              1 Week
            </button>
            <button
              onClick={() => setRange("month")}
              className={range === "month" ? "btn-range active" : "btn-range"}
            >
              Month
            </button>
          </div>

          <p className="font-bold mb-4">{summary}</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {(range === "week" || range === "month") && (
            <div className="mt-4">
              <p>
                <strong>Total:</strong> {total} hrs
              </p>
              <p>
                <strong>Average:</strong> {avg} hrs
              </p>
            </div>
          )}
          <div className="mt-6">
            <TipBox category="Sleep" />
          </div>
        </div>
      </div>
    </div>
  );
}

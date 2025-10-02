import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import SleepForm from "./SleepForm";
import TipBox from "../../tip/Tip";
import SleepTooltip from "./SleepTooltip";
import "./SleepLogs.css";

function SleepRow({ day, segments, isToday }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
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
          className="sleep-segment"
          style={{
            left: `${startPct}%`,
            width: `${widthPct}%`,
            backgroundColor: color,
            cursor: "pointer",
          }}
          onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
        >
          <SleepTooltip
            segment={seg}
            isActive={activeTooltip === idx}
            onClose={() => setActiveTooltip(null)}
          />
        </div>
      );
    });

  return (
    <div className={`sleep-sleep-row ${isToday ? "today" : ""}`}>
      <span className="sleep-day-label">{day.getDate()}</span>
      <div className="sleep-timeline" style={{ height: "22px" }}>
        {renderSegments(segments)}
      </div>
      <span className="sleep-total-hours">{totalSleepHours} hrs</span>
    </div>
  );
}

export default function SleepProgress() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    data: rawSleepLogs,
    loading,
    error,
  } = useQuery("/sleep_logs", "sleep_logs");

  const sleepLogs = rawSleepLogs || [];

  const todayStr = new Date().toLocaleDateString("en-CA");

  if (!token) {
    return (
      <div className="sleep-page-container">
        <h1 className="text-2xl font-bold mb-6">Sleep Log</h1>
        <p>Please sign in to view your sleep logs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sleep-page-container">
        <h1 className="text-2xl font-bold mb-6">Sleep Log</h1>
        <p>Loading sleep logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sleep-page-container">
        <h1 className="text-2xl font-bold mb-6">Sleep Logs</h1>
        <p className="text-red-500">Error loading sleep logs: {error}</p>
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
      const dateStr = d.toLocaleDateString("en-CA");

      const segments = logs
        .filter((log) => {
          const logDate = new Date(log.date);
          const logDateStr = logDate.toLocaleDateString("en-CA");
          return logDateStr === dateStr;
        })
        .map((log) => {
          const startTime = new Date(log.start_time);
          const endTime = new Date(log.end_time);

          const startH = startTime.getHours();
          const startM = startTime.getMinutes();
          const endH = endTime.getHours();
          const endM = endTime.getMinutes();

          let startHour = startH + startM / 60;
          let endHour = endH + endM / 60;
          if (endHour <= startHour) endHour += 24;

          return {
            id: log.id,
            start: startHour,
            end: endHour,
            type: log.sleep_type,
            duration:
              endHour - startHour < 0
                ? endHour - startHour + 24
                : endHour - startHour,
          };
        });

      result.push({ day: d, segments });
    }

    return result;
  }

  const days = fillMissingDates(sleepLogs);

  const totalHours = days.reduce(
    (sum, d) => sum + d.segments.reduce((segSum, s) => segSum + s.duration, 0),
    0
  );
  const avgHours = (totalHours / days.length).toFixed(1);

  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const summary = `${currentMonthName}`;

  return (
    <div className="sleep-page-container">
      <h1 className="sleep">Sleep Log</h1>
      <div className="sleep-progress-container">
        <div className="sleep-left-column">
          <button onClick={() => navigate("/dashboard")} className="sleep-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{summary}</p>
        </div>

        <div className="sleep-right-column">
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
          <SleepForm />
          <div className="sleepinfo">
            <p>
              <strong>Total:</strong> {totalHours.toFixed(1)} hours
            </p>
            <p>
              <strong>Average:</strong> {avgHours} hours
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <TipBox category={["Sleep", "Naps", "Sunlight"]} />
      </div>
    </div>
  );
}

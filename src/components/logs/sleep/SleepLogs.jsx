import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import SleepForm from "./SleepForm";
import TipBox from "../../tip/Tip";
import Encouragement from "../../encouragement/Encouragement";
import "./SleepLogs.css";

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

  return (
    <div className={`sleep-sleep-row ${isToday ? "today" : ""}`}>
      <span className="sleep-day-label">{day.getDate()}</span>
      <div className="sleep-timeline" style={{ height: "22px" }}>
        {segments.map((seg, idx) => {
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
              }}
              title={`${seg.type}: ${formatHour(seg.start)} - ${formatHour(
                seg.end
              )}`}
            />
          );
        })}
      </div>
      <span className="sleep-total-hours">{totalSleepHours} hrs</span>
    </div>
  );
}

export default function SleepLogs() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    data: rawSleepLogs,
    loading,
    error,
  } = useQuery("/sleep_logs", "sleep_logs");

  const [logs, setLogs] = useState(rawSleepLogs || []);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef("");

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  useEffect(() => {
    setLogs(rawSleepLogs || []);
  }, [rawSleepLogs]);

  if (!token) return <p>Please sign in to view your sleep logs.</p>;
  if (loading) return <p>Loading sleep logs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const fillMissingDates = (logsArray) => {
    const result = [];
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toISOString().split("T")[0];

      const segments = logsArray
        .filter((log) => log.date.split("T")[0] === dateStr)
        .map((log) => {
          const startTime = new Date(log.start_time);
          const endTime = new Date(log.end_time);
          let startHour = startTime.getHours() + startTime.getMinutes() / 60;
          let endHour = endTime.getHours() + endTime.getMinutes() / 60;
          if (endHour <= startHour) endHour += 24;

          return {
            start: startHour,
            end: endHour,
            type: log.sleep_type,
            duration: endHour - startHour,
          };
        });

      result.push({ day: d, segments });
    }
    return result;
  };

  const days = fillMissingDates(logs);

  const totalHours = days.reduce(
    (sum, d) => sum + d.segments.reduce((s, seg) => s + seg.duration, 0),
    0
  );
  const avgHours = (totalHours / days.length).toFixed(1);

  // Hardcoded encouragements
  const encouragementMessages = {
    "1Sleep": "Great! You logged your first sleep of the day.",
    "3Sleep": "Nice streak! 3 sleep sessions logged today.",
    "5Sleep": "Keep it up! 5 sessions in a month.",
  };

  const handleSleepAdded = (newLog) => {
    setLogs([...logs, newLog]);

    const sleepsToday = [...logs, newLog].filter(
      (log) => log.date.split("T")[0] === newLog.date.split("T")[0]
    );

    let milestoneKey = null;
    if (sleepsToday.length >= 5) milestoneKey = "5Sleep";
    else if (sleepsToday.length >= 3) milestoneKey = "3Sleep";
    else if (sleepsToday.length >= 1) milestoneKey = "1Sleep";

    if (milestoneKey && lastMilestoneRef.current !== milestoneKey) {
      setToastMessage(encouragementMessages[milestoneKey]);
      lastMilestoneRef.current = milestoneKey;
    }
  };

  const currentMonthName = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="sleep-page-container">
      <h1 className="text-2xl font-bold mb-6">Sleep Log</h1>
      <div className="sleep-progress-container">
        <div className="sleep-left-column">
          <button onClick={() => navigate("/dashboard")} className="sleep-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{currentMonthName}</p>
        </div>
        <div className="sleep-right-column">
          <div className="sleep-grid mt-4">
            {days.map((d, idx) => (
              <SleepRow
                key={idx}
                day={d.day}
                segments={d.segments}
                isToday={d.day.toISOString().split("T")[0] === todayStr}
              />
            ))}
          </div>

          <SleepForm onAdded={handleSleepAdded} />

          <Encouragement
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

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

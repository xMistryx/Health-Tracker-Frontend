import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import useQuery from "../../api/useQuery";
import SleepForm from "./SleepForm";
import TipBox from "../../tip/Tip";
import SleepTooltip from "./SleepTooltip";
import Encouragement from "../../encouragement/Encouragement";
import "./SleepLogs.css";

function SleepRow({ day, segments, isToday }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
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
                cursor: "pointer",
              }}
              onClick={() =>
                setActiveTooltip(activeTooltip === idx ? null : idx)
              }
            >
              <SleepTooltip
                segment={seg}
                isActive={activeTooltip === idx}
                onClose={() => setActiveTooltip(null)}
              />
            </div>
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
    data: rawSleepLogs = [],
    loading,
    error,
  } = useQuery("/sleep_logs", "sleep_logs");
  const { data: encouragements = [] } = useQuery(
    "/encouragements?category=Sleep",
    "encouragements"
  );

  const [sleepLogs, setSleepLogs] = useState([]);
  const [encouragementMsg, setEncouragementMsg] = useState("");
  const triggeredMilestonesRef = useRef(new Set());

  useEffect(() => setSleepLogs(rawSleepLogs), [rawSleepLogs]);

  if (!token) return <p>Please sign in to view your sleep logs.</p>;
  if (loading) return <p>Loading sleep logs...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const todayStr = new Date().toLocaleDateString("en-CA");

  const fillMissingDates = (logs) => {
    const result = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const dateStr = d.toLocaleDateString("en-CA");
      const segments = logs
        .filter(
          (log) => new Date(log.date).toLocaleDateString("en-CA") === dateStr
        )
        .map((log) => {
          const startTime = new Date(log.start_time);
          const endTime = new Date(log.end_time);
          let startHour = startTime.getHours() + startTime.getMinutes() / 60;
          let endHour = endTime.getHours() + endTime.getMinutes() / 60;
          if (endHour <= startHour) endHour += 24;

          return {
            id: log.id,
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

  // --- HANDLE SLEEP ADDED ---
  const handleSleepAdded = (newLog) => {
    // Auto-classify short sleeps (<6 hours / 360 minutes) as Nap
    const logCopy = { ...newLog };
    if (logCopy.sleep_type === "Sleep" && logCopy.duration < 360) {
      logCopy.sleep_type = "Nap";
    }

    setSleepLogs((prevLogs) => {
      const updatedLogs = [...prevLogs, logCopy];
      const logsCount = updatedLogs.length;

      let milestoneKey = null;

      // Type + duration-based milestones
      if (logCopy.sleep_type === "Nap") milestoneKey = "Nap";
      else if (logCopy.sleep_type === "Sleep" && logCopy.duration >= 360)
        milestoneKey = "FullNight";

      // First log
      if (!milestoneKey && logsCount === 1) milestoneKey = "FirstLog";

      // Count-based milestones
      if (!milestoneKey) {
        if (logsCount === 5) milestoneKey = "5Logs";
        else if (logsCount === 10) milestoneKey = "10Logs";
        else if (logsCount === 20) milestoneKey = "20Logs";
      }

      // Trigger encouragement only once per milestone
      if (milestoneKey && !triggeredMilestonesRef.current.has(milestoneKey)) {
        const milestoneEncouragement = encouragements.find(
          (e) => e.category === "Sleep" && e.milestone === milestoneKey
        );
        if (milestoneEncouragement) {
          setEncouragementMsg(milestoneEncouragement.message);
          triggeredMilestonesRef.current.add(milestoneKey);
        }
      }

      return updatedLogs;
    });
  };
  // --- END HANDLE SLEEP ADDED ---

  return (
    <div className="sleep-page-container">
      <h1 className="sleep">Sleep Log</h1>
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
                isToday={d.day.toLocaleDateString("en-CA") === todayStr}
              />
            ))}
          </div>

          <SleepForm onAdded={handleSleepAdded} />

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

      {encouragementMsg && (
        <Encouragement
          message={encouragementMsg}
          onClose={() => setEncouragementMsg("")}
        />
      )}
      <div className="mt-6">
        <TipBox category={["Sleep", "Naps", "Sunlight"]} />
      </div>
    </div>
  );
}

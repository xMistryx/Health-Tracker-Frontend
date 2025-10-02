import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import TipBox from "../../tip/Tip";
import Encouragement from "../../encouragement/Encouragement";
import axios from "axios";
import "./WaterLogs.css";

function DropletRow({ label, oz, date, onToggleWater, isToday }) {
  const totalDroplets = 10;
  const droplets = Math.floor(oz / 8);
  const half = oz % 8 >= 4;

  return (
    <div className={`water-droplet-row ${isToday ? "today-row" : ""}`}>
      <span className="water-day-label">{label}</span>
      <div className="water-droplets" aria-hidden>
        {Array.from({ length: totalDroplets }, (_, i) => {
          let fill = "empty";
          if (i < droplets) fill = "full";
          else if (i === droplets && half) fill = "half";

          return (
            <span
              key={i}
              className={`water-droplet ${fill}`}
              onClick={() => onToggleWater(date, i, fill)}
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
  const [waterLogs, setWaterLogs] = useState([]);
  const [encouragements, setEncouragements] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef("");
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  // Fetch water logs
  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:3000/water_logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data
        .map((row) => ({
          date: row.date.split("T")[0],
          total_oz: Number(row.total_oz),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setWaterLogs(data);
    } catch (err) {
      console.error("Error fetching water logs:", err);
    }
  };

  // Fetch water encouragements from DB
  const fetchEncouragements = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/encouragements?category=Water",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEncouragements(res.data);
      console.log("Water encouragements fetched:", res.data);
    } catch (err) {
      console.error("Error fetching water encouragements:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
      fetchEncouragements();
    }
  }, [token]);

  // Toggle water (add/remove)
  const handleToggleWater = async (date, dropletIndex, fillState) => {
    const amount = fillState === "full" ? -8 : 8;

    setWaterLogs((prev) => {
      const idx = prev.findIndex((d) => d.date === date);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx].total_oz = Math.max(0, updated[idx].total_oz + amount);
      } else {
        updated = [...prev, { date, total_oz: amount > 0 ? amount : 0 }];
      }

      // Determine milestone dynamically from DB data
      const waterToday = updated.find((d) => d.date === date)?.total_oz || 0;
      let milestoneObj = null;
      // Sort encouragements by milestone amount descending
      const sortedEnc = [...encouragements].sort(
        (a, b) => b.milestone - a.milestone || 0
      );
      for (const e of sortedEnc) {
        if (waterToday >= Number(e.milestone.replace("oz", ""))) {
          milestoneObj = e;
          break;
        }
      }

      if (milestoneObj && lastMilestoneRef.current !== milestoneObj.milestone) {
        setToastMessage(milestoneObj.message);
        lastMilestoneRef.current = milestoneObj.milestone;
      }

      return updated;
    });

    try {
      await axios.post(
        "http://localhost:3000/water_logs",
        { date, amount_oz: amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLogs();
    } catch (err) {
      console.error("Error updating water:", err);
    }
  };

  // Fill missing days of the current month
  const fillMissingDates = (logs) => {
    const result = [];
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
  };

  const data = fillMissingDates(waterLogs);
  const total = data.reduce((sum, d) => sum + d.oz, 0);
  const avg = (total / data.length).toFixed(1);
  const currentMonthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!token) return <p>Please sign in to view your water logs.</p>;

  return (
    <div className="water-page-container">
      <h1 className="text-2xl font-bold mb-6">Water Log</h1>
      <div className="water-progress-container">
        <div className="water-left-column">
          <button onClick={() => navigate("/dashboard")} className="water-btn">
            ⬅ Back to Dashboard
          </button>
          <p className="font-bold mb-4">{currentMonthName}</p>
        </div>
        <div className="water-right-column">
          <div className="water-droplet-grid">
            {data.map((d) => (
              <DropletRow
                key={d.date}
                label={d.label}
                oz={d.oz}
                date={d.date}
                onToggleWater={handleToggleWater}
                isToday={d.date === todayStr}
              />
            ))}
          </div>

          <Encouragement
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

          <div className="waterinfo">
            <p>
              <strong>Total:</strong> {total} oz
            </p>
            <p>
              <strong>Average:</strong> {avg} oz
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TipBox category={["Water", "Electrolytes"]} />
      </div>
    </div>
  );
}

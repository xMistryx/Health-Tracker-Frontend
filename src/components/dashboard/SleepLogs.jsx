// src/components/dashboard/SleepLogs.jsx
import React, { useState, useContext, useRef } from "react";
import sleepIcon from "../../assets/images/sleep-icon.jpg";
import { SleepContext } from "../../context/SleepContext.jsx";
import EncouragementToast from "./EncouragementToast.jsx";

export default function SleepLogs({ date, userId }) {
  const [sleepType, setSleepType] = useState("Sleep");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [toastMessage, setToastMessage] = useState(""); // for milestone toast
  const lastMilestoneRef = useRef(""); // track last milestone shown

  const { addSleepLog } = useContext(SleepContext);

  const calculateMinutes = (start, end) => {
    if (!start || !end) return 0;
    let startDate = new Date(`${date}T${start}`);
    let endDate = new Date(`${date}T${end}`);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1); // handle crossing midnight
    return Math.floor((endDate - startDate) / 60000);
  };

  const handleAddSleep = async () => {
    if (!startTime || !endTime) return alert("Enter start and end times");

    const sleepMinutes = calculateMinutes(startTime, endTime);
    setMinutes(sleepMinutes);

    try {
      await addSleepLog({
        date,
        sleep_type: sleepType,
        start_time: startTime,
        end_time: endTime,
        duration: sleepMinutes,
      });

      // Fetch latest Sleep milestone
      const res = await fetch(
        `http://localhost:3000/api/encouragements/all/${userId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        const milestoneData = await res.json();
        const latest = milestoneData.Sleep;
        if (latest && latest !== lastMilestoneRef.current) {
          setToastMessage(latest);
          lastMilestoneRef.current = latest;
        }
      }

      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error(err);
      alert("Error adding sleep log: " + err.message);
    }
  };

  return (
    <div className="sleep-log">
      <img
        src={sleepIcon}
        alt="Sleep"
        style={{ width: "40px", height: "40px" }}
      />
      <select value={sleepType} onChange={(e) => setSleepType(e.target.value)}>
        <option value="Sleep">Sleep</option>
        <option value="Nap">Nap</option>
      </select>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <button className="submit-btn" onClick={handleAddSleep}>
        Add Sleep
      </button>
      {minutes > 0 && <p>Slept {minutes} minutes</p>}

      {/* Toast for latest milestone */}
      <EncouragementToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}

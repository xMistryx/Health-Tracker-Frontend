import React, { useState, useContext, useRef } from "react";
import waterIcon from "../../assets/images/water-icon.png";
import { WaterContext } from "../../context/WaterContext.jsx";
import EncouragementToast from "./EncouragementToast.jsx";

export default function WaterLogs({ date, userId }) {
  const [amount, setAmount] = useState("");
  const { setTodayOz } = useContext(WaterContext);
  const [toastMessage, setToastMessage] = useState("");
  const lastMilestoneRef = useRef("");

  const handleAddWater = async () => {
    if (!amount) return alert("Enter amount!");

    try {
      const res = await fetch("http://localhost:3000/api/water", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date,
          amount_oz: Number(amount),
        }),
      });

      if (res.ok) {
        setTodayOz((prev) => prev + Number(amount));
        setAmount("");

        // ✅ Fetch latest milestone
        const milestoneRes = await fetch(
          `http://localhost:3000/api/encouragements/all/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const milestoneData = await milestoneRes.json();
        const latest = milestoneData.Water;
        if (latest && latest !== lastMilestoneRef.current) {
          setToastMessage(latest);
          lastMilestoneRef.current = latest;
        }

        alert("Water log added!");
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add water log");
    }
  };

  return (
    <div className="water-log">
      <img src={waterIcon} alt="Water" />
      <input
        type="number"
        placeholder="Amount (oz)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleAddWater}>Add</button>

      {/* Toast */}
      <EncouragementToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}

import React, { useState, useContext } from "react";
import waterIcon from "../../assets/images/water-icon.png";
import { WaterContext } from "../../context/WaterContext";

export default function WaterLogs({ date }) {
  const [amount, setAmount] = useState("");
  const { setTodayOz } = useContext(WaterContext); // ✅ context setter

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
        alert("Water log added!");
        setAmount("");

        // ✅ update context so WaterProgress refreshes immediately
        setTodayOz((prev) => prev + Number(amount));
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
    </div>
  );
}

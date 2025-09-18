import React, { useState } from "react";
import waterIcon from "../../assets/images/water-icon.png";

export default function WaterLogs({ date }) {
  const [amount, setAmount] = useState("");

  const handleAddWater = async () => {
    if (!amount) return alert("Enter amount!");

    try {
      const res = await fetch("http://localhost:3000/api/water", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // needed b/c requireUser
        },
        body: JSON.stringify({
          date,
          amount_oz: Number(amount), // ✅ must match backend column name
        }),
      });

      if (res.ok) {
        alert("Water log added!");
        setAmount(""); // clear input
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

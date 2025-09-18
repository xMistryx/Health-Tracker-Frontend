import React, { useState } from "react";
import waterIcon from "../../assets/images/water-icon.png";

export default function WaterLogs({ date }) {
  const [amount, setAmount] = useState("");

  return (
    <div className="water-log">
      {/* Left Icon */}
      <img src={waterIcon} alt="Water" />

      {/* Input */}
      <input
        type="number"
        placeholder="Amount (oz)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
  );
}

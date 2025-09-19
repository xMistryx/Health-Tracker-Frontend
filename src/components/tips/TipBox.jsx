import React, { useState, useEffect } from "react";
import { tips } from "./tips"; // import your static tips

export default function TipBox({ category }) {
  const [tip, setTip] = useState("");

  useEffect(() => {
    if (!category) category = "General"; // fallback category
    const categoryTips = tips[category] || tips.General;

    // Pick a random tip from the selected category
    const randomIndex = Math.floor(Math.random() * categoryTips.length);
    setTip(categoryTips[randomIndex]);
  }, [category]);

  return (
    <div
      style={{
        background: "#f0f4f8",
        padding: "12px 16px",
        borderRadius: "8px",
        marginTop: "12px",
        fontSize: "14px",
        color: "#1f2937",
        maxWidth: "400px",
      }}
    >
      💡 {tip}
    </div>
  );
}

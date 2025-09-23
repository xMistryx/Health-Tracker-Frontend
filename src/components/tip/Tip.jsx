import React, { useState, useEffect } from "react";
import useQuery from "../api/useQuery";
import "./tip.css";

export default function TipBox({ category = "water" }) {
  const [tip, setTip] = useState("");

  // Fetch tips from API using the correct route format
  const { data, loading, error } = useQuery(
    `/health_tips/category/${category}`,
    `tips-${category}`
  );

  useEffect(() => {
    if (data && data.length > 0) {
      // Pick a random tip from the API data
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedTip =
        typeof data[randomIndex] === "string"
          ? data[randomIndex]
          : data[randomIndex]?.tip ||
            data[randomIndex]?.content ||
            data[randomIndex]?.message;

      setTip(selectedTip);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="tip-box">
        <p>💡 Loading tip...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tip-box">
        <p>💡 Unable to load tips at the moment.</p>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="tip-box">
        <p>💡 No tips available for this category.</p>
      </div>
    );
  }

  return (
    <div className="tip-box">
      <p>
        💡 <strong>Tip:</strong> {tip}
      </p>
    </div>
  );
}

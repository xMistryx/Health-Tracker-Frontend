import React, { useState, useEffect, useMemo } from "react";
import useQuery from "../api/useQuery";
import "./tip.css";

export default function TipBox({ category = "water" }) {
  const [tip, setTip] = useState("");

  const cleanText = (text) => {
    if (!text) return text;
    return text
      .replace(/\u00e2\u20ac\u201d/g, " — ") 
      .replace(/â€"/g, " — ") 
      .replace(/â€™/g, "'") 
      .replace(/â€œ/g, '"') 
      .replace(/â€/g, '"') 
      .replace(/â€"/g, "—")
      .replace(/â€"/g, "–") 
      .replace(/""/g, " — ") 
      .replace(/Â/g, ""); 
  };

  const selectedCategory = useMemo(() => {
    const categories = Array.isArray(category) ? category : [category];
    return categories[Math.floor(Math.random() * categories.length)];
  }, [category]);

  const { data, loading, error } = useQuery(
    `/health_tips/category/${selectedCategory}`,
    `tips-${selectedCategory}`
  );

  useEffect(() => {
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedTip =
        typeof data[randomIndex] === "string"
          ? data[randomIndex]
          : data[randomIndex]?.tip ||
            data[randomIndex]?.content ||
            data[randomIndex]?.message;

      setTip(cleanText(selectedTip));
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

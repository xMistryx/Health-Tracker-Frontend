import React, { useState, useEffect } from "react";
import useQuery from "../api/useQuery";

export default function AffirmationBox() {
  const [affirmation, setAffirmation] = useState("");

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

  const { data, loading, error } = useQuery(`/affirmations`, `affirmations`);

  useEffect(() => {
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const selectedAffirmation =
        typeof data[randomIndex] === "string"
          ? data[randomIndex]
          : data[randomIndex]?.message;

      setAffirmation(cleanText(selectedAffirmation));
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ fontSize: "1em", textAlign: "center" }} className="affirmation-box">
        <p>Loading affirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontSize: "1em", textAlign: "center" }} className="affirmation-box">
        <p>Unable to load affirmations at the moment.</p>
      </div>
    );
  }

  if (!affirmation) {
    return (
      <div style={{ fontSize: "1em", textAlign: "center" }} className="affirmation-box">
        <p>No affirmations available.</p>
      </div>
    );
  }

  return (
    <div style={{ fontSize: "1em", textAlign: "center" }} className="affirmation-box">
      <p>
        {affirmation}
      </p>
    </div>
  );
}
